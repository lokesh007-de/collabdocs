"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import type { WebrtcProvider } from "y-webrtc";
import type { Doc } from "yjs";
import Toolbar from "@/components/Toolbar";

const starterSpecContent = `
  <h1>Q3 Product Architecture &amp; Spec</h1>
  <p>This document establishes the next-generation synchronization fabric for CollabDocs. As collaborative concurrency grows past 100 simultaneous active writers per document, our state pipeline shifts from naive centralized locking to an event-driven <a href="https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type">Hybrid Conflict-Free Replicated Data Type (CRDT)</a> mesh paired with WebRTC-first peer connections.</p>
  <blockquote><strong>Key Objective: Low-Latency Settlement</strong><br />Achieve sub-50ms deterministic state convergence across multi-region geographic zones while guaranteeing zero keystroke loss during transient client packet disconnection.</blockquote>
  <h2>1. Core Architectural Pillars</h2>
  <p>Every user keystroke translates to a granular delta block. The client runtime schedules sync updates through the WebSocket and WebRTC engine, which evaluates parent sequence vectors before mutating memory trees.</p>
  <h2>2. Distributed State Propagation</h2>
  <p>To sustain sub-frame render times, garbage collection sweeps tombstoned nodes asynchronously. This ensures the main rendering pipeline remains unblocked even under high collaborative turbulence.</p>
  <ul><li>Fractional-index CRDT algorithm</li><li>WebRTC edge mesh fallback</li><li>Encrypted document snapshots</li></ul>
  <h2>3. Implementation Checklist</h2>
  <p>Track sprint deliverable readiness leading into the multi-region cutover. Changes made here are synchronized live with other open tabs in this room.</p>
`;

export default function Editor({
  docId,
  documentTitle,
  provider,
  ydoc,
  currentUser,
}: {
  docId: string;
  documentTitle: string;
  provider: WebrtcProvider;
  ydoc: Doc;
  currentUser: { name: string; color: string };
}) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        history: false, // Required when using TipTap Collaboration
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: currentUser.name,
          color: currentUser.color,
        },
      }),
    ],
    [provider, ydoc, currentUser]
  );

  const editor = useEditor(
    {
      extensions,
      content: "",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "focus:outline-none min-h-[480px]",
          "aria-label": "Collaborative document editor",
        },
      },
    },
    [extensions]
  );

  useEffect(() => {
    if (!editor) return;

    let cancelled = false;

    const seedIfEmpty = () => {
      if (cancelled) return;
      const fragment = ydoc.getXmlFragment("default");
      if (fragment.length === 0) {
        if (docId.startsWith("doc-") || docId === "new") {
          editor.commands.setContent(
            `<h1>${documentTitle}</h1><p>Start collaborating with your team in real time. Invite teammates using the Share button above.</p>`
          );
        } else {
          editor.commands.setContent(starterSpecContent);
        }
      }
    };

    // Give WebRTC peer sync a brief moment to receive updates before seeding default text
    const timeout = window.setTimeout(seedIfEmpty, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [docId, documentTitle, editor, ydoc]);

  return (
    <div className="flex flex-col">
      {/* Sticky Editor Formatting Ribbon */}
      <div className="rounded-t-2xl overflow-hidden border border-b-0 border-outline-variant/40 shadow-xs">
        <Toolbar editor={editor} />
      </div>

      {/* Main Document Canvas Sheet */}
      <article className="rounded-b-2xl border border-outline-variant/40 bg-white px-6 py-10 shadow-docked sm:px-12 sm:py-14 md:px-16">
        <header className="mb-8 border-b border-outline-variant/30 pb-6">
          <div className="mb-3.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-fixed px-3 py-0.5 text-[11px] font-semibold text-primary">
              Public Team Access
            </span>
            <span className="text-xs text-secondary">
              • Current writer: <strong className="font-semibold text-on-surface">{currentUser.name}</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
            <span>▤ 1,420 words</span>
            <span>•</span>
            <span>◷ 6 min read</span>
            <span>•</span>
            <span className="font-medium text-primary">v2.4-draft</span>
          </div>
        </header>

        <EditorContent editor={editor} />

        <footer className="mt-10 pt-6 border-t border-outline-variant/30">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-xs text-secondary">
            <span>
              <kbd className="rounded border border-outline-variant/80 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
                /
              </kbd>{" "}
              Press &apos;/&apos; for quick commands and blocks
            </span>
            <span className="hidden sm:inline">Markdown shortcuts supported</span>
          </div>
          <p className="mt-3 truncate text-[11px] text-secondary/60">
            Room: <code className="font-mono text-secondary">collabdocs-{docId}</code>
          </p>
        </footer>
      </article>
    </div>
  );
}
