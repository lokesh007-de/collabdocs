import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/error";
import { getDocRole } from "./docs";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// ── GET /api/docs/:id/versions ─────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const role = await getDocRole(docId, userId);

    if (!role) {
      next(createError("Document not found or access denied.", 404));
      return;
    }

    const versions = await prisma.version.findMany({
      where: { docId },
      select: { id: true, label: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(versions);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/docs/:id/versions ────────────────────────────────────────────────
const createVersionSchema = z.object({
  label: z.string().max(100).optional(),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const role = await getDocRole(docId, userId);

    if (!role || role === "VIEWER") {
      next(createError("You do not have permission to save a version.", 403));
      return;
    }

    const parsed = createVersionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: { yjsState: true },
    });

    if (!doc?.yjsState) {
      res.status(400).json({ error: "Document has no content to snapshot yet." });
      return;
    }

    const version = await prisma.version.create({
      data: {
        docId,
        snapshot: doc.yjsState,
        label: parsed.data.label ?? null,
      },
      select: { id: true, label: true, createdAt: true },
    });

    res.status(201).json(version);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/docs/:id/versions/:vId/restore ──────────────────────────────────
router.post("/:vId/restore", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const vId = String(req.params.vId);
    const role = await getDocRole(docId, userId);

    if (role !== "OWNER" && role !== "EDITOR") {
      next(createError("You do not have permission to restore a version.", 403));
      return;
    }

    const version = await prisma.version.findUnique({
      where: { id: vId },
      select: { snapshot: true, docId: true },
    });

    if (!version || version.docId !== docId) {
      next(createError("Version not found.", 404));
      return;
    }

    // Auto-save the current state before restoring
    const current = await prisma.document.findUnique({
      where: { id: docId },
      select: { yjsState: true },
    });

    if (current?.yjsState) {
      await prisma.version.create({
        data: {
          docId,
          snapshot: current.yjsState,
          label: "Auto-saved before restore",
        },
      });
    }

    // Write snapshot bytes back to the document
    await prisma.document.update({
      where: { id: docId },
      data: { yjsState: version.snapshot },
    });

    res.json({ message: "Version restored successfully." });
  } catch (err) {
    next(err);
  }
});

export default router;
