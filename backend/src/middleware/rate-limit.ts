import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { BucketOptions } from "../types/index.ts";

export function rateLimit(options: BucketOptions): RequestHandler {
  const { windowMs, max, key = (req) => req.ip ?? "unknown", message } = options;
  const hits = new Map<string, number[]>();
  let lastSweep = Date.now();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();

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
