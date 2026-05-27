"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Scope =
  | { kind: "coach" }
  | { kind: "client"; clientId: string; clientName: string };

type Message = { role: "user" | "assistant"; content: string };

export function AIAssistant({
  open,
  onClose,
  scope,
}: {
  open: boolean;
  onClose: () => void;
  scope: Scope;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setError(null);
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, scope }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Erreur de l'IA");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setError((e as Error).message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  const suggestions =
    scope.kind === "coach"
      ? [
          "Fais-moi un récap de la semaine de tous mes clients",
          "Quels clients ont l'air de décrocher ?",
          "Suggère-moi des ajustements de programme",
        ]
      : [
          `Récap des progrès de ${scope.clientName}`,
          `Quels exercices ne fonctionnent pas pour ${scope.clientName} ?`,
          `Suggère un ajustement nutrition pour ${scope.clientName}`,
        ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Assistant IA</div>
              <div className="text-xs text-zinc-500">
                {scope.kind === "coach" ? "Vue d'ensemble" : `Focus : ${scope.clientName}`}
              </div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                <div className="text-sm font-medium">Bonjour ! 👋</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Je suis ton bras droit IA. J&apos;ai accès à toutes les données de tes clients. Demande-moi un récap, une analyse ou une suggestion.
                </div>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? "..." : "")}
              </div>
            </div>
          ))}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Pose ta question..."
              className="resize-none min-h-[44px] max-h-32"
              rows={1}
              disabled={streaming}
            />
            <Button onClick={send} disabled={streaming || !input.trim()} size="icon">
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
