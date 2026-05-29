"use client";

import { useState } from "react";
import { AIAssistant } from "@/components/ai-assistant";
import { AIMagicButton } from "@/components/ai-magic-button";

export function ClientAIButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AIMagicButton size="md" label="IA focus" onClick={() => setOpen(true)} />
      <AIAssistant
        open={open}
        onClose={() => setOpen(false)}
        scope={{ kind: "client", clientId, clientName }}
      />
    </>
  );
}
