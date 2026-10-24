"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
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
                  const isPasswordField = field.name === "password";
                  return (
                    <div key={field.name} className="grid gap-1.5">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={isPasswordField && showPassword ? "text" : field.type}
                          autoComplete={field.autoComplete}
                          value={values[field.name] ?? ""}
                          onChange={(event) => setValue(field.name, event.target.value)}
                          aria-invalid={errors.length > 0 ? true : undefined}
                          className={isPasswordField ? "pr-10" : undefined}
                        />
                        {isPasswordField && (
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
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
                {!isSignup && (
                  <div className="grid gap-2 pt-1">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      Quick fill demo accounts
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setValue("email", "tisha@demo.io");
                          setValue("password", "password123");
                        }}
                      >
                        Demo student
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setValue("email", "mentor@demo.io");
                          setValue("password", "password123");
                        }}
                      >
                        Demo mentor
                      </Button>
                    </div>
                  </div>
                )}
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
  );
}
