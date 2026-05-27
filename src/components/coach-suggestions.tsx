"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Suggestion = {
  title: string;
  body: string;
  clientName?: string;
  clientId?: string;
};

export function CoachSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggestions");
      if (!res.ok) throw new Error("Erreur de génération");
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-6 text-sm text-zinc-500">
        <Sparkles className="h-5 w-5 mx-auto mb-2 animate-pulse text-[var(--brand-primary)]" />
        L&apos;IA analyse tes clients...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm space-y-3">
        <p className="text-zinc-500">
          {error.includes("API") ? "Clé API Claude manquante." : error}
        </p>
        <p className="text-xs text-zinc-400">
          Ajoute <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">ANTHROPIC_API_KEY</code> dans .env.local
        </p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-sm text-zinc-500">
        Crée tes premiers clients pour recevoir des suggestions personnalisées.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
        >
          <div className="font-medium text-sm">{s.title}</div>
          {s.clientName && (
            <div className="text-xs text-[var(--brand-primary)] font-medium mt-0.5">
              {s.clientName}
            </div>
          )}
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{s.body}</div>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="w-full" onClick={load}>
        <RefreshCw className="h-3 w-3" />
        Actualiser
      </Button>
    </div>
  );
}
