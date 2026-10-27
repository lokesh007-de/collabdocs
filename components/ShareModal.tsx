"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, Globe2, Link2, Mail, Trash2, X } from "lucide-react";
import { shareApi, ApiError } from "@/lib/api";

type CollaboratorItem = {
  userId: string;
  initials: string;
  name: string;
  email: string;
  role: "Owner" | "EDITOR" | "VIEWER";
  color: string;
  isOwner?: boolean;
};

const PEER_COLORS = [
  "#4f46e5",
  "#f87171",
  "#2563eb",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
];

function colorFor(str: string): string {
  let hash = 0;
  for (const ch of str) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PEER_COLORS[Math.abs(hash) % PEER_COLORS.length];
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0];
  const parts = source.split(/[ ._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "CO";
}

export default function ShareModal({
  open,
  onClose,
  documentTitle,
  docId,
}: {
  open: boolean;
  onClose: () => void;
  documentTitle: string;
  docId?: string;
}) {
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [people, setPeople] = useState<CollaboratorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicAccess, setPublicAccess] = useState(false);
  const [publicRole, setPublicRole] = useState("Viewer");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadCollaborators = useCallback(async () => {
    if (!docId) return;
    try {
      setLoading(true);
      const data = await shareApi.list(docId);
      const list: CollaboratorItem[] = [];

      if (data.owner) {
        list.push({
          userId: data.owner.id,
          name: `${data.owner.name} (Owner)`,
          email: data.owner.email,
          initials: getInitials(data.owner.name, data.owner.email),
          role: "Owner",
          color: colorFor(data.owner.email),
          isOwner: true,
        });
      }

      for (const item of data.collaborators) {
        list.push({
          userId: item.user.id,
          name: item.user.name,
          email: item.user.email,
          initials: getInitials(item.user.name, item.user.email),
          role: item.role,
          color: colorFor(item.user.email),
          isOwner: false,
        });
      }

      setPeople(list);
    } catch {
      // Fallback or silently handle if doc not in server yet
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    if (open && docId) {
      loadCollaborators();
    }
  }, [open, docId, loadCollaborators]);

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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!docId) {
      // Local fallback
      const initials = getInitials("", email);
      setPeople((prev) => [
        ...prev,
        {
          userId: `local-${Date.now()}`,
          initials,
          name: email.split("@")[0],
          email,
          role: inviteRole,
          color: colorFor(email),
        },
      ]);
      setEmail("");
      setStatusMessage(`Invitation sent to ${email}!`);
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    try {
      await shareApi.invite(docId, email, inviteRole);
      setEmail("");
      setStatusMessage(`Invitation sent to ${email}!`);
      setTimeout(() => setStatusMessage(""), 3000);
      await loadCollaborators();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to invite collaborator.");
      }
    }
  }

  async function handleUpdateRole(targetUserId: string, newRole: string) {
    if (!docId) {
      setPeople((prev) =>
        prev.map((p) =>
          p.userId === targetUserId ? { ...p, role: newRole as "EDITOR" | "VIEWER" } : p
        )
      );
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    if (newRole === "REMOVE") {
      try {
        await shareApi.remove(docId, targetUserId);
        setPeople((prev) => prev.filter((p) => p.userId !== targetUserId));
        setStatusMessage("Collaborator removed.");
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to remove collaborator.");
        }
      }
      return;
    }

    try {
      await shareApi.updateRole(docId, targetUserId, newRole as "EDITOR" | "VIEWER");
      setPeople((prev) =>
        prev.map((p) =>
          p.userId === targetUserId ? { ...p, role: newRole as "EDITOR" | "VIEWER" } : p
        )
      );
      setStatusMessage("Role updated.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update role.");
      }
    }
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
                placeholder="Add people by registered email..."
                className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
            </div>
            <select
              aria-label="Invite permission"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "EDITOR" | "VIEWER")}
              className="rounded-xl border border-outline-variant/70 bg-white px-3 text-xs font-medium text-on-surface outline-none hover:bg-surface-container-low"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={!email}
              className="rounded-xl bg-primary-container px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary disabled:opacity-50"
            >
              Invite
            </button>
          </form>

          {errorMessage && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-500">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
              People with access
            </p>
            <span className="text-xs text-secondary">
              {loading ? "Loading…" : `${people.length} collaborator${people.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="mt-2.5 max-h-[220px] overflow-y-auto divide-y divide-outline-variant/20 pr-1">
            {people.map((person) => (
              <div key={person.userId || person.email} className="flex items-center gap-3 py-2.5">
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
                {person.isOwner || person.role === "Owner" ? (
                  <span className="rounded-md bg-surface-container px-2 py-1 text-[11px] font-medium text-secondary">
                    Owner
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <select
                      aria-label={`Permission for ${person.name}`}
                      value={person.role}
                      onChange={(e) => handleUpdateRole(person.userId, e.target.value)}
                      className="rounded-lg border border-outline-variant/50 bg-white px-2 py-1 text-xs font-medium text-on-surface outline-none hover:bg-surface-container-low"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                      <option value="REMOVE">Remove</option>
                    </select>
                    <button
                      type="button"
                      title="Remove access"
                      onClick={() => handleUpdateRole(person.userId, "REMOVE")}
                      className="rounded p-1 text-secondary hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
