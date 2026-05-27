"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Moon, Apple, MessageSquare, Calendar, CheckCircle2, Star, Flame, Send, Loader2 } from "lucide-react";
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
} from "@/lib/db";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

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
  brand: { name: string; logo: string | null; coachName: string };
}) {
  const today = new Date();
  const todayDay = DAYS[today.getDay()];

  const byDay = new Map<string, ProgramExercise[]>();
  for (const ex of exercises) {
    const k = ex.day_label || "Lundi";
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(ex);
  }

  const todayExercises = byDay.get(todayDay) ?? [];
  const upcomingDays = DAYS.filter((d) => d !== todayDay).filter((d) => byDay.has(d)).slice(0, 4);

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
          todayDay={todayDay}
          exercises={todayExercises}
        />

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
  todayDay,
  exercises,
}: {
  token: string;
  todayDay: string;
  exercises: ProgramExercise[];
}) {
  const router = useRouter();
  const [logs, setLogs] = useState(
    exercises.map((e) => ({
      exercise_name: e.name,
      sets_done: e.sets.toString(),
      reps_done: e.reps,
      weight_used: e.weight_kg?.toString() ?? "",
      succeeded: true,
      note: "",
    }))
  );
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/client/${token}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: isoDate(),
        day_label: todayDay,
        rating,
        client_note: note,
        exercises: logs.map((l) => ({
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
      setNote("");
      setRating(null);
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

  return (
    <Card className="border-[var(--brand-primary)]/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-[var(--brand-primary)]" />
          Entraînement du jour — {todayDay}
        </CardTitle>
        <CardDescription>Coche, ajuste, et laisse une note après ta séance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.map((l, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-medium text-sm">{l.exercise_name}</div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={l.succeeded}
                  onChange={(e) =>
                    setLogs((p) => p.map((x, idx) => (idx === i ? { ...x, succeeded: e.target.checked } : x)))
                  }
                />
                {l.succeeded ? "Réussi" : "Pas réussi"}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Séries</Label>
                <Input
                  type="number"
                  value={l.sets_done}
                  onChange={(e) =>
                    setLogs((p) => p.map((x, idx) => (idx === i ? { ...x, sets_done: e.target.value } : x)))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px]">Reps</Label>
                <Input
                  value={l.reps_done}
                  onChange={(e) =>
                    setLogs((p) => p.map((x, idx) => (idx === i ? { ...x, reps_done: e.target.value } : x)))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px]">Poids (kg)</Label>
                <Input
                  value={l.weight_used}
                  onChange={(e) =>
                    setLogs((p) => p.map((x, idx) => (idx === i ? { ...x, weight_used: e.target.value } : x)))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Input
              placeholder="Note (optionnel) — ex: bras qui tremblent à la 3ème série"
              value={l.note}
              onChange={(e) =>
                setLogs((p) => p.map((x, idx) => (idx === i ? { ...x, note: e.target.value } : x)))
              }
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
                onClick={() => setRating(n)}
                className={cn(
                  "h-9 w-9 rounded-md border text-sm font-medium transition-colors",
                  rating === n
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button onClick={submit} disabled={saving} className="w-full" size="lg">
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
