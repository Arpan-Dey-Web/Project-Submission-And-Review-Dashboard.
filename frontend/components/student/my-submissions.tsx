"use client";

import useSWR from "swr";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import type { SubmissionRow } from "@/lib/types";

interface MineResponse {
  items: SubmissionRow[];
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-destructive/10 text-destructive",
};

const statusDot: Record<string, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-destructive",
};

interface MySubmissionsProps {
  token: string;
  refreshSignal: number;
}

export function MySubmissions({ token, refreshSignal }: MySubmissionsProps) {
  const { data, error, isLoading } = useSWR<MineResponse, ApiError>(
    token ? ["submissions/mine", token, refreshSignal] : null,
    ([path, sessionToken]: [string, string, number]) =>
      apiFetch<MineResponse>(path, { token: sessionToken }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My submissions</CardTitle>
        <CardDescription>Every project you have submitted so far.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <div className="grid gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Repo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-0">
              {data.items.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
                  <TableCell className="max-w-56 truncate font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline-offset-4 hover:underline"
                    >
                      {item.repoUrl.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`gap-1.5 ${statusBadge[item.status]}`}>
                      <span className={`size-1.5 rounded-full ${statusDot[item.status] ?? ""}`} />
                      {item.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
