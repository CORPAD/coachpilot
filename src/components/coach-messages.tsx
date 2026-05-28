"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn, timeAgo } from "@/lib/utils";
import type { Message } from "@/lib/db";

export function CoachMessages({
  clientId,
  clientName,
  initialMessages,
}: {
  clientId: string;
  clientName: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Marque comme lus à l'ouverture, et polling 30s pour les réponses client
    fetch(`/api/clients/${clientId}/messages`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setMessages(data.messages ?? []))
      .catch(() => {});
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [clientId]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const res = await fetch(`/api/clients/${clientId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setSending(false);
    if (res.ok) {
      setInput("");
      const fetchRes = await fetch(`/api/clients/${clientId}/messages`);
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setMessages(data.messages ?? []);
      }
      router.refresh();
    }
  }

  const suggestions = [
    `Bravo pour ta séance ! 💪`,
    `N'oublie pas ton entraînement aujourd'hui`,
    `Comment vas-tu ${clientName.split(" ")[0]} ?`,
  ];

  return (
    <div className="space-y-3">
      <div
        ref={scrollRef}
        className="max-h-72 overflow-y-auto space-y-2 p-1"
      >
        {messages.length === 0 ? (
          <div className="text-sm text-zinc-500 text-center py-6">
            Aucun message échangé pour l&apos;instant.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.sender === "coach" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  m.sender === "coach"
                    ? "bg-[var(--brand-primary)] text-white rounded-br-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                )}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div
                  className={cn(
                    "text-[10px] mt-1",
                    m.sender === "coach" ? "text-white/70" : "text-zinc-500"
                  )}
                >
                  {timeAgo(m.created_at)}
                  {m.sender === "coach" && m.read_at ? " · Lu" : ""}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="text-xs px-2 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {s}
            </button>
          ))}
        </div>
      )}

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
          placeholder={`Écris un message à ${clientName.split(" ")[0]}...`}
          className="min-h-[44px] resize-none"
          rows={1}
          disabled={sending}
        />
        <Button onClick={send} disabled={sending || !input.trim()} size="icon">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
