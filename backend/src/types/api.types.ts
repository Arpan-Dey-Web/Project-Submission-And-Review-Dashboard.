
export interface FieldErrors {
  [field: string]: string[];
}

export interface ErrorPayload {
  error: string;
  fieldErrors?: FieldErrors;
}

export interface RateLimitPayload extends ErrorPayload {
  retryAfterMs: number;
}
