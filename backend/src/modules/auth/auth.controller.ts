import type { Request, Response } from "express";

import { validated } from "../../lib/validate.ts";
import { login, signupStudent } from "./auth.service.ts";
import type { LoginInput, SignupInput } from "../../types/index.ts";

export async function signupController(req: Request, res: Response): Promise<void> {
  const input = validated<SignupInput>(req);
  const result = await signupStudent(input);
  res.status(201).json({ user: result.user, token: result.token });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const input = validated<LoginInput>(req);
  const result = await login(input);
  res.json(result);
}
