"use client";

import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { RoleGuard } from "@/components/role-guard";
import { MySubmissions } from "@/components/student/my-submissions";
import { SubmitForm } from "@/components/student/submit-form";
import { useSession } from "@/hooks/use-session";

function StudentPortal() {
  const { session } = useSession();
  const [submittedCount, setSubmittedCount] = useState(0);

  if (!session) return null;

  return (
    <div className="min-h-svh">
      <AppHeader heading="My submissions" />
      <main className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 py-8">
        <SubmitForm token={session.token} onSuccess={() => setSubmittedCount((n) => n + 1)} />
        <MySubmissions token={session.token} refreshSignal={submittedCount} />
      </main>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <RoleGuard allow={["STUDENT"]}>
      <StudentPortal />
    </RoleGuard>
  );
}
