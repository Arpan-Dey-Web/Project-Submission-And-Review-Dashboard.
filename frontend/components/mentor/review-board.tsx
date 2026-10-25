"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  GitBranch,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api";
import type {
  StatsResponse,
  StatusUpdateResponse,
  SubmissionListResponse,
  SubmissionRow,
} from "@/lib/types";
import { feedbackSchema, zodFieldErrors } from "@/lib/validation";

const PAGE_SIZE = 10;

const statusFilters = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;
type StatusFilter = (typeof statusFilters)[number];

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-destructive/10 text-destructive",
};

const statusDot: Record<string, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-destructive",
};

const filterLabel: Record<StatusFilter, string> = {
  ALL: "All",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}

function StatCard({ label, value, icon: Icon, tint }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardDescription>{label}</CardDescription>
          <span
            className={`flex size-8 items-center justify-center rounded-lg ring-3 ring-inset ${tint}`}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <div aria-hidden className="h-0.5 w-full bg-linear-to-r from-inherit to-transparent" />
    </Card>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

interface ReviewCellProps {
  token: string;
  row: SubmissionRow;
  onDone: () => void;
}

function ReviewCell({ token, row, onDone }: ReviewCellProps) {
  const [rejecting, setRejecting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (status: "APPROVED" | "REJECTED") => {
    setFormError(null);
    setFieldErrors({});

    const body: { status: string; feedback?: string } = { status };
    if (status === "REJECTED") {
      const parsed = feedbackSchema.safeParse(feedback);
      if (!parsed.success) {
        setFieldErrors(zodFieldErrors(parsed.error.issues));
        return;
      }
      body.feedback = parsed.data;
    }

    setPending(true);
    try {
      await apiFetch<StatusUpdateResponse>(`/submissions/${row.id}/status`, {
        method: "PATCH",
        body,
        token,
      });
      setRejecting(false);
      setFeedback("");
      onDone();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Could not update the submission.",
      );
    } finally {
      setPending(false);
    }
  };

  if (row.status !== "PENDING") {
    return <span className="text-xs text-muted-foreground">Reviewed</span>;
  }

  if (rejecting) {
    return (
      <div className="grid gap-1.5">
        <Textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={2}
          placeholder="Why is this rejected? (min 5 characters)"
          aria-invalid={fieldErrors.feedback?.length ? true : undefined}
        />
        {fieldErrors.feedback?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
        {formError && <p className="text-xs text-destructive">{formError}</p>}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => submit("REJECTED")}
          >
            Confirm reject
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => setRejecting(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => submit("APPROVED")}
        >
          <Check data-icon="inline-start" /> Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => setRejecting(true)}
        >
          <X data-icon="inline-start" /> Reject
        </Button>
      </div>
      {formError && <p className="text-xs text-destructive">{formError}</p>}
    </div>
  );
}

const fetchList = ([path, token]: [string, string]): Promise<SubmissionListResponse> =>
  apiFetch<SubmissionListResponse>(path, { token });

/**
 * Builds the query string for the submissions list from URL state so the
 * dashboard is refresh-safe and shareable (/review?status=PENDING&page=2).
 */
function buildListPath(page: number, statusFilter: StatusFilter, search: string): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (search) params.set("search", search);
  return `/submissions?${params.toString()}`;
}

const fetchStats = ([path, token]: [string, string]): Promise<StatsResponse> =>
  apiFetch<StatsResponse>(path, { token });

interface ReviewBoardProps {
  token: string;
}

export function ReviewBoard({ token }: ReviewBoardProps) {
  // URL-synced state: filters, pagination and the search term live in the
  // query string instead of plain useState, so a refresh or shared link
  // (e.g. /review?status=APPROVED&page=2&search=react) restores the view.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawStatus = searchParams.get("status");
  const statusFilter = statusFilters.find((value) => value === rawStatus) ?? "ALL";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const [searchDraft, setSearchDraft] = useState(search);

  const updateUrl = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Keep the draft input in sync when the URL changes from outside
  // (browser back/forward, or a shared link pasted in the same tab).
  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const changeFilter = (value: string) => {
    updateUrl({ status: value === "ALL" ? null : value, page: null });
  };

  const changePage = (next: number) => {
    updateUrl({ page: String(next) });
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // A new result set starts from page 1, so drop the page param.
    updateUrl({ search: searchDraft, page: null });
  };

  const {
    data,
    error,
    isLoading,
    mutate: mutateList,
  } = useSWR<SubmissionListResponse, ApiError>(
    ["submissions", token, buildListPath(page, statusFilter, search)],
    fetchList,
  );
  const {
    data: stats,
    error: statsError,
    mutate: mutateStats,
  } = useSWR<StatsResponse, ApiError>(["stats", token], fetchStats);

  const refreshAll = () => {
    void mutateList();
    void mutateStats();
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard
              label="Total"
              value={stats.totals.total}
              icon={ClipboardList}
              tint="bg-primary/10 text-primary"
            />
            <StatCard
              label="Pending"
              value={stats.totals.pending}
              icon={Clock}
              tint="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
            <StatCard
              label="Approved"
              value={stats.totals.approved}
              icon={Check}
              tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label="Rejected"
              value={stats.totals.rejected}
              icon={X}
              tint="bg-destructive/10 text-destructive"
            />
          </>
        ) : statsError ? (
          <Alert variant="destructive" className="sm:col-span-2 lg:col-span-4">
            <AlertDescription>{statsError.message}</AlertDescription>
          </Alert>
        ) : (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Submissions</CardTitle>
          <Tabs value={statusFilter} onValueChange={changeFilter}>
            <TabsList>
              {statusFilters.map((filter) => (
                <TabsTrigger key={filter} value={filter}>
                  {filterLabel[filter]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
            <div className="relative grow">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search project or student…"
                className="pl-9"
                aria-label="Search submissions"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={!searchDraft.trim()}>
              Search
            </Button>
          </form>
          <CardDescription>
            {isLoading
              ? "Loading submissions…"
              : `${total} submission${total === 1 ? "" : "s"}${
                  statusFilter === "ALL" ? "" : ` (${filterLabel[statusFilter].toLowerCase()})`
                }, page ${page} of ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <div className="grid gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : data && data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">Student</TableHead>
                  <TableHead className="hidden lg:table-cell">Live</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-56">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {data.items.map((row) => (
                  <TableRow key={row.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>
                      <div className="grid">
                        <span className="max-w-64 truncate font-medium">{row.name}</span>
                        <a
                          href={row.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex max-w-64 items-center gap-1 truncate text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          <GitBranch className="size-3 shrink-0" />
                          {row.repoUrl.replace(/^https?:\/\/[^/]*\//, "")}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[11px] font-semibold text-primary">
                          {initials(row.owner.name)}
                        </span>
                        <span className="grid leading-tight">
                          <span>{row.owner.name}</span>
                          <span className="text-xs text-muted-foreground">{row.owner.email}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {row.liveUrl ? (
                        <a
                          href={row.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <ExternalLink className="size-3" />
                          demo
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`gap-1.5 ${statusStyle[row.status]}`}>
                        <span className={`size-1.5 rounded-full ${statusDot[row.status]}`} />
                        {row.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ReviewCell token={token} row={row} onDone={refreshAll} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
              <ClipboardList className="size-6" />
              <span>No submissions match this filter.</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => changePage(page - 1)}
            >
              <ChevronLeft data-icon="inline-start" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => changePage(page + 1)}
            >
              Next <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
