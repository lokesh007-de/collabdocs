"use client";

import { useState } from "react";
import { Check, Globe2, Link2, Mail, X } from "lucide-react";

type CollaboratorAccess = {
  initials: string;
  name: string;
  email: string;
  role: string;
  color: string;
};

const initialPeople: CollaboratorAccess[] = [
  { initials: "AR", name: "Alex Rivera (You)", email: "alex@company.com", role: "Owner", color: "#4f46e5" },
  { initials: "RS", name: "Rahul S.", email: "rahul@company.com", role: "Editor", color: "#f87171" },
  { initials: "PK", name: "Priya Kapoor", email: "priya@company.com", role: "Commenter", color: "#2563eb" },
  { initials: "EC", name: "Elena Chen", email: "elena@company.com", role: "Viewer", color: "#10b981" },
  { initials: "ML", name: "Maya Lin", email: "maya@company.com", role: "Editor", color: "#8b5cf6" },
];

export default function ShareModal({
  open,
  onClose,
  documentTitle,
}: {
  open: boolean;
  onClose: () => void;
  documentTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [people, setPeople] = useState<CollaboratorAccess[]>(initialPeople);
  const [copied, setCopied] = useState(false);
  const [publicAccess, setPublicAccess] = useState(false);
  const [publicRole, setPublicRole] = useState("Viewer");
  const [statusMessage, setStatusMessage] = useState("");

  if (!open) return null;

  async function copyLink() {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setStatusMessage("Document link copied to clipboard!");
        setTimeout(() => {
          setCopied(false);
          setStatusMessage("");
        }, 2500);
      }
    } catch {
      setStatusMessage("Could not access clipboard. Copy from browser address bar.");
    }
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    const initials = email
      .split("@")[0]
      .split(/[._-]/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "CO";

    const newPerson: CollaboratorAccess = {
      initials,
      name: email.split("@")[0],
      email,
      role: inviteRole,
      color: "#60a5fa",
    };

    setPeople((prev) => [...prev, newPerson]);
    setEmail("");
    setStatusMessage(`Invitation sent to ${email}!`);
    setTimeout(() => setStatusMessage(""), 3000);
  }

  function updateRole(targetEmail: string, newRole: string) {
    setPeople((prev) =>
      prev.map((p) => (p.email === targetEmail ? { ...p, role: newRole } : p))
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-3 py-10 backdrop-blur-[2px] sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-modal"
      >
        <header className="flex items-start justify-between border-b border-outline-variant/40 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="share-title" className="text-base font-semibold text-on-surface">
                Share document
              </h2>
              <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                Private Link
              </span>
            </div>
            <p className="mt-1 max-w-[380px] truncate text-xs text-secondary">
              {documentTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-lg p-1.5 text-secondary hover:bg-surface-container-low transition-colors"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <label
            htmlFor="invite-email"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-secondary"
          >
            Add people or teams
          </label>
          <form className="flex gap-2" onSubmit={handleInvite}>
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-outline-variant/70 bg-white px-3.5 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/10">
              <Mail size={16} className="shrink-0 text-secondary" />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Add people by name or email..."
                className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
            </div>
            <select
              aria-label="Invite permission"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-xl border border-outline-variant/70 bg-white px-3 text-xs font-medium text-on-surface outline-none hover:bg-surface-container-low"
            >
              <option value="Editor">Editor</option>
              <option value="Commenter">Commenter</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={!email}
              className="rounded-xl bg-primary-container px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary disabled:opacity-50"
            >
              Invite
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              People with access
            </p>
            <span className="text-xs text-secondary">{people.length} collaborators</span>
          </div>

          <div className="mt-2.5 max-h-[220px] overflow-y-auto divide-y divide-outline-variant/20 pr-1">
            {people.map((person) => (
              <div key={person.email} className="flex items-center gap-3 py-2.5">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: person.color }}
                >
                  {person.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-on-surface">
                    {person.name}
                  </p>
                  <p className="truncate text-[11px] text-secondary">
                    {person.email}
                  </p>
                </div>
                {person.role === "Owner" ? (
                  <span className="rounded-md bg-surface-container px-2 py-1 text-[11px] font-medium text-secondary">
                    Owner
                  </span>
                ) : (
                  <select
                    aria-label={`Permission for ${person.name}`}
                    value={person.role}
                    onChange={(e) => updateRole(person.email, e.target.value)}
                    className="rounded-lg border border-outline-variant/50 bg-white px-2 py-1 text-xs font-medium text-on-surface outline-none hover:bg-surface-container-low"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Commenter">Commenter</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-secondary">
              General access
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface/70 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-fixed text-primary">
                <Globe2 size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-on-surface">Anyone with the link</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={publicAccess}
                    onClick={() => setPublicAccess(!publicAccess)}
                    className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full transition-colors ${
                      publicAccess ? "bg-primary-container" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                        publicAccess ? "translate-x-4" : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-secondary">
                  {publicAccess
                    ? "Anyone on the internet with this link can view"
                    : "Only explicitly invited collaborators can access"}
                </p>
              </div>
              {publicAccess && (
                <select
                  aria-label="General access role"
                  value={publicRole}
                  onChange={(e) => setPublicRole(e.target.value)}
                  className="rounded-lg border border-outline-variant/60 bg-white px-2 py-1 text-xs font-medium text-on-surface outline-none"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Commenter">Commenter</option>
                  <option value="Editor">Editor</option>
                </select>
              )}
            </div>
          </div>

          {statusMessage && (
            <p role="status" className="mt-3 text-xs font-medium text-emerald-600">
              {statusMessage}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-outline-variant/40 bg-surface/60 px-6 py-3.5">
          <button
            type="button"
            onClick={copyLink}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
              copied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-primary/40 bg-white text-primary hover:bg-primary-fixed"
            }`}
          >
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary-container px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary"
          >
            Done
          </button>
        </footer>
      </section>
    </div>
  );
}
