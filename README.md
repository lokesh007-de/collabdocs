# CollabDocs Frontend

The frontend for CollabDocs, built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **TipTap + Yjs (`y-websocket`)**.

For root instructions and full backend documentation, refer to [`../README.md`](../README.md).

## Features

- **Live Collaboration & Synchronization:** Powered by TipTap and Yjs (`WebsocketProvider` pointing to the Node.js + Express WebSocket server). Multiple peers open to the same document URL synchronize edits and cursor awareness without conflict.
- **Multi-Cursor Presence:** Live colored carets with name tags and selection highlights.
- **Rich Editor Ribbon:** Formatting toolbar with Undo/Redo, Heading 1/2/3, Bold, Italic, Underline, Bullet List, Numbered List, Blockquote, Code Block, Link insertion, and active state indicators.
- **Live Share Modal:** Connected to `/api/docs/:id/share` for inviting registered users by email as `Editor` or `Viewer`, modifying roles, or removing access.
- **Dynamic Dashboard:** Connected to `/api/docs` with document creation, tab filtering (All Docs, Created by me, Shared with me), and search.
- **Real Authentication & Route Protection:** Full authentication forms on `/login` and `/signup` connected to the backend auth API with secure session cookies and Next.js middleware protection on `/dashboard` and `/doc/[id]`.
- **Version History Drawer:** Manual snapshot saving and single-click restoration backed by `/api/docs/:id/versions`.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment (optional)
Create `.env.local` if using custom URLs:
```ini
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Type-check
```bash
# Type check
npx tsc --noEmit

# Production build
npm run build
```
