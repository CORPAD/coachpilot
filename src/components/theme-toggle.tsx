"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cp_theme";

function applyTheme(t: "light" | "dark") {
  if (t === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== "undefined"
      ? (window.localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null)
      : null) ?? null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
  }

  // Évite mismatch SSR/CSR
  if (!mounted) {
    return (
      <button
        aria-label="Thème"
        className={cn(
          "h-9 w-9 inline-flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700",
          className
        )}
        disabled
      >
        <Sun className="h-4 w-4 opacity-50" />
      </button>
    );
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
        className={cn(
          "h-9 w-9 inline-flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
          className
        )}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
      className={cn(
        "inline-flex items-center gap-2 h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors",
        className
      )}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          Mode clair
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Mode sombre
        </>
      )}
    </button>
  );
}
