"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileUp,
  Grid2X2,
  LayoutGrid,
  List,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DocCard from "@/components/DocCard";
import { docsApi, type ApiDoc } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

const templates = [
  { title: "Blank Document", desc: "Empty canvas with slash commands", tag: "Fast", color: "bg-primary-fixed", icon: "＋", category: "Draft" },
  { title: "Product Spec", desc: "PRD structure, goals, & KPIs", tag: "Spec", color: "bg-blue-100", icon: "▤", category: "Spec" },
  { title: "Meeting Notes", desc: "Agenda, decisions, and action items", tag: "Team", color: "bg-sky-100", icon: "▣", category: "Meeting Notes" },
  { title: "RFC Document", desc: "Technical proposal & trade-offs", tag: "Tech", color: "bg-violet-100", icon: "⌘", category: "Architecture" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [docs, setDocs] = useState<ApiDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Docs");
  const [grid, setGrid] = useState(true);

  // Load documents from API
  const loadDocs = useCallback(async () => {
    try {
      setFetching(true);
      const { owned, shared } = await docsApi.list();
      setDocs([...owned, ...shared]);
    } catch {
      setFetchError("Failed to load documents.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) loadDocs();
  }, [loading, loadDocs]);

  const handleCreateDocument = async (title = "Untitled document") => {
    try {
      const doc = await docsApi.create(title);
      router.push(`/doc/${doc.id}`);
    } catch {
      setFetchError("Failed to create document.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const matchesText = `${doc.title} ${doc.owner.name}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab =
        activeTab === "All Docs" ||
        (activeTab === "Created by me" && doc.userRole === "OWNER") ||
        (activeTab === "Shared with me" && doc.userRole !== "OWNER");
      return matchesText && matchesTab;
    });
  }, [docs, query, activeTab]);

  const userInitials = user?.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "??";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar onCreateDoc={handleCreateDocument} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[62px] items-center gap-4 border-b border-outline-variant/40 bg-white/95 px-4 backdrop-blur md:px-6">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface px-4 md:max-w-[600px] focus-within:border-primary-container">
            <Search size={17} className="shrink-0 text-secondary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents or team members..."
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-secondary"
            />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label="Grid view"
              onClick={() => setGrid(true)}
              className={`rounded-lg p-2 transition-colors ${grid ? "bg-primary-fixed text-primary font-semibold" : "text-secondary hover:bg-surface-container-low"}`}
            >
              <Grid2X2 size={17} />
            </button>
            <button
              aria-label="List view"
              onClick={() => setGrid(false)}
              className={`rounded-lg p-2 transition-colors ${!grid ? "bg-primary-fixed text-primary font-semibold" : "text-secondary hover:bg-surface-container-low"}`}
            >
              <List size={17} />
            </button>
            <button aria-label="Notifications" className="rounded-lg p-2 text-secondary hover:bg-surface-container-low transition-colors">
              <Bell size={17} />
            </button>
            <button
              aria-label="Log out"
              onClick={handleLogout}
              title="Log out"
              className="rounded-lg p-2 text-secondary hover:bg-surface-container-low transition-colors"
            >
              <LogOut size={17} />
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-container text-xs font-bold text-white shadow-xs">
              {userInitials}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {user?.name ?? "Personal workspace"}
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                Documents &amp; Workspaces
              </h1>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleCreateDocument("Imported Document")}
                className="hidden items-center gap-2 rounded-xl border border-outline-variant/60 bg-white px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors sm:flex"
              >
                <FileUp size={15} /> Import
              </button>
              <button
                type="button"
                onClick={() => handleCreateDocument("Untitled Document")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary active:scale-[0.99]"
              >
                <Plus size={17} /> New Document{" "}
                <span className="hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono lg:inline">⌘N</span>
              </button>
            </div>
          </div>

          <section className="mt-9">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
                <Zap size={18} className="text-primary" /> Quick Start Templates
              </h2>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
              {templates.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  onClick={() => handleCreateDocument(template.title)}
                  className="rounded-2xl border border-outline-variant/30 bg-white p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-docked group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl text-xl text-primary font-bold ${template.color}`}>
                      {template.icon}
                    </span>
                    <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-[10px] font-semibold text-secondary">
                      {template.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{template.title}</h3>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">{template.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-outline-variant/30 bg-white p-2 shadow-xs">
            {["All Docs", "Created by me", "Shared with me"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab ? "bg-primary-container text-white shadow-xs" : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto hidden items-center gap-3 text-xs text-secondary sm:flex pr-2">
              <span>☷ Sort: <strong className="text-on-surface">Last modified</strong></span>
              <button
                aria-label="Toggle grid"
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
            </div>

            {fetchError && (
              <div className="rounded-xl border border-error/20 bg-error-container/30 p-4 text-sm text-error mb-4">
                {fetchError}
              </div>
            )}

            {fetching ? (
              <div className="flex items-center justify-center py-20 text-sm text-secondary animate-pulse">
                Loading documents…
              </div>
            ) : filteredDocs.length ? (
              <div className={grid ? "grid gap-4 sm:grid-cols-2 2xl:grid-cols-3" : "space-y-3"}>
                {filteredDocs.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={{
                      id: doc.id,
                      title: doc.title,
                      category: doc.userRole === "OWNER" ? "My Doc" : "Shared",
                      excerpt: `Last edited ${new Date(doc.updatedAt).toLocaleDateString()}`,
                      edited: new Date(doc.updatedAt).toLocaleDateString(),
                      editor: doc.owner.name,
                      collaborators: doc.collaborators.map((c) => ({
                        name: c.user.name,
                        initials: c.user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
                        color: "#60a5fa",
                      })),
                      accent: "#e2dfff",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/40 bg-white p-12 text-center text-sm text-secondary">
                No documents match your search or filter criteria.
              </div>
            )}
          </section>

          <section className="mt-12">
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-white px-6 py-12 text-center shadow-xs">
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-primary-fixed text-primary">
                <FileUp size={28} />
                <Sparkles size={16} className="absolute -bottom-1 -right-1 text-primary-container" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-on-surface">Create your first document</h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-secondary">
                Draft in real-time with your team. Invite collaborators using the Share button inside any document.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateDocument("New Document")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary"
                >
                  <Plus size={16} /> Create your first document
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
