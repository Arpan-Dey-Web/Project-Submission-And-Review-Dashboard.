"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/hooks/use-session";
import { roleHome } from "@/lib/session";
import type { Role } from "@/lib/types";

interface RoleGuardProps {
  allow: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { session, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace("/login");
    } else if (!allow.includes(session.user.role as Role)) {
      router.replace(roleHome(session.user.role));
    }
  }, [hydrated, session, allow, router]);

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!allow.includes(session.user.role as Role)) return null;

  return <>{children}</>;
}
