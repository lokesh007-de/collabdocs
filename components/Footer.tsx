import Link from "next/link";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/40 bg-white px-gutter-mobile py-8 md:px-gutter">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary-container text-white"><FileText size={15} /></span>
            CollabDocs
          </Link>
          <p className="mt-2 max-w-sm text-xs leading-5 text-secondary">High-focus, real-time collaborative workspace designed for modern document authoring and engineering teams.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-secondary">
          <a href="#features">Features</a><a href="#how-it-works">Roadmap</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#security">Security</a>
        </nav>
      </div>
      <div className="mx-auto mt-7 flex max-w-7xl flex-col justify-between gap-2 text-[11px] text-secondary sm:flex-row">
        <span>© 2025 CollabDocs Inc. All rights reserved.</span><span>Engineered for real-time document authoring</span>
      </div>
    </footer>
  );
}
