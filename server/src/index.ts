import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import docsRouter from "./routes/docs";
import shareRouter from "./routes/share";
import versionsRouter from "./routes/versions";
import { errorHandler } from "./middleware/error";
import { createWsServer } from "./ws/yjsHandler";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/docs", docsRouter);
// Nested share + version routes (mergeParams is set in their routers)
app.use("/api/docs/:id/share", shareRouter);
app.use("/api/docs/:id/versions", versionsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Centralized error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP + WebSocket server ───────────────────────────────────────────────────
const server = http.createServer(app);
createWsServer(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[CollabDocs] Server running on http://localhost:${PORT}`);
  console.log(`[CollabDocs] WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

