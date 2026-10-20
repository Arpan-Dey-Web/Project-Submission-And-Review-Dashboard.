import type { FieldErrors, HttpError } from "../types/index.ts";

export type { HttpError };

export function createHttpError(
  status: number,
  message: string,
  fieldErrors?: FieldErrors,
): HttpError {
  const error = Error(message);
  const extra = error as unknown as {
    status: number;
    name: string;
    fieldErrors?: FieldErrors;
  };
  extra.status = status;
  extra.name = "HttpError";
  if (fieldErrors) extra.fieldErrors = fieldErrors;
  return error as HttpError;
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof Error &&
    typeof (error as { status?: unknown }).status === "number" &&
    (error as unknown as { status: number }).status >= 400
  );
}

export const errors = {
  badRequest: (message: string) => createHttpError(400, message),
  unauthorized: (message = "Authentication required") => createHttpError(401, message),
  forbidden: (message = "You do not have permission to do this") => createHttpError(403, message),
  notFound: (message = "Not found") => createHttpError(404, message),
  conflict: (message: string, fieldErrors?: FieldErrors) => createHttpError(409, message, fieldErrors),
  unprocessable: (message: string) => createHttpError(422, message),
};
