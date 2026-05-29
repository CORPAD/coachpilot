"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "icon";

export interface AIMagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  label?: string;
  iconOnly?: boolean;
}

/**
 * Bouton "premium" pour solliciter l'IA — halo multicolore animé qui respire,
 * inspiré d'Apple Intelligence / Siri. Sortie visuellement marquante.
 *
 * Variants: md (default), sm (compact), icon (40x40, icône seule).
 */
export const AIMagicButton = React.forwardRef<HTMLButtonElement, AIMagicButtonProps>(
  ({ size = "md", label = "Assistant IA", iconOnly, className, ...props }, ref) => {
    const isIcon = size === "icon" || iconOnly;
    const sizeClass = isIcon ? "ai-icon" : size === "sm" ? "ai-sm" : "";
    const heightClass = isIcon ? "" : size === "sm" ? "h-[34px]" : "h-10";

    return (
      <button
        ref={ref}
        type="button"
        aria-label={isIcon ? label : undefined}
        className={cn("ai-magic", sizeClass, heightClass, className)}
        {...props}
      >
        <span aria-hidden className="ai-aura" />
        <span aria-hidden className="ai-ring" />
        <span aria-hidden className="ai-spark" />
        <span className="ai-inner">
          <Sparkles className={cn(isIcon ? "h-4 w-4" : "h-4 w-4")} />
          {!isIcon && <span>{label}</span>}
        </span>
      </button>
    );
  }
);
AIMagicButton.displayName = "AIMagicButton";
