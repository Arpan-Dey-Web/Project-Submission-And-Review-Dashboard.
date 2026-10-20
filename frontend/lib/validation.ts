import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(40, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export const submitProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(80, "Project name is too long"),
  repoUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (https://…)")
    .max(300, "URL is too long")
    .refine((url) => /^https:\/\//.test(url), "Repo URL must be a https:// link"),
  liveUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (https://…)")
    .max(300, "URL is too long")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description is too long"),
});

export const feedbackSchema = z
  .string()
  .trim()
  .min(5, "Feedback must be at least 5 characters")
  .max(2000, "Feedback is too long");

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;

export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
