import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../types/index.ts";
import type { ListQuery, StatusUpdateInput, SubmitProjectInput } from "../../types/index.ts";
import { parseOrThrow, validated } from "../../lib/validate.ts";
import {
  createSubmission,
  listMySubmissions,
  listSubmissions,
  submissionStats,
  updateStatus,
} from "./submission.service.ts";
import { idParamSchema, listQuerySchema } from "./submission.validation.ts";

export async function createSubmissionController(req: Request, res: Response): Promise<void> {
  const input = validated<SubmitProjectInput>(req);
  const submission = await createSubmission(
    (req as AuthenticatedRequest).user.id,
    input,
  );
  res.status(201).json({ submission });
}

export async function listMySubmissionsController(req: Request, res: Response): Promise<void> {
  const items = await listMySubmissions((req as AuthenticatedRequest).user.id);
  res.json({ items });
}

export async function listSubmissionsController(req: Request, res: Response): Promise<void> {
  const query = parseOrThrow(listQuerySchema, req.query);
  const result = await listSubmissions(query);
  res.json(result);
}

export async function updateStatusController(req: Request, res: Response): Promise<void> {
  const { id } = parseOrThrow(idParamSchema, req.params);
  const input = validated<StatusUpdateInput>(req);
  const result = await updateStatus((req as AuthenticatedRequest).user.id, id, input);
  res.json(result);
}

export async function submissionStatsController(_req: Request, res: Response): Promise<void> {
  const stats = await submissionStats();
  res.json(stats);
}
