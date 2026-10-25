"use client";

import { Suspense } from "react";

import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/components/role-guard";
import { ReviewBoard } from "@/components/mentor/review-board";
import { useSession } from "@/hooks/use-session";

function ReviewDashboard() {
  const { session } = useSession();

  if (!session) return null;

  return (
    <div className="min-h-svh">
      <AppHeader heading="Review dashboard" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        {/* Suspense boundary: ReviewBoard reads URL state via useSearchParams,
            which needs a boundary during prerendering. */}
        <Suspense fallback={null}>
          <ReviewBoard token={session.token} />
        </Suspense>
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <RoleGuard allow={["MENTOR"]}>
      <ReviewDashboard />
    </RoleGuard>
  );
}
