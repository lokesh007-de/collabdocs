import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/error";
import { Role } from "@prisma/client";

const router = Router();

// All document routes require authentication
router.use(requireAuth);

// ── Permission helper ──────────────────────────────────────────────────────────
/**
 * Returns the user's effective role on a document:
 * "OWNER" if they own it, "EDITOR" / "VIEWER" if they're a collaborator,
 * or null if they have no access.
 */
export async function getDocRole(
  docId: string,
  userId: string
): Promise<"OWNER" | Role | null> {
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: { ownerId: true },
  });
  if (!doc) return null;
  if (doc.ownerId === userId) return "OWNER";

  const collab = await prisma.collaborator.findUnique({
    where: { docId_userId: { docId, userId } },
    select: { role: true },
  });
  return collab?.role ?? null;
}

// ── GET /api/docs ──────────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;

    const [ownedDocs, collaboratedDocs] = await Promise.all([
      prisma.document.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: { id: true, name: true, email: true } },
          collaborators: {
            select: { role: true, user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.document.findMany({
        where: { collaborators: { some: { userId } } },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: { id: true, name: true, email: true } },
          collaborators: {
            select: { role: true, user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    res.json({
      owned: ownedDocs.map((d) => ({ ...d, userRole: "OWNER" })),
      shared: collaboratedDocs.map((d) => {
        const myCollab = d.collaborators.find((c) => c.user.id === userId);
        return { ...d, userRole: myCollab?.role ?? "VIEWER" };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/docs ─────────────────────────────────────────────────────────────
const createDocSchema = z.object({
  title: z.string().min(1).max(255).optional(),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createDocSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const userId = req.user!.sub;
    const doc = await prisma.document.create({
      data: {
        title: parsed.data.title ?? "Untitled Document",
        ownerId: userId,
      },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    res.status(201).json({ ...doc, userRole: "OWNER" });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/docs/:id ──────────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const role = await getDocRole(docId, userId);

    if (!role) {
      next(createError("Document not found or access denied.", 404));
      return;
    }

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        owner: { select: { id: true, name: true, email: true } },
        collaborators: {
          select: { role: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.json({ ...doc, userRole: role });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/docs/:id ────────────────────────────────────────────────────────
const updateDocSchema = z.object({
  title: z.string().min(1).max(255),
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const role = await getDocRole(docId, userId);

    if (!role || role === "VIEWER") {
      next(createError("You do not have permission to edit this document.", 403));
      return;
    }

    const parsed = updateDocSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const doc = await prisma.document.update({
      where: { id: docId },
      data: { title: parsed.data.title },
      select: { id: true, title: true, updatedAt: true },
    });

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/docs/:id ───────────────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const role = await getDocRole(docId, userId);

    if (role !== "OWNER") {
      next(createError("Only the document owner can delete it.", 403));
      return;
    }

    await prisma.document.delete({ where: { id: docId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
