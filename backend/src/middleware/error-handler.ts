import type { ErrorRequestHandler } from "express";

import { isHttpError } from "../lib/errors.ts";
import { FieldValidationError } from "../lib/validate.ts";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof FieldValidationError) {
    res.status(400).json({
      error: error.message,
      fieldErrors: error.fieldErrors,
    });
    return;
  }
  if (isHttpError(error)) {
    const extra = (error as { fieldErrors?: unknown }).fieldErrors;
    res.status(error.status).json(
      extra ? { error: error.message, fieldErrors: extra } : { error: error.message },
    );
    return;
  }
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Something went wrong on our end" });
};
