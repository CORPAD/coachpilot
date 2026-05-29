import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg",
        "border border-zinc-200 dark:border-zinc-700/80",
        "bg-white/80 dark:bg-zinc-950/60 backdrop-blur",
        "px-3 py-2 text-sm",
        "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
        "transition-[border-color,box-shadow,background] duration-150",
        "focus-visible:outline-none focus-visible:border-[var(--brand-primary)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg",
        "border border-zinc-200 dark:border-zinc-700/80",
        "bg-white/80 dark:bg-zinc-950/60 backdrop-blur",
        "px-3 py-2 text-sm",
        "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
        "transition-[border-color,box-shadow,background] duration-150",
        "focus-visible:outline-none focus-visible:border-[var(--brand-primary)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300", className)}
      {...props}
    />
  );
}
