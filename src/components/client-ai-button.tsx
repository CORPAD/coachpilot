"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ai-assistant";

export function ClientAIButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        IA focus
      </Button>
      <AIAssistant
        open={open}
        onClose={() => setOpen(false)}
        scope={{ kind: "client", clientId, clientName }}
      />
    </>
  );
}
