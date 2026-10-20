import { z } from "zod";

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

const statusValues = ["PENDING", "APPROVED", "REJECTED"] as const;

export const listQuerySchema = z.object({
  status: z.enum(statusValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().trim().min(5).max(2000).optional(),
});
