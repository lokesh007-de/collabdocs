export type MockDocument = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  edited: string;
  editor: string;
  collaborators: { name: string; initials: string; color: string }[];
  accent: string;
  isLive?: boolean;
};

export const editorCollaborators = [
  { name: "Alex Rivera", initials: "AR", color: "#f87171" },
  { name: "Elena Chen", initials: "EC", color: "#34d399" },
  { name: "Marcus Vance", initials: "MV", color: "#60a5fa" },
  { name: "Maya Lin", initials: "ML", color: "#a78bfa" },
];

export const mockDocs: MockDocument[] = [
  {
    id: "q3-product-architecture",
    title: "Q3 Product Architecture & Spec",
    category: "Architecture",
    excerpt: "Core systems, distributed state, and implementation milestones.",
    edited: "2 mins ago",
    editor: "Elena Chen",
    collaborators: [
      { name: "Elena Chen", initials: "EC", color: "#10b981" },
      { name: "Maya Lin", initials: "ML", color: "#8b5cf6" },
      { name: "Marcus Vance", initials: "MV", color: "#f43f5e" },
    ],
    accent: "#e2dfff",
    isLive: true,
  },
  {
    id: "quarterly-launch-strategy",
    title: "Quarterly Launch Strategy & Playbook",
    category: "Strategy",
    excerpt: "A cross-functional plan for the upcoming product launch.",
    edited: "14 mins ago",
    editor: "Rahul S.",
    collaborators: [
      { name: "Rahul Shah", initials: "RS", color: "#2563eb" },
      { name: "Priya Kapoor", initials: "PK", color: "#f97316" },
      { name: "Alex Rivera", initials: "AR", color: "#7c3aed" },
    ],
    accent: "#d4e3ff",
  },
  {
    id: "design-tokens",
    title: "Design Tokens & UI System v2.4",
    category: "Design",
    excerpt: "Color, type, and component foundations for the product.",
    edited: "2 hours ago",
    editor: "Alex Rivera",
    collaborators: [
      { name: "Alex Rivera", initials: "AR", color: "#7c3aed" },
      { name: "Maya Lin", initials: "ML", color: "#f43f5e" },
    ],
    accent: "#dbeafe",
  },
  {
    id: "distributed-crdt-sync",
    title: "Distributed CRDT Sync Engine",
    category: "Engineering",
    excerpt: "Notes on conflict-free updates and peer synchronization.",
    edited: "Yesterday",
    editor: "Maya Lin",
    collaborators: [
      { name: "Maya Lin", initials: "ML", color: "#4f46e5" },
      { name: "Rahul Shah", initials: "RS", color: "#2563eb" },
      { name: "Elena Chen", initials: "EC", color: "#059669" },
      { name: "Alex Rivera", initials: "AR", color: "#7c3aed" },
    ],
    accent: "#cffafe",
  },
  {
    id: "weekly-engineering",
    title: "Weekly Engineering All-Hands",
    category: "Meeting Notes",
    excerpt: "Team updates, decisions, and next steps for this week.",
    edited: "2 days ago",
    editor: "Marcus Vance",
    collaborators: [
      { name: "Marcus Vance", initials: "MV", color: "#f43f5e" },
      { name: "Elena Chen", initials: "EC", color: "#059669" },
    ],
    accent: "#fde68a",
  },
  {
    id: "api-integration",
    title: "API Integration & Webhooks",
    category: "Documentation",
    excerpt: "Integration guide and event payload reference.",
    edited: "4 days ago",
    editor: "Priya K.",
    collaborators: [
      { name: "Priya Kapoor", initials: "PK", color: "#f97316" },
      { name: "Alex Rivera", initials: "AR", color: "#7c3aed" },
    ],
    accent: "#d8b4fe",
  },
];

const LOCAL_STORAGE_KEY = "collabdocs_user_documents";

export function getStoredDocuments(): MockDocument[] {
  if (typeof window === "undefined") return mockDocs;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return mockDocs;
    const customDocs = JSON.parse(raw) as MockDocument[];
    // Prepend any custom docs to default mock docs without duplicates
    const customIds = new Set(customDocs.map((d) => d.id));
    const defaults = mockDocs.filter((d) => !customIds.has(d.id));
    return [...customDocs, ...defaults];
  } catch {
    return mockDocs;
  }
}

export function createNewDocument(title = "Untitled Document", category = "General"): MockDocument {
  const id = `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const newDoc: MockDocument = {
    id,
    title,
    category,
    excerpt: "Blank canvas ready for collaborative writing.",
    edited: "Just now",
    editor: "Alex Rivera",
    collaborators: [
      { name: "Alex Rivera", initials: "AR", color: "#f87171" },
    ],
    accent: "#e2dfff",
    isLive: true,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existing: MockDocument[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newDoc, ...existing]));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  return newDoc;
}

export function getSessionCollaborator(): { name: string; initials: string; color: string } {
  if (typeof window === "undefined") {
    return editorCollaborators[0];
  }
  try {
    const stored = sessionStorage.getItem("collabdocs_session_user");
    if (stored) {
      return JSON.parse(stored);
    }
    // Randomly assign one of the 4 personas for this tab so multi-tab tests have distinct colors & names
    const index = Math.floor(Math.random() * editorCollaborators.length);
    const chosen = editorCollaborators[index];
    sessionStorage.setItem("collabdocs_session_user", JSON.stringify(chosen));
    return chosen;
  } catch {
    return editorCollaborators[0];
  }
}
