import type { Role, SessionUser } from "@/lib/types";

export interface Session {
  user: SessionUser;
  token: string;
}

const SESSION_KEY = "psr.session";

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

export function snapshotSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw === cachedRaw) return cachedSession;
    cachedRaw = raw;
    const parsed = raw ? (JSON.parse(raw) as Session) : null;
    cachedSession = parsed?.token && parsed?.user?.role ? parsed : null;
    return cachedSession;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify();
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
  notify();
}

export function roleHome(role: Role | string): string {
  return role === "MENTOR" ? "/review" : "/submit";
}
