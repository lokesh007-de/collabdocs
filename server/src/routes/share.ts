import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/error";
import { getDocRole } from "./docs";
import { Role } from "@prisma/client";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// ── GET /api/docs/:id/share ────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
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
        owner: { select: { id: true, name: true, email: true } },
        collaborators: {
          select: {
            role: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    res.json({
      owner: doc?.owner ?? null,
      collaborators: doc?.collaborators ?? [],
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/docs/:id/share ───────────────────────────────────────────────────
const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["VIEWER", "EDITOR"]),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const myRole = await getDocRole(docId, userId);

    if (myRole !== "OWNER") {
      next(createError("Only the document owner can invite collaborators.", 403));
      return;
    }

    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, role: inviteRole } = parsed.data;

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) {
      res.status(404).json({ error: "No account found with that email address." });
      return;
    }
    if (invitee.id === userId) {
      res.status(400).json({ error: "You cannot invite yourself." });
      return;
    }

    const doc = await prisma.document.findUnique({ where: { id: docId }, select: { ownerId: true } });
    if (doc?.ownerId === invitee.id) {
      res.status(400).json({ error: "This user is already the document owner." });
      return;
    }

    // Upsert collaborator record
    const collab = await prisma.collaborator.upsert({
      where: { docId_userId: { docId, userId: invitee.id } },
      update: { role: inviteRole as Role },
      create: { docId, userId: invitee.id, role: inviteRole as Role },
      select: {
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(collab);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/docs/:id/share/:targetUserId ────────────────────────────────────
const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "EDITOR"]),
});

router.patch("/:targetUserId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const targetUserId = String(req.params.targetUserId);

    const myRole = await getDocRole(docId, userId);
    if (myRole !== "OWNER") {
      next(createError("Only the document owner can update roles.", 403));
      return;
    }

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const collab = await prisma.collaborator.update({
      where: { docId_userId: { docId, userId: targetUserId } },
      data: { role: parsed.data.role as Role },
      select: {
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(collab);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/docs/:id/share/:targetUserId ───────────────────────────────────
router.delete("/:targetUserId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const docId = String(req.params.id);
    const targetUserId = String(req.params.targetUserId);

    const myRole = await getDocRole(docId, userId);
    if (myRole !== "OWNER") {
      next(createError("Only the document owner can remove collaborators.", 403));
      return;
    }

    await prisma.collaborator.delete({
      where: { docId_userId: { docId, userId: targetUserId } },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
