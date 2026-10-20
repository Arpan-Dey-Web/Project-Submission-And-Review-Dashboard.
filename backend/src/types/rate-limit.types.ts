import type { Request } from "express";

export interface BucketOptions {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
  message?: string;
}
