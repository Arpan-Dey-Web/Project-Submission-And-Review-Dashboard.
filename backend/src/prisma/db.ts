import postgres from "@prisma/orm-postgres/runtime";

import "temporal-polyfill/global";

// Must run before DATABASE_URL is read below. Static imports hoist past
// index.ts, so loading here guarantees env wins over module init order.
try {
  process.loadEnvFile();
} catch {
  // no .env file present — fine for composer/managed deployments
}

import service from "../../service.ts";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

function loadComposerDatabase() {
  try {
    return service.load().database.client;
  } catch {
    return undefined;
  }
}

export const db =
  loadComposerDatabase() ??
  (process.env.DATABASE_URL
    ? postgres<Contract>({ contractJson, url: process.env.DATABASE_URL })
    : postgres<Contract>({ contractJson }));

let connection: Promise<void> | undefined;

export function connectDatabase(): Promise<void> {
  connection ??= db.connect().then(() => undefined).catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}
