import { connectDatabase, db } from "../../prisma/db.ts";
import { errors } from "../../lib/errors.ts";
import type { ListQuery, StatusUpdateInput, SubmitProjectInput } from "./submission.validation.ts";

export interface SubmissionRow {
  id: number;
  name: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: string;
  createdAt: string;
  owner: { id: number; name: string; email: string };
}

export async function createSubmission(userId: number, input: SubmitProjectInput) {
  await connectDatabase();

  const duplicate = await db.orm.public.Submission.where({
    ownerId: userId,
    repoUrl: input.repoUrl,
  }).first();
  if (duplicate) {
    const message = "You have already submitted a project with this repo URL";
    const error = errors.conflict(message);
    Object.assign(error, { fieldErrors: { repoUrl: [message] } });
    throw error;
  }

  const submission = await db.orm.public.Submission.create({
    ownerId: userId,
    name: input.name,
    repoUrl: input.repoUrl,
    liveUrl: input.liveUrl ?? null,
    description: input.description,
    status: "PENDING",
  });

  return submission;
}

export async function listMySubmissions(userId: number): Promise<SubmissionRow[]> {
  await connectDatabase();

  const rows = await db.orm.public.Submission.where({ ownerId: userId })
    .include("owner")
    .orderBy((s) => s.createdAt.desc())
    .all();

  return rows.map(toRow);
}

export async function listSubmissions(query: ListQuery) {
  await connectDatabase();

  const page = await db.orm.public.Submission.where({ status: query.status ?? undefined })
    .include("owner")
    .orderBy((s) => s.createdAt.desc())
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .all();

  const counter = await db.orm.public.Submission.where({ status: query.status ?? undefined })
    .aggregate((agg) => ({ total: agg.count() }));

  return {
    items: page.map(toRow),
    page: query.page,
    pageSize: query.pageSize,
    total: counter.total,
    totalPages: Math.max(1, Math.ceil(counter.total / query.pageSize)),
  };
}

export async function updateStatus(
  mentorId: number,
  submissionId: number,
  input: StatusUpdateInput,
) {
  await connectDatabase();

  const submission = await db.orm.public.Submission.where({ id: submissionId }).first();
  if (!submission) {
    throw errors.notFound("Submission not found");
  }

  if (submission.status !== "PENDING") {
    throw errors.unprocessable(`This submission was already ${submission.status.toLowerCase()}`);
  }

  const updated = await db.orm.public.Submission.where({ id: submissionId })
    .include("owner")
    .update({ status: input.status });

  let feedback: { content: string } | null = null;
  if (input.feedback) {
    const created = await db.orm.public.Feedback.create({
      submissionId: submission.id,
      mentorId,
      content: input.feedback,
    });
    feedback = { content: created.content };
  }

  return { submission: updated ? toRow(updated) : null, feedback };
}

export async function submissionStats(): Promise<{
  totals: { total: number; pending: number; approved: number; rejected: number };
}> {
  await connectDatabase();

  const total = await db.orm.public.Submission.aggregate((agg) => ({ value: agg.count() }));

  const grouped = await db.orm.public.Submission
    .groupBy("status")
    .aggregate((agg) => ({ count: agg.count() }));

  const byStatus = new Map(grouped.map((row) => [row.status, Number(row.count)]));

  return {
    totals: {
      total: Number(total.value),
      pending: byStatus.get("PENDING") ?? 0,
      approved: byStatus.get("APPROVED") ?? 0,
      rejected: byStatus.get("REJECTED") ?? 0,
    },
  };
}

function toRow(row: {
  id: number;
  name: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: string;
  createdAt: unknown;
  owner: { id: number; name: string; email: string };
}): SubmissionRow {
  return {
    id: row.id,
    name: row.name,
    repoUrl: row.repoUrl,
    liveUrl: row.liveUrl,
    description: row.description,
    status: row.status,
    createdAt: String(row.createdAt),
    owner: {
      id: row.owner.id,
      name: row.owner.name,
      email: row.owner.email,
    },
  };
}
