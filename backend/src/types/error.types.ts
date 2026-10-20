import type { FieldErrors } from "./api.types.ts";

export interface HttpError extends Error {
  status: number;
  fieldErrors?: FieldErrors;
}
