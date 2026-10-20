import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.ts";

export interface AuthUser {
  id: number;
  role: "STUDENT" | "MENTOR";
}

// Only sign what is needed for AuthZ: subject + role. Claims travel in the
// token, so anything in here is readable by whoever holds it — no secrets.
export function signToken(user: AuthUser): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ sub: String(user.id), role: user.role }, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.jwtSecret);
  if (
    typeof payload === "string" ||
    payload.sub === undefined ||
    (payload.role !== "STUDENT" && payload.role !== "MENTOR")
  ) {
    throw new Error("Invalid token payload");
  }
  return { id: Number(payload.sub), role: payload.role };
}

export function extractBearerToken(header?: string): string | null {
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Middleware 1: AuthN. Verifies the caller is someone we issued a token to.
 * Middleware 2: requireRole. AuthZ. Verifies the caller may do the thing.
 * Keeping them separate is the whole RBAC pipeline story.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    (req as AuthenticatedRequest).user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { user } = req as AuthenticatedRequest;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "You do not have permission to do this" });
      return;
    }
    next();
  };
}
