function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required("JWT_SECRET", "dev-only-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  corsOrigin: process.env.CORS_ORIGIN?.split(",").filter(Boolean) ?? ["http://localhost:3000"],
  submissionRateLimit: {
    windowMs: 10 * 60 * 1000,
    max: 5,
  },
  authRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 10,
  },
} as const;
