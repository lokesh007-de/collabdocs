"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileUp,
  Grid2X2,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DocCard from "@/components/DocCard";
import { createNewDocument, getStoredDocuments, type MockDocument } from "@/lib/mockDocs";

const templates = [
  { title: "Blank Document", desc: "Empty canvas with slash commands", tag: "Fast", color: "bg-primary-fixed", icon: "＋", category: "Draft" },
  { title: "Product Spec", desc: "PRD structure, goals, & KPIs", tag: "Spec", color: "bg-blue-100", icon: "▤", category: "Spec" },
  { title: "Meeting Notes", desc: "Agenda, decisions, and action items", tag: "Team", color: "bg-sky-100", icon: "▣", category: "Meeting Notes" },
  { title: "RFC Document", desc: "Technical proposal & trade-offs", tag: "Tech", color: "bg-violet-100", icon: "⌘", category: "Architecture" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [allDocs, setAllDocs] = useState<MockDocument[]>(() => getStoredDocuments());
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Docs");
  const [grid, setGrid] = useState(true);

  const handleCreateDocument = (title = "Untitled document", category = "General") => {
    const doc = createNewDocument(title, category);
    setAllDocs((prev) => [doc, ...prev]);
    router.push(`/doc/${doc.id}`);
  };

  const filteredDocs = useMemo(() => {
    return allDocs.filter((doc) => {
      const matchesText = `${doc.title} ${doc.category} ${doc.editor}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab =
        activeTab === "All Docs" ||
        (activeTab === "Created by me" && doc.editor === "Alex Rivera") ||
        (activeTab === "Drafts" && (doc.category === "Draft" || doc.category === "General")) ||
        (activeTab === "Recent" && (doc.isLive || doc.edited.includes("min") || doc.edited.includes("hour")));
      return matchesText && matchesTab;
    });
  }, [allDocs, query, activeTab]);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[62px] items-center gap-4 border-b border-outline-variant/40 bg-white/95 px-4 backdrop-blur md:px-6">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface px-4 md:max-w-[600px] focus-within:border-primary-container">
            <Search size={17} className="shrink-0 text-secondary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents, tags, or team members..."
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-secondary"
            />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label="Grid view"
              onClick={() => setGrid(true)}
              className={`rounded-lg p-2 transition-colors ${
                grid ? "bg-primary-fixed text-primary font-semibold" : "text-secondary hover:bg-surface-container-low"
              }`}
            >
              <Grid2X2 size={17} />
            </button>
            <button
              aria-label="List view"
              onClick={() => setGrid(false)}
              className={`rounded-lg p-2 transition-colors ${
                !grid ? "bg-primary-fixed text-primary font-semibold" : "text-secondary hover:bg-surface-container-low"
              }`}
            >
              <List size={17} />
            </button>
            <button
              aria-label="Notifications"
              className="rounded-lg p-2 text-secondary hover:bg-surface-container-low transition-colors"
            >
              <Bell size={17} />
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-container text-xs font-bold text-white shadow-xs">
              AR
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Personal workspace
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="normal-case font-normal tracking-normal text-secondary">
                  ● Sync live (3 peers)
                </span>
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                Documents &amp; Workspaces
              </h1>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleCreateDocument("Imported Document", "Imported")}
                className="hidden items-center gap-2 rounded-xl border border-outline-variant/60 bg-white px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors sm:flex"
              >
                <FileUp size={15} /> Import
              </button>
              <button
                type="button"
                onClick={() => handleCreateDocument("Untitled Document", "Draft")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary active:scale-[0.99]"
              >
                <Plus size={17} /> New Document{" "}
                <span className="hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono lg:inline">
                  ⌘N
                </span>
              </button>
            </div>
          </div>

          <section className="mt-9">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
                <Zap size={18} className="text-primary" /> Quick Start Templates
              </h2>
              <button
                type="button"
                onClick={() => handleCreateDocument("New Template Document", "Template")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Browse gallery →
              </button>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
              {templates.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  onClick={() => handleCreateDocument(template.title, template.category)}
                  className="rounded-2xl border border-outline-variant/30 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-docked group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl text-xl text-primary font-bold ${template.color}`}
                    >
                      {template.icon}
                    </span>
                    <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-[10px] font-semibold text-secondary">
                      {template.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">
                    {template.desc}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-outline-variant/30 bg-white p-2 shadow-xs">
            {["All Docs", "Recent", "Created by me", "Drafts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "bg-primary-container text-white shadow-xs"
                    : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto hidden items-center gap-3 text-xs text-secondary sm:flex pr-2">
              <span>
                ☷ Sort: <strong className="text-on-surface">Last modified</strong>
              </span>
              <button
                aria-label="Change card grid"
                onClick={() => setGrid(!grid)}
                className="rounded-lg bg-surface-container-low p-2 hover:bg-surface-container"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-on-surface">
                Recent documents{" "}
                <span className="ml-2 rounded-full bg-secondary-fixed px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  {filteredDocs.length} documents
                </span>
              </h2>
              <span className="hidden items-center gap-1.5 text-xs text-secondary sm:flex">
                Auto-saved 1 min ago <span className="text-emerald-500">☁</span>
              </span>
            </div>
            {filteredDocs.length ? (
              <div
                className={
                  grid
                    ? "grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
                    : "space-y-3"
                }
              >
                {filteredDocs.map((doc) => (
                  <DocCard key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/40 bg-white p-12 text-center text-sm text-secondary">
                No documents match your search or filter criteria.
              </div>
            )}
          </section>

          <section className="mt-12">
            <h2 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-on-surface">
              <span>◉ Empty State Preview</span>
              <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                Workspace Variant
              </span>
            </h2>
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-white px-6 py-12 text-center shadow-xs">
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-primary-fixed text-primary">
                <FileUp size={28} />
                <Sparkles size={16} className="absolute -bottom-1 -right-1 text-primary-container" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-on-surface">Your canvas is ready</h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-secondary">
                Create your first collaborative document or pick a team template to draft in real-time with zero latency.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateDocument("New Document", "Draft")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary"
                >
                  <Plus size={16} /> Create your first document
                </button>
                <span className="text-xs text-secondary">
                  or press <kbd className="rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 font-mono text-[10px]">⌘ + N</kbd> anytime
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
