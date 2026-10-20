export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Role = "STUDENT" | "MENTOR";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: SessionUser;
  token: string;
}

export interface FieldErrors {
  [field: string]: string[];
}

export interface ErrorPayload {
  error: string;
  fieldErrors?: FieldErrors;
}

export interface RateLimitPayload extends ErrorPayload {
  retryAfterMs: number;
}

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

export interface StatsResponse {
  totals: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface CreateSubmissionResponse {
  submission: SubmissionRow;
}
