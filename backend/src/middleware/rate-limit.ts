import type { NextFunction, Request, RequestHandler, Response } from "express";

interface BucketOptions {
  windowMs: number;
  max: number;
  /** Build the bucket key from the request (userId, IP, etc.). */
  key?: (req: Request) => string;
  /** Message when the limit trips. */
  message?: string;
}

/**
 * In-memory sliding-window rate limiter.
 * Key idea: log each request's timestamp per key, drop timestamps older than
 * the window, and reject when the count of recent hits reaches `max`.
 * Good enough for a single-process dev/demo server; a horizontal-scale app
 * would swap the store for Redis.
 */
export function rateLimit(options: BucketOptions): RequestHandler {
  const { windowMs, max, key = (req) => req.ip ?? "unknown", message } = options;
  const hits = new Map<string, number[]>();
  let lastSweep = Date.now();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();

    // Periodic sweep instead of a timer: no refs to keep alive.
    if (now - lastSweep > windowMs) {
      lastSweep = now;
      for (const [k, times] of hits) {
        const fresh = times.filter((t) => now - t < windowMs);
        if (fresh.length === 0) hits.delete(k);
        else hits.set(k, fresh);
      }
    }

    const bucketKey = key(req);
    const timestamps = (hits.get(bucketKey) ?? []).filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      const oldest = timestamps[0] ?? now;
      res.status(429).json({
        error: message ?? "Too many requests. Please slow down and try again later.",
        retryAfterMs: oldest + windowMs - now,
      });
      return;
    }

    timestamps.push(now);
    hits.set(bucketKey, timestamps);
    next();
  };
}
