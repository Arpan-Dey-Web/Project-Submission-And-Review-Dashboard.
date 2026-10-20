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

/**
 * Students create submissions. The owner id comes from the verified JWT,
 * never from the request body — clients cannot submit on behalf of others.
 */
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

/** Student: all of my own submissions. */
submissionsRouter.get("/mine", authenticate, listMySubmissionsController);

/** Mentor table: pagination + server-side status filter. */
submissionsRouter.get("/", authenticate, requireRole("MENTOR"), listSubmissionsController);

/**
 * Mentor verdict. Order matters and is teachable:
 * authenticate (who are you) -> requireRole (what may you do) ->
 * validate body -> controller parses params + writes.
 */
submissionsRouter.patch(
  "/:id/status",
  authenticate,
  requireRole("MENTOR"),
  validateBody(statusUpdateSchema),
  updateStatusController,
);

/** Aggregated stats (also used by the student sidebar). */
statsRouter.get("/", authenticate, submissionStatsController);
