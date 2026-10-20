import type { Request, RequestHandler, Response } from "express";
import { type ZodTypeAny, type TypeOf } from "zod";

export function validateBody<T extends ZodTypeAny>(schema: T): RequestHandler {
  return async (req: Request, res: Response, next: (error?: unknown) => void) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        fieldErrors: zodToFieldErrors(result.error),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function parseOrThrow<T extends ZodTypeAny>(schema: T, input: unknown): TypeOf<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new FieldValidationError(result.error);
  }
  return result.data;
}

export function zodToFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }): {
  [key: string]: string[];
} {
  const fieldErrors: { [key: string]: string[] } = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

export class FieldValidationError extends Error {
  readonly fieldErrors;
  constructor(error: Parameters<typeof zodToFieldErrors>[0]) {
    super("Validation failed");
    this.name = "FieldValidationError";
    this.fieldErrors = zodToFieldErrors(error);
  }
}
