import { Router } from "express";

import { env } from "../../config/env.ts";
import { authenticate, requireRole, type AuthenticatedRequest } from "../../lib/auth.ts";
import { validateBody } from "../../lib/validate.ts";
import { rateLimit } from "../../middleware/rate-limit.ts";
import {
  createSubmissionController,
  listMySubmissionsController,
  listSubmissionsController,
  submissionStatsController,
  updateStatusController,
} from "./submission.controller.ts";
import { statusUpdateSchema, submitProjectSchema } from "./submission.validation.ts";

export const submissionsRouter = Router();
export const statsRouter = Router();

const limit = env.submissionRateLimit;

submissionsRouter.post(
  "/",
  authenticate,
  requireRole("STUDENT"),
  rateLimit({
    windowMs: limit.windowMs,
    max: limit.max,
    key: (req) => String((req as AuthenticatedRequest).user.id),
    message: "Submission limit reached. Wait a bit before submitting again.",
  }),
  validateBody(submitProjectSchema),
  createSubmissionController,
);

submissionsRouter.get("/mine", authenticate, listMySubmissionsController);

submissionsRouter.get("/", authenticate, requireRole("MENTOR"), listSubmissionsController);

submissionsRouter.patch(
  "/:id/status",
  authenticate,
  requireRole("MENTOR"),
  validateBody(statusUpdateSchema),
  updateStatusController,
);

statsRouter.get("/", authenticate, submissionStatsController);
