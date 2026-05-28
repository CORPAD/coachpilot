"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ai-assistant";

export function CoachAIButton({
  size = "md",
  variant = "default",
  className,
  label = "Assistant IA",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        {label}
      </Button>
      <AIAssistant open={open} onClose={() => setOpen(false)} scope={{ kind: "coach" }} />
    </>
  );
}
