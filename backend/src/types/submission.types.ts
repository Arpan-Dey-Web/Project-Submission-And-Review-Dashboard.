import type { z } from "zod";

import type {
  idParamSchema,
  listQuerySchema,
  statusUpdateSchema,
  submitProjectSchema,
} from "../modules/submissions/submission.validation.ts";

export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

export interface SubmissionRow {
  id: number;
  name: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: string;
  createdAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SubmissionListResponse = Paginated<SubmissionRow>;

export interface StatusUpdateResponse {
  submission: SubmissionRow | null;
  feedback: { content: string } | null;
}
