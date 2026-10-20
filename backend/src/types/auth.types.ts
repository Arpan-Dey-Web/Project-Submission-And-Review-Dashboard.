import type { z } from "zod";

import type { loginSchema, signupSchema } from "../modules/auth/auth.validation.ts";

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface UserRow {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}
