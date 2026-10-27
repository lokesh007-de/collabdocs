"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  LayoutTemplate,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

const primaryLinks = [
  { label: "My Documents", href: "/dashboard", icon: FileText },
  { label: "Shared with me", href: "/dashboard?view=shared", icon: Users },
  { label: "Starred", href: "/dashboard?view=starred", icon: Star },
  { label: "Trash", href: "/dashboard?view=trash", icon: Trash2 },
];

interface SidebarProps {
  onCreateDoc?: () => void;
}

export default function Sidebar({ onCreateDoc }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-[268px] shrink-0 flex-col border-r border-outline-variant/40 bg-white md:flex">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-container text-white shadow-xs">
          <FileText size={18} />
        </span>
        <span className="text-lg font-bold tracking-tight text-on-surface">CollabDocs</span>
      </div>

      <div className="px-4 mb-5">
        <button
          type="button"
          onClick={onCreateDoc}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary-container text-sm font-semibold text-white shadow-sm transition hover:bg-primary active:scale-[0.99]"
        >
          <Plus size={17} /> New Document
        </button>
      </div>

      <div className="flex-1 px-4">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-secondary">
          Navigation
        </p>
        <nav className="space-y-1">
          {primaryLinks.map(({ label, href, icon: Icon }) => {
            const active = label === "My Documents" && pathname === "/dashboard";
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary-fixed text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="mb-2 mt-7 px-2 text-[11px] font-semibold uppercase tracking-wider text-secondary">
          Workspace
        </p>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <FolderOpen size={16} /> My Workspace
          </Link>
          <Link
            href="/dashboard?view=templates"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <LayoutTemplate size={16} /> Templates
          </Link>
          <Link
            href="/dashboard?view=activity"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <Zap size={16} /> Version Audit
          </Link>
        </nav>
      </div>

      <div className="border-t border-outline-variant/40 p-4">
        <Link
          href="/dashboard?view=search"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-secondary hover:bg-surface-container-low transition-colors"
        >
          <Search size={16} /> Search workspace
        </Link>
        <Link
          href="/dashboard?view=settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-secondary hover:bg-surface-container-low transition-colors"
        >
          <Settings size={16} /> Settings
        </Link>
      </div>
    </aside>
  );
}
