"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Moon, Apple, MessageSquare, Calendar, CheckCircle2, Star, Flame, Send, Loader2, Lock, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, isoDate, timeAgo } from "@/lib/utils";
import type {
  Client,
  ClientProfile,
  ProgramExercise,
  Session,
  ClientNote,
  SleepLog,
  NutritionLog,
  ExerciseLog,
  Message,
} from "@/lib/db";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

type DraftLog = {
  exercise_name: string;
  sets_done: string;
  reps_done: string;
  weight_used: string;
  succeeded: boolean;
  note: string;
};

type DraftState = {
  logs: DraftLog[];
  rating: number | null;
  note: string;
};

export function ClientSpace({
  token,
  client,
  profile,
  exercises,
  recentSessions,
  completedCount,
  notes,
  sleep,
  nutrition,
  messages,
  todaySession,
  todayLogs,
  today,
  brand,
}: {
  token: string;
  client: Client;
  profile: ClientProfile | null;
  exercises: ProgramExercise[];
  recentSessions: Session[];
  completedCount: number;
  notes: ClientNote[];
  sleep: SleepLog[];
  nutrition: NutritionLog[];
  messages: Message[];
  todaySession: Session | null;
  todayLogs: ExerciseLog[];
  today: string;
  brand: { name: string; logo: string | null; coachName: string };
}) {
  const todayName = DAYS[new Date(today + "T00:00:00").getDay()];

  const byDay = new Map<string, ProgramExercise[]>();
  for (const ex of exercises) {
    const k = ex.day_label || "Lundi";
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(ex);
  }

  const todayExercises = byDay.get(todayName) ?? [];
  const upcomingDays = DAYS.filter((d) => d !== todayName).filter((d) => byDay.has(d)).slice(0, 4);

  const weeksSinceStart = Math.max(1, Math.floor((Date.now() - client.created_at) / (7 * 24 * 3600 * 1000)));
  const avgPerWeek = (completedCount / weeksSinceStart).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[color:var(--brand-primary)]/5 via-zinc-50 to-[color:var(--brand-accent)]/5 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="logo" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg brand-gradient" />
            )}
            <div>
              <div className="font-semibold text-sm">{brand.name}</div>
              <div className="text-xs text-zinc-500">Coach : {brand.coachName}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{client.name}</div>
            <div className="text-xs text-zinc-500">Bonjour 👋</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Séances totales"
            value={completedCount.toString()}
            sub={`${avgPerWeek}/semaine`}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Semaines"
            value={weeksSinceStart.toString()}
            sub="depuis le début"
          />
          <StatCard
            icon={<Moon className="h-5 w-5" />}
            label="Sommeil"
            value={sleep.length ? `${(sleep.reduce((a, s) => a + (s.quality ?? 0), 0) / sleep.length).toFixed(1)}/5` : "—"}
            sub={`${sleep.length} relevés`}
          />
          <StatCard
            icon={<Apple className="h-5 w-5" />}
            label="Nutrition"
            value={
              nutrition.length
                ? `${Math.round((nutrition.filter((n) => n.goal_met === 1).length / nutrition.length) * 100)}%`
                : "—"
            }
            sub="objectifs"
          />
        </div>

        <SessionLogger
          token={token}
          clientId={client.id}
          today={today}
          todayDay={todayName}
          exercises={todayExercises}
          todaySession={todaySession}
          todayLogs={todayLogs}
        />

        <MessagesPanel token={token} initialMessages={messages} coachName={brand.coachName} />

        {upcomingDays.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prochaines séances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDays.map((d) => {
                  const exs = byDay.get(d) ?? [];
                  return (
                    <div
                      key={d}
                      className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="font-semibold text-sm mb-2">{d}</div>
                      <div className="text-xs text-zinc-500 space-y-0.5">
                        {exs.slice(0, 5).map((e) => (
                          <div key={e.id}>
                            • {e.name} — {e.sets}x{e.reps}{e.weight_kg ? ` @ ${e.weight_kg}kg` : ""}
                          </div>
                        ))}
                        {exs.length > 5 && <div>+{exs.length - 5} autres exercices</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.nutrition_goals && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Apple className="h-4 w-4 text-[var(--brand-primary)]" />
                Mon objectif nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4">{profile.nutrition_goals}</div>
              <NutritionLogger token={token} recent={nutrition} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-[var(--brand-primary)]" />
              Comment as-tu dormi ?
            </CardTitle>
            <CardDescription>Note ta nuit pour aider l&apos;IA et ton coach.</CardDescription>
          </CardHeader>
          <CardContent>
            <SleepLogger token={token} recent={sleep} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[var(--brand-primary)]" />
              Notes & ressentis
            </CardTitle>
            <CardDescription>
              Plus tu écris, plus ton coach (et l&apos;IA) peut t&apos;aider précisément.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NoteLogger token={token} notes={notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mon historique</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-sm text-zinc-500">Tu n&apos;as pas encore enregistré de séance.</div>
            ) : (
              <div className="space-y-2">
                {recentSessions.slice(0, 10).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        s.completed ? "text-emerald-500" : "text-zinc-300"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{s.date}</div>
                      {s.client_note && (
                        <div className="text-xs text-zinc-500 line-clamp-1">{s.client_note}</div>
                      )}
                    </div>
                    {s.rating && (
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {s.rating}/5
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-zinc-400 py-6">
          {brand.name} • Espace personnel sécurisé
        </footer>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 text-[var(--brand-primary)] mb-1">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-xs text-zinc-500">{sub}</div>
      </CardContent>
    </Card>
  );
}

function SessionLogger({
  token,
  clientId,
  today,
  todayDay,
  exercises,
  todaySession,
  todayLogs,
}: {
  token: string;
  clientId: string;
  today: string;
  todayDay: string;
  exercises: ProgramExercise[];
  todaySession: Session | null;
  todayLogs: ExerciseLog[];
}) {
  const router = useRouter();
  const isCompleted = todaySession?.completed === 1;
  const storageKey = `cp_session_${clientId}_${today}`;

  // Mode lecture seule si la séance est validée
  if (isCompleted) {
    return <CompletedSession session={todaySession} logs={todayLogs} todayDay={todayDay} />;
  }

  // Restaurer depuis localStorage ou initialiser cases décochées
  const initialState: DraftState = (() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) return JSON.parse(stored) as DraftState;
      } catch {}
    }
    return {
      logs: exercises.map((e) => ({
        exercise_name: e.name,
        sets_done: e.sets.toString(),
        reps_done: e.reps,
        weight_used: e.weight_kg?.toString() ?? "",
        succeeded: false,
        note: "",
      })),
      rating: null,
      note: "",
    };
  })();

  const [draft, setDraft] = useState<DraftState>(initialState);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isFirst = useRef(true);

  // Persister le brouillon dans localStorage à chaque modif
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {}
  }, [draft, storageKey]);

  function updateLog(i: number, patch: Partial<DraftLog>) {
    setDraft((d) => ({
      ...d,
      logs: d.logs.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));
  }

  async function submit() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/client/${token}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        day_label: todayDay,
        rating: draft.rating,
        client_note: draft.note,
        exercises: draft.logs.map((l) => ({
          exercise_name: l.exercise_name,
          sets_done: l.sets_done ? parseInt(l.sets_done, 10) : null,
          reps_done: l.reps_done,
          weight_used: l.weight_used ? parseFloat(l.weight_used) : null,
          succeeded: l.succeeded,
          note: l.note,
        })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      // Clear localStorage après validation
      try { window.localStorage.removeItem(storageKey); } catch {}
      router.refresh();
    }
  }

  if (exercises.length === 0) {
    return (
      <Card className="border-[var(--brand-primary)]/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-[var(--brand-primary)]" />
            Entraînement du jour ({todayDay})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-500">Repos aujourd&apos;hui 💪 Profite-en pour récupérer.</div>
        </CardContent>
      </Card>
    );
  }

  const someChecked = draft.logs.some((l) => l.succeeded);

  return (
    <Card className="border-[var(--brand-primary)]/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-[var(--brand-primary)]" />
          Entraînement du jour — {todayDay}
        </CardTitle>
        <CardDescription>
          Coche chaque exercice quand tu l&apos;as fait, ajuste les valeurs et ajoute une note.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.logs.map((l, i) => (
          <div
            key={i}
            className={cn(
              "p-3 rounded-lg border space-y-2 transition-colors",
              l.succeeded
                ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
            )}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-medium text-sm flex items-center gap-2">
                {l.succeeded && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {l.exercise_name}
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={l.succeeded}
                  onChange={(e) => updateLog(i, { succeeded: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-[var(--brand-primary)]"
                />
                {l.succeeded ? "Fait ✓" : "Non fait"}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Séries</Label>
                <Input
                  type="number"
                  value={l.sets_done}
                  onChange={(e) => updateLog(i, { sets_done: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px]">Reps</Label>
                <Input
                  value={l.reps_done}
                  onChange={(e) => updateLog(i, { reps_done: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px]">Poids (kg)</Label>
                <Input
                  value={l.weight_used}
                  onChange={(e) => updateLog(i, { weight_used: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Input
              placeholder="Note (optionnel) — ex: bras qui tremblent à la 3ème série"
              value={l.note}
              onChange={(e) => updateLog(i, { note: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        ))}

        <div className="pt-2 space-y-2">
          <Label className="text-sm">Note globale de la séance</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                className={cn(
                  "h-9 w-9 rounded-md border text-sm font-medium transition-colors",
                  draft.rating === n
                    ? "bg-[var(--brand-primary)] text-white border-transparent"
                    : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Comment t'es-tu senti(e) ? Énergie, motivation, ce qui a bien marché ou pas..."
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          />
        </div>

        <div className="text-xs text-zinc-500">
          {someChecked
            ? "Ta progression est sauvegardée localement. Tu peux quitter et revenir."
            : "Coche au moins un exercice pour pouvoir valider."}
        </div>

        <Button
          onClick={submit}
          disabled={saving || !someChecked}
          className="w-full"
          size="lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {saving ? "Enregistrement..." : "Valider ma séance"}
        </Button>
        {saved && (
          <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-md px-3 py-2 text-center">
            ✓ Séance enregistrée. Ton coach va recevoir le récap.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompletedSession({
  session,
  logs,
  todayDay,
}: {
  session: Session;
  logs: ExerciseLog[];
  todayDay: string;
}) {
  return (
    <Card className="border-emerald-300 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Lock className="h-4 w-4" />
          Séance du jour validée — {todayDay}
        </CardTitle>
        <CardDescription>
          Tu as validé ta séance{session.completed_at ? ` ${timeAgo(session.completed_at)}` : ""}. À demain ! 💪
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-sm text-zinc-500">Aucun exercice enregistré.</div>
        ) : (
          logs.map((l) => (
            <div
              key={l.id}
              className={cn(
                "p-3 rounded-lg border opacity-80 cursor-not-allowed",
                l.succeeded
                  ? "border-emerald-300 bg-white/50 dark:border-emerald-900 dark:bg-zinc-900/50"
                  : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
              )}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-medium text-sm flex items-center gap-2">
                  {l.succeeded ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />
                  )}
                  {l.exercise_name}
                </div>
                <div className="text-xs text-zinc-500">
                  {l.sets_done ?? "—"}×{l.reps_done ?? "—"}
                  {l.weight_used ? ` @ ${l.weight_used}kg` : ""}
                </div>
              </div>
              {l.note && <div className="text-xs text-zinc-500 mt-1 italic">&laquo; {l.note} &raquo;</div>}
            </div>
          ))
        )}
        {(session.rating || session.client_note) && (
          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900 space-y-1">
            {session.rating && (
              <div className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Note de la séance : {session.rating}/5
              </div>
            )}
            {session.client_note && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                &laquo; {session.client_note} &raquo;
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessagesPanel({
  token,
  initialMessages,
  coachName,
}: {
  token: string;
  initialMessages: Message[];
  coachName: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Marquer comme lus à l'ouverture
  useEffect(() => {
    fetch(`/api/client/${token}/messages`).catch(() => {});
    // Polling toutes les 30s pour récupérer les nouveaux messages du coach
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/client/${token}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const res = await fetch(`/api/client/${token}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setSending(false);
    if (res.ok) {
      setInput("");
      const fetchRes = await fetch(`/api/client/${token}/messages`);
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setMessages(data.messages ?? []);
      }
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-[var(--brand-primary)]" />
          Messagerie avec {coachName.split(" ")[0]}
        </CardTitle>
        <CardDescription>Pose une question, signale un souci, ou réponds à ton coach.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={scrollRef}
          className="max-h-72 overflow-y-auto space-y-2 p-1"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-6">
              Aucun message. Écris le premier 👇
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.sender === "client" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    m.sender === "client"
                      ? "bg-[var(--brand-primary)] text-white rounded-br-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div
                    className={cn(
                      "text-[10px] mt-1",
                      m.sender === "client" ? "text-white/70" : "text-zinc-500"
                    )}
                  >
                    {timeAgo(m.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
            placeholder="Écris ton message..."
            className="min-h-[44px] resize-none"
            rows={1}
            disabled={sending}
          />
          <Button onClick={send} disabled={sending || !input.trim()} size="icon">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SleepLogger({ token, recent }: { token: string; recent: SleepLog[] }) {
  const router = useRouter();
  const [quality, setQuality] = useState<number | null>(null);
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const today = isoDate();
  const todayLog = recent.find((r) => r.date === today);

  async function submit() {
    if (!quality) return;
    setSaving(true);
    const res = await fetch(`/api/client/${token}/sleep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, quality, hours: hours ? parseFloat(hours) : null, note }),
    });
    setSaving(false);
    if (res.ok) {
      setQuality(null);
      setHours("");
      setNote("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {todayLog && (
        <div className="text-xs text-zinc-500">
          Aujourd&apos;hui : {todayLog.quality}/5{todayLog.hours ? ` (${todayLog.hours}h)` : ""}
        </div>
      )}
      <div>
        <Label className="text-sm">Qualité du sommeil</Label>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuality(n)}
              className={cn(
                "h-9 w-9 rounded-md border text-sm font-medium transition-colors",
                quality === n
                  ? "bg-[var(--brand-primary)] text-white border-transparent"
                  : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Heures dormies</Label>
          <Input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="7.5"
          />
        </div>
      </div>
      <Textarea
        placeholder="Note (réveils nocturnes, rêves, fatigue ressentie...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button onClick={submit} disabled={saving || !quality} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enregistrer mon sommeil
      </Button>
    </div>
  );
}

function NutritionLogger({ token, recent }: { token: string; recent: NutritionLog[] }) {
  const router = useRouter();
  const [met, setMet] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const today = isoDate();
  const todayLog = recent.find((r) => r.date === today);

  async function submit() {
    if (met === null) return;
    setSaving(true);
    const res = await fetch(`/api/client/${token}/nutrition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, goal_met: met, note }),
    });
    setSaving(false);
    if (res.ok) {
      setMet(null);
      setNote("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {todayLog && (
        <div className="text-xs text-zinc-500">
          Aujourd&apos;hui : {todayLog.goal_met ? "✓ objectif atteint" : "✗ pas atteint"}
        </div>
      )}
      <Label className="text-sm">As-tu respecté ton objectif aujourd&apos;hui ?</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMet(true)}
          className={cn(
            "flex-1 px-4 py-2 rounded-md border text-sm font-medium",
            met === true
              ? "bg-emerald-500 text-white border-transparent"
              : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          ✓ Oui
        </button>
        <button
          type="button"
          onClick={() => setMet(false)}
          className={cn(
            "flex-1 px-4 py-2 rounded-md border text-sm font-medium",
            met === false
              ? "bg-red-500 text-white border-transparent"
              : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          ✗ Non
        </button>
      </div>
      <Textarea
        placeholder="Détails (repas raté, écart, fringale...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button onClick={submit} disabled={saving || met === null} className="w-full">
        Enregistrer
      </Button>
    </div>
  );
}

function NoteLogger({ token, notes }: { token: string; notes: ClientNote[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/client/${token}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    if (res.ok) {
      setContent("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder="Écris tout ce que tu veux partager — courbatures, motivation, questions, ce qui marche, ce qui bloque..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={submit} disabled={saving || !content.trim()} size="icon">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      {notes.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.slice(0, 10).map((n) => (
            <div
              key={n.id}
              className="text-sm border-l-2 border-[var(--brand-primary)] pl-3 py-1"
            >
              <div className="flex justify-between text-xs text-zinc-500 mb-0.5">
                <Badge variant={n.author === "client" ? "default" : "muted"}>
                  {n.author === "client" ? "Toi" : "Coach"}
                </Badge>
                <span>{timeAgo(n.created_at)}</span>
              </div>
              <div>{n.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// formatDate kept for future use
void formatDate;
