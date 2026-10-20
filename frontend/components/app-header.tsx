"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { roleHome } from "@/lib/session";
import type { Role } from "@/lib/types";

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  MENTOR: "Mentor",
};

const roleTint: Record<string, string> = {
  STUDENT: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  MENTOR: "bg-primary/10 text-primary",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function AppHeader({ heading }: { heading: string }) {
  const { session, clear } = useSession();
  const router = useRouter();
  const role = session?.user.role as Role | undefined;

  const handleLogout = () => {
    clear();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={role ? roleHome(role) : "/"}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground shadow-sm">
            PS
          </span>
          <span className="grid min-w-0 leading-tight">
            <span className="truncate text-sm font-semibold">{heading}</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Project Submission &amp; Review
            </span>
          </span>
        </Link>

        {session && (
          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${
                roleTint[session.user.role] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {roleLabel[session.user.role] ?? session.user.role}
            </span>
            <div className="flex items-center gap-2 rounded-full border bg-card py-1 pr-1 pl-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {initials(session.user.name)}
              </span>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {session.user.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log out"
                className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
