"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Check,
  CircleHelp,
  MessageSquare,
  MoreHorizontal,
  PlusCircle,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import * as Y from "yjs";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PresenceAvatars from "@/components/PresenceAvatars";
import ShareModal from "@/components/ShareModal";
import { docsApi, versionsApi, getWsUrl, type ApiVersion } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

// Dynamically import Editor to avoid SSR issues with Yjs / WebsocketProvider
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

type Peer = { name: string; initials: string; color: string };

type CommentItem = {
  id: string;
  name: string;
  initials: string;
  color: string;
  time: string;
  text: string;
};

const PEER_COLORS = [
  "#f87171", "#34d399", "#60a5fa", "#a78bfa",
  "#fb923c", "#4ade80", "#38bdf8", "#c084fc",
];

function colorForUser(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PEER_COLORS[Math.abs(hash) % PEER_COLORS.length];
}

function initialsFor(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const initialComments: CommentItem[] = [
  {
    id: "c1",
    name: "Maya Lin",
    initials: "ML",
    color: "#a78bfa",
    time: "12m ago",
    text: "Should we benchmark Yjs against Automerge 2.0 for memory consumption on 500+ page docs?",
  },
  {
    id: "c2",
    name: "Alex Rivera",
    initials: "AR",
    color: "#f87171",
    time: "4m ago",
    text: "Agreed. I added this item to our checklist and will execute the suite tomorrow morning.",
  },
];

export default function EditorWorkspace({ docId }: { docId: string }) {
  const { user } = useAuth();

  const currentUser: Peer = user
    ? { name: user.name, initials: initialsFor(user.name), color: colorForUser(user.name) }
    : { name: "Anonymous", initials: "AN", color: "#94a3b8" };

  const [title, setTitle] = useState("Loading…");
  const [shareOpen, setShareOpen] = useState(false);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wsProvider, setWsProvider] = useState<any | null>(null);
  const [peers, setPeers] = useState<Peer[]>([currentUser]);
  const [roomError, setRoomError] = useState("");
  const [commentList, setCommentList] = useState<CommentItem[]>(initialComments);
  const [commentInput, setCommentInput] = useState("");
  const [versions, setVersions] = useState<ApiVersion[]>([]);
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionMsg, setVersionMsg] = useState("");

  // Load document metadata
  useEffect(() => {
    docsApi.get(docId)
      .then((doc) => setTitle(doc.title))
      .catch(() => setTitle(docId));
  }, [docId]);

  // Load version history
  const loadVersions = useCallback(async () => {
    try {
      const vList = await versionsApi.list(docId);
      setVersions(vList);
    } catch {
      // non-fatal
    }
  }, [docId]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  // Set up Yjs + WebsocketProvider
  useEffect(() => {
    let active = true;
    let provider: { destroy: () => void; awareness: { on: (e: string, cb: () => void) => void; off: (e: string, cb: () => void) => void; setLocalStateField: (k: string, v: unknown) => void; getStates: () => Map<number, Record<string, unknown>> } } | null = null;
    const doc = new Y.Doc();

    import("y-websocket").then(({ WebsocketProvider }) => {
      if (!active) { doc.destroy(); return; }

      const wsUrl = getWsUrl(docId);
      provider = new WebsocketProvider(wsUrl, docId, doc);

      // Set local awareness (name + color for cursors)
      provider.awareness.setLocalStateField("user", {
        name: currentUser.name,
        color: currentUser.color,
      });

      const updatePeers = () => {
        const live = Array.from(provider!.awareness.getStates().values()).flatMap((state) => {
          const u = (state as Record<string, unknown>).user;
          if (!u || typeof u !== "object") return [];
          const rec = u as { name?: unknown; color?: unknown };
          if (typeof rec.name !== "string" || typeof rec.color !== "string") return [];
          return [{
            name: rec.name,
            initials: initialsFor(rec.name),
            color: rec.color,
          }];
        });
        setPeers(live.length ? live : [currentUser]);
      };

      provider.awareness.on("change", updatePeers);
      updatePeers();

      setYdoc(doc);
      setWsProvider(provider);
    }).catch((err: unknown) => {
      console.error("WebSocket provider error:", err);
      if (active) setRoomError("Unable to connect to real-time server. Working offline.");
    });

    return () => {
      active = false;
      if (provider) {
        provider.destroy();
      }
      doc.destroy();
      setYdoc(null);
      setWsProvider(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentList((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: currentUser.name,
        initials: currentUser.initials,
        color: currentUser.color,
        time: "Just now",
        text: commentInput.trim(),
      },
    ]);
    setCommentInput("");
  };

  const handleSaveVersion = async () => {
    setSavingVersion(true);
    setVersionMsg("");
    try {
      await versionsApi.save(docId, `Manual save — ${new Date().toLocaleString()}`);
      setVersionMsg("Snapshot saved ✓");
      await loadVersions();
    } catch {
      setVersionMsg("Failed to save snapshot.");
    } finally {
      setSavingVersion(false);
      setTimeout(() => setVersionMsg(""), 3000);
    }
  };

  const handleRestoreVersion = async (vId: string) => {
    if (!confirm("Restore this version? The current state will be saved first.")) return;
    try {
      await versionsApi.restore(docId, vId);
      setVersionMsg("Restored! Reconnecting…");
      // Force a full page reload so the WS reconnects with fresh state
      window.location.reload();
    } catch {
      setVersionMsg("Failed to restore version.");
    }
  };

  const handleCreateDoc = async () => {
    try {
      const doc = await docsApi.create("Untitled Document");
      window.location.href = `/doc/${doc.id}`;
    } catch { /* ignore */ }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar onCreateDoc={handleCreateDoc} />
      <div className="min-w-0 flex-1">
        <TopBar
          title={title}
          onShare={() => setShareOpen(true)}
          collaborators={peers}
        />

        <main className="bg-surface min-h-[calc(100vh-62px)]">
          {/* Mobile Presence Header */}
          <div className="border-b border-outline-variant/40 bg-white px-4 py-2 md:hidden">
            <PresenceAvatars collaborators={peers} />
          </div>

          <div className="mx-auto flex max-w-[1600px] justify-center px-4 py-6 md:px-8">
            {/* Center Editorial Stage */}
            <section className="w-full min-w-0 max-w-[880px]">
              {ydoc && wsProvider ? (
                <Editor
                  docId={docId}
                  documentTitle={title}
                  provider={wsProvider}
                  ydoc={ydoc}
                  currentUser={currentUser}
                />
              ) : roomError ? (
                <div role="alert" className="m-8 rounded-xl border border-error/20 bg-error-container/40 p-5 text-sm text-on-error-container">
                  {roomError}
                </div>
              ) : (
                <div className="flex h-96 items-center justify-center rounded-2xl border border-outline-variant/40 bg-white shadow-docked">
                  <span className="flex items-center gap-2 text-xs text-secondary animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-primary-container animate-ping" />
                    Connecting to collaborative room…
                  </span>
                </div>
              )}
            </section>

            {/* Contextual Collaboration Drawer */}
            <aside className="hidden w-[320px] shrink-0 space-y-4 pl-8 xl:block">
              {/* Comments Panel */}
              <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-xs">
                <header className="flex items-center justify-between border-b border-outline-variant/40 px-4 py-3 bg-surface-container-low/40">
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <MessageSquare size={14} className="text-primary" /> Comments
                  </div>
                  <MoreHorizontal size={16} className="text-secondary" />
                </header>
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto px-4 py-3.5">
                  {commentList.map((item) => (
                    <div key={item.id} className="flex gap-2.5">
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-semibold text-on-surface">{item.name}</p>
                          <span className="text-[10px] text-secondary">{item.time}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="flex items-center gap-2 border-t border-outline-variant/40 p-3 bg-white"
                  onSubmit={handleSendComment}
                >
                  <input
                    aria-label="Add a comment"
                    value={commentInput}
                    onChange={(event) => setCommentInput(event.target.value)}
                    placeholder="Reply or mention @..."
                    className="min-w-0 flex-1 rounded-xl bg-surface-container-low px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-container/20 placeholder:text-secondary"
                  />
                  <button
                    aria-label="Send comment"
                    className="rounded-xl p-2 text-primary hover:bg-primary-fixed transition-colors disabled:opacity-40"
                    type="submit"
                    disabled={!commentInput.trim()}
                  >
                    <Send size={15} />
                  </button>
                </form>
              </section>

              {/* Active in Document Panel */}
              <section className="rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-xs">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <Activity size={14} className="text-primary" /> Active in Document
                  </h2>
                  <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-medium text-secondary">
                    {peers.length} active
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {peers.map((peer, index) => (
                    <li key={`${peer.name}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full ring-2 ring-white shrink-0"
                          style={{ backgroundColor: peer.color }}
                        />
                        <span className="truncate font-medium text-on-surface">
                          {peer.name} {peer.name === currentUser.name && "(You)"}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-secondary">
                        {["Typing", "Reviewing", "Selecting", "Commenting"][index % 4]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Version History Panel */}
              <section className="rounded-2xl border border-outline-variant/50 bg-white p-4 text-xs text-secondary shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <p className="flex items-center gap-2 font-semibold text-on-surface">
                    <ShieldCheck size={14} className="text-primary" /> Version history
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveVersion}
                    disabled={savingVersion}
                    title="Save snapshot"
                    className="flex items-center gap-1 rounded-lg border border-outline-variant/50 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary-fixed transition-colors disabled:opacity-50"
                  >
                    <PlusCircle size={12} /> Save
                  </button>
                </div>

                {versionMsg && (
                  <p className="mb-2 text-[11px] font-medium text-emerald-600">{versionMsg}</p>
                )}

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {versions.length === 0 ? (
                    <p className="text-[11px] text-secondary/70 italic">No saved versions yet.</p>
                  ) : (
                    versions.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-outline-variant/20 last:border-0">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-on-surface">{v.label ?? "Snapshot"}</p>
                          <p className="text-[10px] text-secondary">{new Date(v.createdAt).toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreVersion(v.id)}
                          title="Restore this version"
                          className="shrink-0 rounded-lg p-1 text-secondary hover:text-primary hover:bg-primary-fixed transition-colors"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Check size={13} className="text-emerald-500" /> Live auto-save active{" "}
                  <CircleHelp size={13} className="ml-auto text-secondary/60" />
                </p>
              </section>
            </aside>
          </div>
        </main>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        documentTitle={title}
        docId={docId}
      />
    </div>
  );
}
