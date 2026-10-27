# CollabDocs

A real-time collaborative document editor built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **TipTap + Yjs (WebRTC & BroadcastChannel)**. CollabDocs faithfully brings the Stitch design system to life with sub-50ms peer synchronization, multi-cursor presence, and an editorial canvas.

## Features

- **Live Collaboration & Synchronization:** Powered by TipTap and Yjs (`WebrtcProvider` in room `collabdocs-${docId}`). Any two browser tabs open to the same document URL sync edits live with zero overwrite conflicts.
- **Multi-Cursor Presence:** Live colored carets with name tags and selection highlights. Each browser session/tab is dynamically assigned a distinct collaborator identity (Alex Rivera, Elena Chen, Marcus Vance, Maya Lin).
- **Rich Editor Ribbon:** Formatting toolbar with Undo/Redo, Heading 1/2/3, Bold, Italic, Underline, Bullet List, Numbered List, Blockquote, Code Block, Link insertion, and active state indicators.
- **Interactive Share Modal:** Accessible from the editor's Share button; features role dropdowns (`Owner`, `Editor`, `Commenter`, `Viewer`), an "Anyone with the link" permission toggle, and a clipboard copy button with visual confirmation.
- **Dynamic Dashboard:** Backed by `lib/mockDocs.ts` with local session persistence. "New Document" dynamically creates documents with unique IDs and immediately opens `/doc/[id]`. Includes search, view toggling (grid/list), and template starters.
- **Controlled Authentication Forms:** Full client-side validation on `/login` and `/signup` with password strength evaluation (4-bar indicator), terms acceptance, and redirect to `/dashboard`.
- **Responsive Layout:** Adaptive desktop sidebar, collapsible navigation, mobile presence badges, and elevated canvas sheets on a `#faf8ff` surface.

## Getting Started

### Prerequisites

- Node.js 20.9+ or higher
- npm 10+

### Installation & Run

1. Navigate to the project directory:
   ```bash
   cd collabdocs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verifying Live Multi-Tab Synchronization

1. Start the dev server (`npm run dev`).
2. Open [http://localhost:3000/doc/test1](http://localhost:3000/doc/test1) in **Tab 1**.
3. Open [http://localhost:3000/doc/test1](http://localhost:3000/doc/test1) in **Tab 2** (or in an incognito window / side-by-side window).
4. Notice that Tab 1 and Tab 2 connect to room `collabdocs-test1` and receive distinct collaborator identities (e.g., Alex Rivera with a coral caret and Elena Chen with an emerald caret).
5. Type or select text in either tab — changes and cursor positions reflect instantaneously across both tabs.

### Production Build & Linting

```bash
# Type-check with zero emit
npx tsc --noEmit

# Run ESLint
npm run lint

# Create production build
npm run build

# Start production server
npm run start
```

## Routes

| Route | Description |
| :--- | :--- |
| `/` | Landing page featuring product hero, live demo preview, features grid, workflow steps, CRDT mesh architecture diagram, and CTA. |
| `/login` | Controlled login form with email & password validation, remember-device checkbox, and split-screen live preview card. |
| `/signup` | Controlled registration form with full name, email, password strength meter, terms acceptance, and testimonials. |
| `/dashboard` | Workspace document list with "New Document" generator, quick-start templates, search filtering, and grid/list view. |
| `/doc/[id]` | Real-time collaborative editor workspace with TipTap, Yjs WebRTC provider, presence avatars, comments drawer, and share modal. |

## Folder Structure

```text
collabdocs/
├── app/
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard with document list, template cards & search
│   ├── doc/
│   │   └── [id]/
│   │       └── page.tsx       # Dynamic collaborative document route
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── signup/
│   │   └── page.tsx           # Signup page
│   ├── favicon.ico
│   ├── globals.css            # TipTap cursor styles, ProseMirror typography, and base CSS
│   ├── layout.tsx             # Root layout with Inter font provider
│   └── page.tsx               # Marketing landing page
├── components/
│   ├── AuthForm.tsx           # Controlled login & signup form with password strength
│   ├── AvatarStack.tsx        # Overlapping avatar stack with count overflow
│   ├── DocCard.tsx            # Document card with preview skeleton & live badge
│   ├── Editor.tsx             # TipTap collaborative editor component
│   ├── EditorWorkspace.tsx    # Yjs WebrtcProvider room manager, comments & active peers
│   ├── Footer.tsx             # Marketing footer
│   ├── Navbar.tsx             # Fixed landing navigation bar
│   ├── PresenceAvatars.tsx    # Live collaborator indicator
│   ├── ShareModal.tsx         # Document sharing dialog with role dropdowns & copy link
│   ├── Sidebar.tsx            # Left navigation rail with "+ New Document" action
│   ├── Toolbar.tsx            # TipTap rich text formatting toolbar
│   └── TopBar.tsx             # Editor header with document title, live peers & Share button
├── lib/
│   └── mockDocs.ts            # Mock documents, collaborator definitions & storage helpers
├── package.json
├── tailwind.config.ts         # Synchronous Canvas design tokens, colors & typography
└── tsconfig.json
```

## What Is Mocked vs. What Is Live

- **Live & Working:**
  - Full collaborative text synchronization across browser tabs via TipTap + Yjs (`WebrtcProvider` + `BroadcastChannel`).
  - Multi-user colored carets, name tags, and selections.
  - Full rich text toolbar operations (bold, italic, underline, headings 1/2/3, bullet list, numbered list, blockquote, code block, links).
  - Dynamic document creation from Dashboard ("New Document" and Quick Start templates) generating unique IDs and routing to `/doc/[id]`.
  - Share modal clipboard copying (`navigator.clipboard`) with active feedback.
  - Active peer awareness count and dynamic avatar stack in `TopBar` and `PresenceAvatars`.
  - Interactive comments feed in the editor drawer.
- **Mocked / Presentation:**
  - Backend database persistence: documents created in the session persist in browser memory (`localStorage`), but there is no external database.
  - Authentication: forms validate input client-side and navigate to `/dashboard` without contacting a backend auth provider.
  - Email invitations in `ShareModal` are client-simulated.
