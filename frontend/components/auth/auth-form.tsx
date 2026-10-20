"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitPullRequestArrow } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { ApiError, apiFetch } from "@/lib/api";
import { roleHome } from "@/lib/session";
import type { AuthResponse } from "@/lib/types";
import { signupSchema, loginSchema, zodFieldErrors } from "@/lib/validation";

interface AuthFormProps {
  mode: "login" | "signup";
}

interface Field {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
}

const fields: Field[] = [
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
];

const signupFields: Field[] = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name" },
  ...fields,
];

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const { save } = useSession();
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const visibleFields = isSignup ? signupFields : fields;

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    const body = isSignup
      ? { name: values.name ?? "", email: values.email ?? "", password: values.password ?? "" }
      : { email: values.email ?? "", password: values.password ?? "" };

    const parsed = (isSignup ? signupSchema : loginSchema).safeParse(body);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.issues));
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const result = await apiFetch<AuthResponse>(endpoint, {
        method: "POST",
        body: parsed.data,
      });
      save(result);
      router.replace(roleHome(result.user.role));
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        const notes: string[] = [];
        if (error.status === 429 && error.retryAfterMs) {
          notes.push(`Try again in ${Math.ceil(error.retryAfterMs / 1000)}s`);
        }
        if (error.status === 409 && !error.fieldErrors) {
          notes.push("That email is already registered. Try logging in instead.");
        }
        setFormError([error.message, ...notes].join(" — "));
      } else {
        setFormError("Something unexpected happened. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh">
      <AppHeader heading="Project Submission & Review" />
      <main className="mx-auto flex w-full max-w-5xl justify-center px-4 py-10">
        <div className="grid w-full max-w-3xl items-start gap-8 md:grid-cols-[1fr_1.1fr]">
          <aside className="relative hidden flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground md:flex">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-2xl"
            />
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-3 ring-white/20">
              <GitPullRequestArrow className="size-6" />
            </div>
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold">
                {isSignup ? "Join the cohort" : "Welcome back"}
              </h2>
              <p className="text-sm text-primary-foreground/80">
                {isSignup
                  ? "Create a student account and hand your first project to a mentor today."
                  : "Log in to submit projects or pick up where you left reviewing."}
              </p>
            </div>
            <div className="mt-auto grid gap-3 text-xs text-primary-foreground/80">
              <div className="rounded-xl bg-white/10 px-3 py-2">
                Demo mentor: <code>mentor@demo.io</code>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2">
                Demo student: <code>tisha@demo.io</code>
                <span className="text-primary-foreground/70"> · password123</span>
              </div>
            </div>
          </aside>

          <Card>
            <CardHeader>
              <CardTitle>
                {isSignup ? "Create your student account" : "Log in to continue"}
              </CardTitle>
              <CardDescription>
                {isSignup
                  ? "Sign up to submit projects for review."
                  : "Students and mentors both log in here."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
                {visibleFields.map((field) => {
                  const errors = fieldErrors[field.name] ?? [];
                  return (
                    <div key={field.name} className="grid gap-1.5">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        value={values[field.name] ?? ""}
                        onChange={(event) => setValue(field.name, event.target.value)}
                        aria-invalid={errors.length > 0 ? true : undefined}
                      />
                      {errors.map((message) => (
                        <p key={message} className="text-xs text-destructive">
                          {message}
                        </p>
                      ))}
                    </div>
                  );
                })}
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              {isSignup ? (
                <span>
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary underline underline-offset-4">
                    Log in
                  </Link>
                </span>
              ) : (
                <span>
                  New student?{" "}
                  <Link href="/signup" className="text-primary underline underline-offset-4">
                    Create an account
                  </Link>
                </span>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
