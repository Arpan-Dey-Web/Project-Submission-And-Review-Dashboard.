import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../lib/auth.ts";
import { parseOrThrow } from "../../lib/validate.ts";
import {
  createSubmission,
  listMySubmissions,
  listSubmissions,
  submissionStats,
  updateStatus,
} from "./submission.service.ts";
import type { ListQuery, StatusUpdateInput, SubmitProjectInput } from "./submission.validation.ts";
import { idParamSchema, listQuerySchema } from "./submission.validation.ts";

/**
 * Controllers translate HTTP <-> app language. They own `req`/`res`, read
 * validated input, call the service, and shape the JSON the client sees.
 * All business rules stay in the service — a controller must be boring.
 */
export async function createSubmissionController(req: Request, res: Response): Promise<void> {
  const input = req.body as SubmitProjectInput;
  const submission = await createSubmission((req as AuthenticatedRequest).user.id, input);
  res.status(201).json({ submission });
}

export async function listMySubmissionsController(req: Request, res: Response): Promise<void> {
  const items = await listMySubmissions((req as AuthenticatedRequest).user.id);
  res.json({ items });
}

export async function listSubmissionsController(req: Request, res: Response): Promise<void> {
  const query = parseOrThrow(listQuerySchema, req.query) as ListQuery;
  const result = await listSubmissions(query);
  res.json(result);
}

export async function updateStatusController(req: Request, res: Response): Promise<void> {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const input = req.body as StatusUpdateInput;
  const result = await updateStatus((req as AuthenticatedRequest).user.id, id, input);
  res.json(result);
}

export async function submissionStatsController(_req: Request, res: Response): Promise<void> {
  const stats = await submissionStats();
  res.json(stats);
}
