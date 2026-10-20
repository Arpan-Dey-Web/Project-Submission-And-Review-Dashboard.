import express from "express";

import cors from "cors";

import { env } from "./config/env.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { authRouter } from "./modules/auth/auth.route.ts";
import { statsRouter, submissionsRouter } from "./modules/submissions/submission.route.ts";

export function application() {
  const expressApp = express();

  expressApp.use(cors({ origin: env.corsOrigin, credentials: false }));
  expressApp.use(express.json({ limit: "1mb" }));

  // Health check for setup docs / monitoring.
  expressApp.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  const api = express.Router();

  api.use("/auth", authRouter);
  api.use("/submissions", submissionsRouter);
  api.use("/stats", statsRouter);

  expressApp.use("/api", api);
  expressApp.use(errorHandler);

  return expressApp;
}
