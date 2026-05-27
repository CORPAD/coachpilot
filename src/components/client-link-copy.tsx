"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClientLinkCopy({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        readOnly
        value={url}
        onClick={(e) => (e.target as HTMLInputElement).select()}
        className="flex-1 min-w-0 h-10 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm font-mono"
      />
      <Button type="button" onClick={copy} variant="outline">
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copié" : "Copier"}
      </Button>
    </div>
  );
}
