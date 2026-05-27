"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm(`Supprimer définitivement ${clientName} et toutes ses données ?`)) return;
    setLoading(true);
    await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    router.push("/coach/clients");
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={onDelete} disabled={loading}>
      <Trash2 className="h-4 w-4" />
      Supprimer ce client
    </Button>
  );
}
