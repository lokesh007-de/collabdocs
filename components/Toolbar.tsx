"use client";

import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  Underline as UnderlineIcon,
  Undo2,
  Redo2,
} from "lucide-react";

export default function Toolbar({ editor }: { editor: Editor | null }) {
  const action = (
    label: string,
    icon: ReactNode,
    run: () => void,
    active = false
  ) => (
    <button
      key={label}
      type="button"
      aria-label={label}
      title={label}
      disabled={!editor}
      onClick={run}
      className={`grid h-8 w-8 place-items-center rounded-md transition ${
        active
          ? "bg-primary-fixed text-primary shadow-xs font-semibold"
          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
      } disabled:opacity-40`}
    >
      {icon}
    </button>
  );

  const toggleLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const getHeadingValue = () => {
    if (!editor) return "p";
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "p";
  };

  return (
    <div className="sticky top-[62px] z-20 flex min-h-[48px] items-center gap-1 overflow-x-auto border-b border-outline-variant/40 bg-white px-3 md:px-6">
      <div className="mr-1.5 flex shrink-0 items-center gap-0.5 border-r border-outline-variant/50 pr-2 text-xs text-secondary">
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().undo().run()}
          className="rounded p-1.5 hover:bg-surface-container-low disabled:opacity-40"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          disabled={!editor}
          onClick={() => editor?.chain().focus().redo().run()}
          className="rounded p-1.5 hover:bg-surface-container-low disabled:opacity-40"
          aria-label="Redo"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>
      </div>

      <select
        aria-label="Text style"
        value={getHeadingValue()}
        onChange={(event) => {
          if (!editor) return;
          const val = event.target.value;
          if (val === "p") editor.chain().focus().setParagraph().run();
          if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
          if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
          if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className="mr-1.5 h-8 shrink-0 rounded-md border border-outline-variant/40 bg-surface-container-lowest px-2.5 text-xs font-medium text-on-surface outline-none hover:bg-surface-container-low focus:border-primary-container"
      >
        <option value="p">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      {editor ? (
        <div className="flex shrink-0 items-center gap-0.5">
          {action(
            "Bold",
            <Bold size={15} />,
            () => editor.chain().focus().toggleBold().run(),
            editor.isActive("bold")
          )}
          {action(
            "Italic",
            <Italic size={15} />,
            () => editor.chain().focus().toggleItalic().run(),
            editor.isActive("italic")
          )}
          {action(
            "Underline",
            <UnderlineIcon size={15} />,
            () => editor.chain().focus().toggleUnderline().run(),
            editor.isActive("underline")
          )}
          <span className="mx-1 h-5 w-px bg-outline-variant/70" />
          {action(
            "Bullet list",
            <List size={15} />,
            () => editor.chain().focus().toggleBulletList().run(),
            editor.isActive("bulletList")
          )}
          {action(
            "Numbered list",
            <ListOrdered size={15} />,
            () => editor.chain().focus().toggleOrderedList().run(),
            editor.isActive("orderedList")
          )}
          {action(
            "Quote",
            <Quote size={15} />,
            () => editor.chain().focus().toggleBlockquote().run(),
            editor.isActive("blockquote")
          )}
          {action(
            "Code block",
            <Code size={15} />,
            () => editor.chain().focus().toggleCodeBlock().run(),
            editor.isActive("codeBlock")
          )}
          {action(
            "Link",
            <Link2 size={15} />,
            toggleLink,
            editor.isActive("link")
          )}
        </div>
      ) : (
        <div className="flex gap-1">
          {[Bold, Italic, UnderlineIcon, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link2].map(
            (Icon, index) => (
              <span key={index} className="grid h-8 w-8 place-items-center text-secondary/40">
                <Icon size={15} />
              </span>
            )
          )}
        </div>
      )}

      <div className="ml-auto hidden items-center gap-2 pl-4 sm:flex">
        <span className="flex items-center gap-1 rounded-full bg-primary-fixed/60 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Sparkles size={12} /> AI Copilot Active
        </span>
        <span className="text-[11px] text-secondary">
          60 fps CRDT Sync <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      </div>
    </div>
  );
}
