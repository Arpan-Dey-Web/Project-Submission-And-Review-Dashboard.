import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Rocket,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    icon: Rocket,
    title: "Submit your project",
    body: "One portal to hand over your repo, live link and pitch — validated before it ever reaches a mentor.",
  },
  {
    icon: ClipboardCheck,
    title: "Get reviewed properly",
    body: "Mentors approve or reject your work with written feedback, so every submission gets a real answer.",
  },
  {
    icon: BarChart3,
    title: "Track live stats",
    body: "Counters for pending, approved and rejected submissions update as mentors work.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-24 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary ring-3 ring-primary/10">
          <ShieldCheck className="size-3.5" />
          JWT-secured student &amp; mentor workspace
        </span>

        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Submit your project.{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Get real feedback.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          A review dashboard built for cohorts: students ship, mentors review and
          everything is filtered, paginated and tracked in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Log in
            <ArrowRight data-icon="inline-end" />
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Sign up as a student
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary/30"
          >
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-3 ring-primary/10">
              <feature.icon className="size-5" />
            </div>
            <h2 className="font-medium">{feature.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="font-medium">Demo accounts (seeded)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The database ships with ready-made logins, password{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">password123</code>:
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="grid gap-1 rounded-xl border border-dashed bg-muted/40 p-4">
              <span className="text-muted-foreground">Mentor</span>
              <code className="text-xs">mentor@demo.io</code>
            </div>
            <div className="grid gap-1 rounded-xl border border-dashed bg-muted/40 p-4">
              <span className="text-muted-foreground">Student</span>
              <code className="text-xs">tisha@demo.io</code>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
