import Link from "next/link";
import { FileText, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-outline-variant/40 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-gutter-mobile md:px-gutter">
        <Link className="flex items-center gap-2 text-on-surface" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-container text-white shadow-xs">
            <FileText size={19} />
          </span>
          <span className="text-lg font-bold tracking-tight text-on-surface">CollabDocs</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors" href="#features">
            Features
          </a>
          <a className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className="px-2.5 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-primary active:scale-[0.99]"
            href="/signup"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            aria-label="User profile"
            className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white transition hover:opacity-90 ml-1"
          >
            <User size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
