"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api";
import type { CreateSubmissionResponse } from "@/lib/types";
import { submitProjectSchema, zodFieldErrors } from "@/lib/validation";

const emptyForm = { name: "", repoUrl: "", liveUrl: "", description: "" };

interface SubmitFormProps {
  token: string;
  onSuccess: () => void;
}

function Field({
  name,
  label,
  input,
  errors,
}: {
  name: string;
  label: string;
  input: React.ReactNode;
  errors?: string[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {input}
      {errors?.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </div>
  );
}

export function SubmitForm({ token, onSuccess }: SubmitFormProps) {
  const [values, setValues] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const set = (name: keyof typeof emptyForm, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = submitProjectSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error.issues));
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch<CreateSubmissionResponse>("/submissions", {
        method: "POST",
        body: parsed.data,
        token,
      });
      setValues(emptyForm);
      setFieldErrors({});
      setSuccessCount((count) => count + 1);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        let message = error.message;
        if (error.status === 429 && error.retryAfterMs) {
          message = `${message} Try again in ${Math.ceil(error.retryAfterMs / 1000)}s.`;
        }
        setFormError(message);
      } else {
        setFormError("Something unexpected happened. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputProps = (name: keyof typeof emptyForm) => ({
    id: name,
    value: values[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(name, event.target.value),
    "aria-invalid": fieldErrors[name]?.length ? true : undefined,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a project</CardTitle>
        <CardDescription>
          {successCount > 0
            ? `Submitted ${successCount} project${successCount > 1 ? "s" : ""} in this session.`
            : "Share your repository link so a mentor can review it."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <Field
            name="name"
            label="Project name"
            errors={fieldErrors.name}
            input={<Input {...inputProps("name")} placeholder="Task manager app" />}
          />
          <Field
            name="repoUrl"
            label="Repository URL"
            errors={fieldErrors.repoUrl}
            input={
              <Input {...inputProps("repoUrl")} placeholder="https://github.com/you/project" />
            }
          />
          <Field
            name="liveUrl"
            label="Live link (optional)"
            errors={fieldErrors.liveUrl}
            input={
              <Input {...inputProps("liveUrl")} placeholder="https://your-app.vercel.app" />
            }
          />
          <Field
            name="description"
            label="Description"
            errors={fieldErrors.description}
            input={
              <Textarea
                {...inputProps("description")}
                rows={4}
                placeholder="What does your project do? What should the reviewer focus on?"
              />
            }
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit project"}
          </Button>
          <p className="text-xs text-muted-foreground">
            One submission per repository URL, up to 5 every 10 minutes.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
