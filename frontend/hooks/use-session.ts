"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  clearSession,
  saveSession,
  snapshotSession,
  subscribeSession,
  type Session,
} from "@/lib/session";

const clientSnapshot = () => true;
const serverSession: () => Session | null = () => null;
const serverBoolean = () => false;
const noopSubscribe = () => () => undefined;

export function useSession() {
  const session = useSyncExternalStore(
    subscribeSession,
    snapshotSession,
    serverSession,
  );
  const hydrated = useSyncExternalStore<boolean>(
    noopSubscribe,
    clientSnapshot,
    serverBoolean,
  );

  const save = useCallback((next: Session) => {
    saveSession(next);
  }, []);

  const clear = useCallback(() => {
    clearSession();
  }, []);

  return { session, hydrated, save, clear };
}
