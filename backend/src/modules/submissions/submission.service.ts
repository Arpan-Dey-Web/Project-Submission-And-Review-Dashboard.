import { connectDatabase, db } from "../../prisma/db.ts";
import { or } from "@prisma/orm-postgres/orm-client";
import { errors } from "../../lib/errors.ts";
import { verifyRepoUrl } from "../../lib/github.ts";
import type {
  ListQuery,
  StatsResponse,
  StatusUpdateInput,
  StatusUpdateResponse,
  SubmissionListResponse,
  SubmissionRow,
  SubmitProjectInput,
} from "../../types/index.ts";

export async function createSubmission(userId: number, input: SubmitProjectInput) {
  await connectDatabase();

  const duplicate = await db.orm.public.Submission.where({
    ownerId: userId,
    repoUrl: input.repoUrl,
  }).first();
  if (duplicate) {
    throw errors.conflict(
      "You have already submitted a project with this repo URL",
      { repoUrl: ["You have already submitted a project with this repo URL"] },
    );
  }

  // Pre-flight: never insert a dead / private / README-less repo link.
  await verifyRepoUrl(input.repoUrl);

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

export async function listSubmissions(query: ListQuery): Promise<SubmissionListResponse> {
  await connectDatabase();

  const statusFilter = { status: query.status ?? undefined };
  const search = query.search ?? "";

  // Server-side search: match project name / repo URL directly, and student
  // name / email via the owner's ids (resolved up front so OR-combining the
  // groups stays over this table's own columns).
  const base = db.orm.public.Submission.where(statusFilter);
  const ownerIds = search
    ? (
        await db.orm.public.User.where((user) =>
          or(user.name.ilike(`%${search}%`), user.email.ilike(`%${search}%`)),
        )
          .select("id")
          .all()
      ).map((user) => user.id)
    : [];

  const filtered = search
    ? base.where((submission) =>
        or(
          submission.name.ilike(`%${search}%`),
          submission.repoUrl.ilike(`%${search}%`),
          ...(ownerIds.length > 0
            ? [submission.ownerId.in(ownerIds)]
            : [submission.id.isNull()]),
        ),
      )
    : base;

  const page = await filtered
    .include("owner")
    .orderBy((s) => s.createdAt.desc())
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .all();

  const counter = await filtered.aggregate((agg) => ({ total: agg.count() }));

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
): Promise<StatusUpdateResponse> {
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

export async function submissionStats(): Promise<StatsResponse> {
  await connectDatabase();

  const grouped = await db.orm.public.Submission
    .groupBy("status")
    .aggregate((agg) => ({ count: agg.count() }));

  const byStatus = new Map(grouped.map((row) => [row.status, Number(row.count)]));

  const pending = byStatus.get("PENDING") ?? 0;
  const approved = byStatus.get("APPROVED") ?? 0;
  const rejected = byStatus.get("REJECTED") ?? 0;

  return {
    totals: {
      total: pending + approved + rejected,
      pending,
      approved,
      rejected,
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
