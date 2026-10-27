import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { parse as parseCookies } from "cookie";
import { verifyToken, JwtPayload } from "../lib/jwt";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";

// ── Protocol Message Types ────────────────────────────────────────────────────
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthenticatedSocket extends WebSocket {
  userId: string;
  userName: string;
  docId: string;
  isReadOnly: boolean;
}

interface DocRoom {
  ydoc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients: Set<AuthenticatedSocket>;
  persistTimer: ReturnType<typeof setTimeout> | null;
  snapshotTimer: ReturnType<typeof setInterval> | null;
}

// ── Room registry ─────────────────────────────────────────────────────────────
const rooms = new Map<string, DocRoom>();

// ── Permission check ──────────────────────────────────────────────────────────
async function getDocRole(
  docId: string,
  userId: string
): Promise<"OWNER" | Role | null> {
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: { ownerId: true },
  });
  if (!doc) return null;
  if (doc.ownerId === userId) return "OWNER";

  const collab = await prisma.collaborator.findUnique({
    where: { docId_userId: { docId, userId } },
    select: { role: true },
  });
  return collab?.role ?? null;
}

// ── Persist Yjs state to DB (debounced) ───────────────────────────────────────
const DEBOUNCE_MS = 2000;
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function schedulePersist(docId: string, room: DocRoom): void {
  if (room.persistTimer) clearTimeout(room.persistTimer);
  room.persistTimer = setTimeout(async () => {
    room.persistTimer = null;
    try {
      const state = Y.encodeStateAsUpdate(room.ydoc);
      await prisma.document.update({
        where: { id: docId },
        data: { yjsState: Buffer.from(state) },
      });
    } catch (err) {
      console.error(`[WS] Failed to persist doc ${docId}:`, err);
    }
  }, DEBOUNCE_MS);
}

async function saveSnapshot(docId: string, ydoc: Y.Doc): Promise<void> {
  try {
    const state = Y.encodeStateAsUpdate(ydoc);
    await prisma.version.create({
      data: {
        docId,
        snapshot: Buffer.from(state),
        label: "Auto-snapshot",
      },
    });
  } catch (err) {
    console.error(`[WS] Auto-snapshot failed for doc ${docId}:`, err);
  }
}

// ── JWT extraction from HTTP upgrade request ───────────────────────────────────
function extractToken(req: IncomingMessage): string | null {
  // 1. Try cookie (preferred for browser clients)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    if (cookies.token) return cookies.token;
  }

  // 2. Try query param fallback: ws://...?token=xxx
  const url = new URL(req.url ?? "/", "http://localhost");
  const queryToken = url.searchParams.get("token");
  if (queryToken) return queryToken;

  return null;
}

// ── Broadcast to room peers ───────────────────────────────────────────────────
function broadcastToRoom(
  room: DocRoom,
  message: Uint8Array,
  exclude?: AuthenticatedSocket
): void {
  for (const client of room.clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// ── Room management ───────────────────────────────────────────────────────────
async function getOrCreateRoom(docId: string): Promise<DocRoom> {
  if (rooms.has(docId)) return rooms.get(docId)!;

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);
  awareness.setLocalState(null);

  // Load persisted state from database if available
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: { yjsState: true },
  });

  if (doc?.yjsState) {
    Y.applyUpdate(ydoc, doc.yjsState);
  }

  const room: DocRoom = {
    ydoc,
    awareness,
    clients: new Set(),
    persistTimer: null,
    snapshotTimer: null,
  };

  // Broadcast doc updates to peers and debounce persistence
  ydoc.on("update", (update: Uint8Array, origin: unknown) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    broadcastToRoom(room, message, origin as AuthenticatedSocket);
    schedulePersist(docId, room);
  });

  // Broadcast awareness changes (presence & cursor positions)
  awareness.on(
    "update",
    (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => {
      const changedClients = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);
      broadcastToRoom(room, buff, origin as AuthenticatedSocket);
    }
  );

  // Periodic auto-snapshot every 5 minutes if room has active clients
  room.snapshotTimer = setInterval(() => {
    if (room.clients.size > 0) {
      saveSnapshot(docId, ydoc);
    }
  }, SNAPSHOT_INTERVAL_MS);

  rooms.set(docId, room);
  return room;
}

function cleanupRoom(docId: string, room: DocRoom): void {
  if (room.clients.size === 0) {
    if (room.persistTimer) clearTimeout(room.persistTimer);
    if (room.snapshotTimer) clearInterval(room.snapshotTimer);
    room.awareness.destroy();
    room.ydoc.destroy();
    rooms.delete(docId);
  }
}

// ── WebSocket server setup ────────────────────────────────────────────────────
export function createWsServer(server: import("http").Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (rawWs: WebSocket, req: IncomingMessage) => {
    // 1. Extract and verify JWT
    const token = extractToken(req);
    if (!token) {
      rawWs.close(4001, "Authentication required");
      return;
    }

    let userPayload: JwtPayload;
    try {
      userPayload = verifyToken(token);
    } catch {
      rawWs.close(4001, "Invalid or expired token");
      return;
    }

    // 2. Extract docId from query string
    const url = new URL(req.url ?? "/", "http://localhost");
    const docId = url.searchParams.get("docId");
    if (!docId) {
      rawWs.close(4002, "docId query parameter required");
      return;
    }

    // 3. Check document permissions
    const role = await getDocRole(docId, userPayload.sub);
    if (!role) {
      rawWs.close(4003, "Access denied");
      return;
    }

    const isReadOnly = role === "VIEWER";

    // 4. Type-cast and annotate the socket
    const ws = rawWs as AuthenticatedSocket;
    ws.userId = userPayload.sub;
    ws.userName = userPayload.name;
    ws.docId = docId;
    ws.isReadOnly = isReadOnly;

    // 5. Join the room
    const room = await getOrCreateRoom(docId);
    room.clients.add(ws);

    // 6. Initiate sync step 1: send to client
    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, room.ydoc);
    ws.send(encoding.toUint8Array(syncEncoder));

    // Send existing awareness states to new client
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    // 7. Handle incoming binary messages from y-websocket client
    ws.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const raw = Buffer.isBuffer(data)
          ? data
          : Array.isArray(data)
          ? Buffer.concat(data)
          : Buffer.from(data);
        const uint8 = new Uint8Array(raw);
        const decoder = decoding.createDecoder(uint8);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case MESSAGE_SYNC: {
            const syncMessageType = decoding.peekVarUint(decoder);
            // If read-only, block update mutations
            if (ws.isReadOnly && syncMessageType === syncProtocol.messageYjsUpdate) {
              break;
            }

            const replyEncoder = encoding.createEncoder();
            encoding.writeVarUint(replyEncoder, MESSAGE_SYNC);
            syncProtocol.readSyncMessage(decoder, replyEncoder, room.ydoc, ws);
            if (encoding.length(replyEncoder) > 1) {
              ws.send(encoding.toUint8Array(replyEncoder));
            }
            break;
          }
          case MESSAGE_AWARENESS: {
            awarenessProtocol.applyAwarenessUpdate(
              room.awareness,
              decoding.readVarUint8Array(decoder),
              ws
            );
            break;
          }
        }
      } catch (err) {
        console.error(`[WS] Error processing message for doc ${docId}:`, err);
      }
    });

    // 8. Handle disconnection
    ws.on("close", () => {
      room.clients.delete(ws);
      cleanupRoom(docId, room);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Socket error for user ${ws.userId}:`, err);
      room.clients.delete(ws);
      cleanupRoom(docId, room);
    });
  });

  return wss;
}
