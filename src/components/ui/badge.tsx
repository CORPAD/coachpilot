import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "success" | "warning" | "muted";

const v: Record<Variant, string> = {
  default:
    "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20",
  outline:
    "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-white/40 dark:bg-zinc-900/40",
  success:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40",
  warning:
    "bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40",
  muted:
    "bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/40",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        v[variant],
        className
      )}
      {...props}
    />
  );
}
