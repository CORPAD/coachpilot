import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "success" | "warning" | "muted";

const v: Record<Variant, string> = {
  default: "bg-[var(--brand-primary)] text-white",
  outline: "border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  muted: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        v[variant],
        className
      )}
      {...props}
    />
  );
}
