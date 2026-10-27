import Link from "next/link";
import { MoreVertical, Star } from "lucide-react";
import AvatarStack from "@/components/AvatarStack";
import type { MockDocument } from "@/lib/mockDocs";

export default function DocCard({ doc }: { doc: MockDocument }) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant/40 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-docked">
      <Link href={`/doc/${doc.id}`} className="block p-5 flex-1">
        <div className="flex items-center justify-between">
          <span
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-primary"
            style={{ backgroundColor: doc.accent }}
          >
            {doc.category}
          </span>
          <div className="flex items-center gap-1.5 text-secondary">
            <button
              type="button"
              aria-label="Star document"
              onClick={(event) => event.preventDefault()}
              className="rounded p-1 hover:text-amber-500 transition-colors"
            >
              <Star size={16} />
            </button>
            <button
              type="button"
              aria-label="More options"
              onClick={(event) => event.preventDefault()}
              className="rounded p-1 hover:text-on-surface transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        <h3 className="mt-4 truncate text-base font-semibold tracking-tight text-on-surface group-hover:text-primary transition-colors">
          {doc.title}
        </h3>

        {/* Minimalist Document Preview Mock Bars */}
        <div aria-hidden="true" className="mt-3.5 rounded-xl bg-surface-container-low p-3.5 space-y-2">
          <div className="h-2 w-4/5 rounded-full bg-slate-700/80" />
          <div className="h-1.5 w-full rounded-full bg-slate-300" />
          <div className="flex gap-2 pt-0.5">
            <span className="h-1.5 w-1/3 rounded-full" style={{ backgroundColor: doc.accent }} />
            <span className="h-1.5 w-1/2 rounded-full bg-slate-300/70" />
          </div>
        </div>

        <p className="mt-4 text-xs text-secondary">
          Edited {doc.edited} by <span className="font-medium text-on-surface-variant">{doc.editor}</span>
        </p>
      </Link>

      <div className="flex items-center justify-between border-t border-outline-variant/30 bg-surface/60 px-5 py-3">
        <AvatarStack avatars={doc.collaborators} limit={3} />
        {doc.isLive ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live editing
          </span>
        ) : (
          <span className="text-xs text-secondary">
            {doc.collaborators.length} collaborators
          </span>
        )}
      </div>
    </article>
  );
}
