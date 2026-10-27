"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Check,
  CircleHelp,
  MessageSquare,
  MoreHorizontal,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PresenceAvatars from "@/components/PresenceAvatars";
import ShareModal from "@/components/ShareModal";
import {
  editorCollaborators,
  getSessionCollaborator,
  getStoredDocuments,
} from "@/lib/mockDocs";

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
  const [currentUser] = useState<Peer>(() => getSessionCollaborator());
  const [title] = useState<string>(() => {
    const docs = getStoredDocuments();
    const found = docs.find((item) => item.id === docId);
    if (found) return found.title;
    if (docId === "new") return "Untitled document";
    return docId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [room, setRoom] = useState<{ provider: WebrtcProvider; ydoc: Y.Doc } | null>(null);
  const [peers, setPeers] = useState<Peer[]>(editorCollaborators);
  const [roomError, setRoomError] = useState("");
  const [commentList, setCommentList] = useState<CommentItem[]>(initialComments);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    let provider: WebrtcProvider | null = null;
    let updatePeers: (() => void) | null = null;
    const ydoc = new Y.Doc();
    let active = true;

    import("y-webrtc")
      .then(({ WebrtcProvider: Provider }) => {
        if (!active) {
          ydoc.destroy();
          return;
        }

        const roomName = `collabdocs-${docId}`;
        provider = new Provider(roomName, ydoc, {
          signaling: [
            "wss://signaling.yjs.dev",
            "wss://y-webrtc-signaling-eu.herokuapp.com",
            "wss://y-webrtc-signaling-us.herokuapp.com",
          ],
        });

        // Announce current user awareness to room
        const sessionUser = getSessionCollaborator();
        provider.awareness.setLocalStateField("user", {
          name: sessionUser.name,
          color: sessionUser.color,
        });

        updatePeers = () => {
          const live = Array.from(provider?.awareness.getStates().values() ?? []).flatMap(
            (state) => {
              const u = state.user;
              if (!u || typeof u !== "object") return [];
              const rec = u as { name?: unknown; color?: unknown };
              if (typeof rec.name !== "string" || typeof rec.color !== "string") return [];
              const initials = rec.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return [{ name: rec.name, color: rec.color, initials }];
            }
          );
          setPeers(live.length ? live : [sessionUser]);
        };

        provider.awareness.on("change", updatePeers);
        setRoom({ provider, ydoc });
        updatePeers();
      })
      .catch((error: unknown) => {
        console.error("Unable to start collaborative room", error);
        if (active) {
          setRoomError("Unable to initialize real-time mesh. Working offline.");
        }
      });

    return () => {
      active = false;
      if (provider) {
        if (updatePeers) provider.awareness.off("change", updatePeers);
        provider.destroy();
      }
      ydoc.destroy();
    };
  }, [docId]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      name: currentUser.name,
      initials: currentUser.initials,
      color: currentUser.color,
      time: "Just now",
      text: commentInput.trim(),
    };

    setCommentList((prev) => [...prev, newComment]);
    setCommentInput("");
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
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
            {/* Center Editorial Stage: Elevated Paper Sheet on Canvas */}
            <section className="w-full min-w-0 max-w-[880px]">
              {room ? (
                <Editor
                  docId={docId}
                  documentTitle={title}
                  provider={room.provider}
                  ydoc={room.ydoc}
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
                    Connecting to collaborative room...
                  </span>
                </div>
              )}
            </section>

            {/* Contextual Collaboration Drawer */}
            <aside className="hidden w-[320px] shrink-0 space-y-4 pl-8 xl:block">
              {/* Anchored Comments Panel */}
              <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-xs">
                <header className="flex items-center justify-between border-b border-outline-variant/40 px-4 py-3 bg-surface-container-low/40">
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                    <MessageSquare size={14} className="text-primary" /> Anchored to Block §2
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
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {item.text}
                        </p>
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
                    <li
                      key={`${peer.name}-${index}`}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
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
                        {["Typing in §2", "Reviewing §3", "Selecting text", "Commenting"][index % 4]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Version History Card */}
              <section className="rounded-2xl border border-outline-variant/50 bg-white p-4 text-xs text-secondary shadow-xs">
                <p className="flex items-center gap-2 font-semibold text-on-surface">
                  <ShieldCheck size={14} className="text-primary" /> Version history
                </p>
                <div className="mt-3 space-y-2.5 border-b border-outline-variant/30 pb-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-on-surface">Current version</span>
                    <span className="text-[11px] text-primary font-medium">Just now</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Architecture RFC v2.3</span>
                    <span className="text-[11px]">Yesterday</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Initial seed draft</span>
                    <span className="text-[11px]">Oct 12</span>
                  </div>
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
      />
    </div>
  );
}
