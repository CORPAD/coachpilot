import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: [
    "text-white",
    "bg-[var(--brand-primary)]",
    "shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]",
    "hover:brightness-105 hover:-translate-y-px",
    "active:translate-y-0 active:brightness-95",
    "focus-visible:ring-[var(--brand-primary)]/40",
  ].join(" "),
  outline: [
    "border border-zinc-200 dark:border-zinc-700/80",
    "bg-white/70 dark:bg-zinc-900/40 backdrop-blur",
    "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
    "hover:-translate-y-px",
    "active:translate-y-0",
  ].join(" "),
  ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
  destructive: [
    "bg-red-600 text-white",
    "shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]",
    "hover:bg-red-700 hover:-translate-y-px",
    "active:translate-y-0",
  ].join(" "),
  secondary: [
    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
    "shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]",
    "hover:bg-zinc-800 dark:hover:bg-white",
    "hover:-translate-y-px active:translate-y-0",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
          "transition-[transform,background-color,box-shadow,filter,border-color] duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
