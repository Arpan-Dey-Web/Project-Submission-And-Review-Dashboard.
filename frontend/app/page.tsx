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
    title: "Validated submissions",
    body: "Repo URL, live link and pitch go through schema validation — duplicates and rate limits included — before a mentor ever sees them.",
  },
  {
    icon: ClipboardCheck,
    title: "Structured reviews",
    body: "Every submission moves PENDING → APPROVED or REJECTED with written mentor feedback. No silent rejections, no lost work.",
  },
  {
    icon: BarChart3,
    title: "Live cohort stats",
    body: "Pending, approved and rejected counters aggregate straight from PostgreSQL the moment a mentor acts.",
  },
];

const demoAccounts = [
  { role: "Mentor", label: "Reviews & approves", email: "mentor@demo.io" },
  { role: "Student", label: "Submits projects", email: "tisha@demo.io" },
  { role: "Student", label: "Second cohort seat", email: "rifat@demo.io" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-svh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10rem,var(--color-primary)_12%,transparent_60%)] opacity-12"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
      />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-24 text-center">
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

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Sign up as a student
            <ArrowRight data-icon="inline-end" />
          </Link>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>

      <section className="relative mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group relative rounded-2xl border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <span className="absolute top-5 right-6 font-mono text-xs text-muted-foreground/50">
              0{index + 1}
            </span>
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-3 ring-primary/10 transition-colors group-hover:bg-primary/15">
              <feature.icon className="size-5" />
            </div>
            <h2 className="font-medium">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.body}
            </p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-medium">Demo accounts (seeded)</h2>
            <p className="text-sm text-muted-foreground">
              Password for all:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                password123
              </code>
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {demoAccounts.map((account) => (
              <div
                key={account.email}
                className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-3 transition-colors hover:border-primary/30"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {account.role[0]}
                </span>
                <span className="grid min-w-0 leading-tight">
                  <span className="text-xs text-muted-foreground">
                    {account.role} · {account.label}
                  </span>
                  <code className="truncate text-xs font-medium">
                    {account.email}
                  </code>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
