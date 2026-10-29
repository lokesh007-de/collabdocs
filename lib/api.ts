/**
 * Typed API client for CollabDocs server.
 * All requests include credentials (httpOnly JWT cookie).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Generic fetch wrapper ──────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(body.error ?? res.statusText, res.status);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface ApiDoc {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userRole: "OWNER" | "EDITOR" | "VIEWER";
  owner: { id: string; name: string; email: string };
  collaborators: Array<{
    role: "EDITOR" | "VIEWER";
    user: { id: string; name: string; email: string };
  }>;
}

export interface ApiCollaborator {
  role: "EDITOR" | "VIEWER";
  user: { id: string; name: string; email: string };
}

export interface ApiVersion {
  id: string;
  label: string | null;
  createdAt: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (name: string, email: string, password: string) =>
    apiFetch<AuthUser>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch<AuthUser>("/api/auth/me"),
};

// ── Documents ──────────────────────────────────────────────────────────────────
export const docsApi = {
  list: () =>
    apiFetch<{ owned: ApiDoc[]; shared: ApiDoc[] }>("/api/docs"),

  create: (title?: string) =>
    apiFetch<ApiDoc>("/api/docs", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  get: (id: string) => apiFetch<ApiDoc>(`/api/docs/${id}`),

  rename: (id: string, title: string) =>
    apiFetch<{ id: string; title: string; updatedAt: string }>(`/api/docs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),

  delete: (id: string) =>
    apiFetch<undefined>(`/api/docs/${id}`, { method: "DELETE" }),
};

// ── Sharing ────────────────────────────────────────────────────────────────────
export const shareApi = {
  list: (docId: string) =>
    apiFetch<{ owner: AuthUser; collaborators: ApiCollaborator[] }>(
      `/api/docs/${docId}/share`
    ),

  invite: (docId: string, email: string, role: "VIEWER" | "EDITOR") =>
    apiFetch<ApiCollaborator>(`/api/docs/${docId}/share`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  updateRole: (docId: string, userId: string, role: "VIEWER" | "EDITOR") =>
    apiFetch<ApiCollaborator>(`/api/docs/${docId}/share/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  remove: (docId: string, userId: string) =>
    apiFetch<undefined>(`/api/docs/${docId}/share/${userId}`, {
      method: "DELETE",
    }),
};

// ── Versions ──────────────────────────────────────────────────────────────────
export const versionsApi = {
  list: (docId: string) =>
    apiFetch<ApiVersion[]>(`/api/docs/${docId}/versions`),

  save: (docId: string, label?: string) =>
    apiFetch<ApiVersion>(`/api/docs/${docId}/versions`, {
      method: "POST",
      body: JSON.stringify({ label }),
    }),

  restore: (docId: string, vId: string) =>
    apiFetch<{ message: string }>(`/api/docs/${docId}/versions/${vId}/restore`, {
      method: "POST",
    }),
};

// ── WebSocket URL helper ───────────────────────────────────────────────────────
export function getWsUrl(docId: string): string {
  const wsBase =
    process.env.NEXT_PUBLIC_WS_URL ??
    (BASE.replace(/^http/, "ws"));
  return `${wsBase}/ws?docId=${encodeURIComponent(docId)}`;
}

