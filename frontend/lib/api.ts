import type { ErrorPayload } from "@/lib/types";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly retryAfterMs?: number;

  constructor(payload: ErrorPayload & { retryAfterMs?: number }, status: number) {
    super(payload.error);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = payload.fieldErrors;
    this.retryAfterMs = payload.retryAfterMs;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const API_BASE = `${API_URL}/api`;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

export async function apiFetch<T>(rawPath: string, options: ApiRequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
    });
  } catch {
    throw new ApiError({ error: "Could not reach the server. Is the backend running?" }, 0);
  }

  const payload = (await response.json().catch(() => null)) as
    | (ErrorPayload & { retryAfterMs?: number })
    | null;

  if (!response.ok) {
    const fallback: ErrorPayload = {
      error:
        response.status === 429
          ? "Too many requests. Please wait a moment and try again."
          : `Request failed (${response.status})`,
    };
    throw new ApiError(payload ?? fallback, response.status);
  }

  return payload as T;
}
