import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Centralized error handler — must be registered last as an Express middleware.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message = err.message ?? "Internal server error";

  // Never leak stack traces or internals to the client
  if (status === 500) {
    console.error("[Server Error]", err);
  }

  res.status(status).json({ error: message });
}

/** Convenience helper for creating typed HTTP errors */
export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
}

