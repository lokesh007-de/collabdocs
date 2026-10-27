"use client";

import Link from "next/link";
import { ArrowLeft, Bell, ChevronDown, Cloud, Share2 } from "lucide-react";
import AvatarStack from "@/components/AvatarStack";
import { editorCollaborators } from "@/lib/mockDocs";

export default function TopBar({
  title,
  onShare,
  collaborators = editorCollaborators,
}: {
  title: string;
  onShare: () => void;
  collaborators?: { name: string; initials: string; color: string }[];
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between gap-3 border-b border-outline-variant/50 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Back to documents"
          className="rounded-md p-2 text-secondary hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="hidden h-6 w-px bg-outline-variant sm:block" />
        <Link href="/dashboard" className="hidden font-semibold text-primary sm:inline hover:underline">
          CollabDocs
        </Link>
        <span className="hidden h-5 w-px bg-outline-variant sm:block" />
        <span className="truncate text-sm font-semibold text-on-surface max-w-[280px] sm:max-w-[400px]">
          {title}
        </span>
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 lg:flex">
          <Cloud size={13} className="text-emerald-600" /> Saved
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <AvatarStack avatars={collaborators} limit={4} />
        </div>
        <button
          aria-label="Notifications"
          className="hidden rounded-md p-2 text-secondary hover:bg-surface-container-low transition-colors sm:block"
        >
          <Bell size={17} />
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-lg bg-primary-container px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary active:scale-[0.99]"
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>
        <button
          aria-label="Account menu"
          className="grid h-8 w-8 place-items-center rounded-full bg-primary-fixed text-xs font-bold text-primary transition hover:opacity-90"
        >
          AR
          <ChevronDown className="hidden" size={12} />
        </button>
      </div>
    </header>
  );
}
