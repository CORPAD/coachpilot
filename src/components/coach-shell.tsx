"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Users, UserPlus, Settings, LogOut, Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ai-assistant";
import type { Coach } from "@/lib/db";

const NAV = [
  { href: "/coach", label: "Tableau de bord", icon: Home },
  { href: "/coach/clients", label: "Mes clients", icon: Users },
  { href: "/coach/clients/new", label: "Nouveau client", icon: UserPlus },
  { href: "/coach/settings", label: "Personnalisation", icon: Settings },
];

export function CoachShell({
  coach,
  children,
}: {
  coach: Pick<Coach, "id" | "name" | "email" | "brand_logo" | "brand_name">;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [aiOpen, setAiOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const brandName = coach.brand_name ?? "CoachPilot";

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transform transition-transform md:relative md:translate-x-0 flex flex-col",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
          {coach.brand_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.brand_logo} alt="logo" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-lg brand-gradient" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{brandName}</div>
            <div className="text-xs text-zinc-500 truncate">{coach.name}</div>
          </div>
          <button
            className="md:hidden p-1"
            onClick={() => setNavOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/coach" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--brand-primary)] text-white"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-20">
          <button onClick={() => setNavOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">{brandName}</span>
          <button onClick={() => setAiOpen(true)} aria-label="Assistant IA">
            <Sparkles className="h-5 w-5 text-[var(--brand-primary)]" />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>

      <AIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        scope={{ kind: "coach" }}
      />
    </div>
  );
}
