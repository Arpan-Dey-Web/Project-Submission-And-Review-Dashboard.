import type { Request } from "express";

export interface AuthUser {
  id: number;
  role: "STUDENT" | "MENTOR";
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
