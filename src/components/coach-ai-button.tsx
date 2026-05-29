"use client";

import { useState } from "react";
import { AIAssistant } from "@/components/ai-assistant";
import { AIMagicButton } from "@/components/ai-magic-button";

export function CoachAIButton({
  size = "md",
  className,
  label = "Assistant IA",
}: {
  size?: "sm" | "md" | "lg";
  /** @deprecated le bouton magique a son propre design */
  variant?: "default" | "outline" | "ghost";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  // "lg" mappé vers "md" pour cohérence visuelle dans le système ai-magic
  const aiSize = size === "lg" ? "md" : size === "sm" ? "sm" : "md";
  return (
    <>
      <AIMagicButton size={aiSize} label={label} className={className} onClick={() => setOpen(true)} />
      <AIAssistant open={open} onClose={() => setOpen(false)} scope={{ kind: "coach" }} />
    </>
  );
}
