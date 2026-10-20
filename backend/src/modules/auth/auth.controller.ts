import type { Request, Response } from "express";

import { login, signupStudent } from "./auth.service.ts";
import type { LoginInput, SignupInput } from "./auth.validation.ts";

export async function signupController(req: Request, res: Response): Promise<void> {
  const input = req.body as SignupInput;
  const result = await signupStudent(input);
  res.status(201).json({ user: result.user, token: result.token });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;
  const result = await login(input);
  res.json(result);
}
