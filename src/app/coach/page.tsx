import Link from "next/link";
import { requireCoach } from "@/lib/auth";
import { listClients } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ensureDb } from "@/lib/db";
import { UserPlus, Users, Calendar, TrendingUp, Sparkles, ArrowUpRight, ChevronRight } from "lucide-react";
import { CoachSuggestions } from "@/components/coach-suggestions";
import { CoachAIButton } from "@/components/coach-ai-button";
import { formatDayWithName, timeAgo } from "@/lib/utils";

export default async function CoachDashboard() {
  const coach = await requireCoach();
  const clients = await listClients(coach.id);
  const sql = await ensureDb();

  const totalSessionsRows = await sql`
    SELECT COUNT(*)::int AS n FROM sessions s JOIN clients c ON c.id = s.client_id
    WHERE c.coach_id = ${coach.id} AND s.completed = 1
  `;
  const totalSessions = Number((totalSessionsRows[0] as { n: number }).n);

  const recentActivityRows = await sql`
    SELECT c.id AS client_id, c.name AS client_name, s.date, s.rating, s.client_note, s.completed_at
    FROM sessions s JOIN clients c ON c.id = s.client_id
    WHERE c.coach_id = ${coach.id} AND s.completed = 1
    ORDER BY s.completed_at DESC LIMIT 5
  `;
  const recentActivity = recentActivityRows as Array<{
    client_id: string;
    client_name: string;
    date: string;
    rating: number | null;
    client_note: string | null;
    completed_at: number | string;
  }>;

  const weekRows = await sql`
    SELECT COUNT(*)::int AS n FROM sessions s JOIN clients c ON c.id = s.client_id
    WHERE c.coach_id = ${coach.id} AND s.completed = 1 AND s.completed_at > ${Date.now() - 7 * 24 * 3600 * 1000}
  `;
  const weekSessions = Number((weekRows[0] as { n: number }).n);

  const previousWeekRows = await sql`
    SELECT COUNT(*)::int AS n FROM sessions s JOIN clients c ON c.id = s.client_id
    WHERE c.coach_id = ${coach.id} AND s.completed = 1
      AND s.completed_at > ${Date.now() - 14 * 24 * 3600 * 1000}
      AND s.completed_at <= ${Date.now() - 7 * 24 * 3600 * 1000}
  `;
  const previousWeek = Number((previousWeekRows[0] as { n: number }).n);
  const weekDelta = weekSessions - previousWeek;

  const firstName = coach.name.split(" ")[0];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md p-6 md:p-8">
        <div
          aria-hidden
          className="absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] font-semibold text-[var(--brand-primary)]">
              Tableau de bord
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">
              Bonjour {firstName} <span className="inline-block">👋</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl">
              {clients.length === 0
                ? "Bienvenue. Commence par créer ton premier client pour activer ton bras droit IA."
                : `${clients.length} client${clients.length > 1 ? "s" : ""} suivis · ${weekSessions} séance${weekSessions > 1 ? "s" : ""} cette semaine.`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <CoachAIButton size="lg" variant="outline" />
            <Link href="/coach/clients/new">
              <Button size="lg">
                <UserPlus className="h-4 w-4" />
                Nouveau client
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Clients actifs"
          value={clients.length}
          tone="primary"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Séances réalisées"
          value={totalSessions}
          tone="emerald"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Cette semaine"
          value={weekSessions}
          tone="amber"
          delta={previousWeek > 0 || weekSessions > 0 ? weekDelta : undefined}
        />
      </section>

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_-8px_rgba(0,0,0,0.1)]">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>Suivi des clients</CardTitle>
                <CardDescription>Les plus récemment ajoutés.</CardDescription>
              </div>
              <Link href="/coach/clients">
                <Button variant="outline" size="sm">
                  Tout voir
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <EmptyClients />
            ) : (
              <div className="space-y-1">
                {clients.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    href={`/coach/clients/${c.id}`}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <Avatar name={c.name} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">{c.name}</div>
                      <div className="text-xs text-zinc-500 truncate">
                        {c.email ?? "Sans email"}
                      </div>
                    </div>
                    <Badge variant="muted">{timeAgo(c.created_at)}</Badge>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-px h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--brand-primary), transparent)",
            }}
          />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10">
                <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
              </span>
              Suggestions IA
            </CardTitle>
            <CardDescription>Recommandations basées sur tes clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <CoachSuggestions />
          </CardContent>
        </Card>
      </section>

      {/* ACTIVITÉ */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières séances complétées par tes clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-2 pl-5 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
              {recentActivity.map((a, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[18px] top-[14px] h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"
                  />
                  <Link
                    href={`/coach/clients/${a.client_id}`}
                    className="block p-3 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">
                          {a.client_name} a complété sa séance
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {formatDayWithName(a.date)}
                          {a.completed_at && ` · ${timeAgo(Number(a.completed_at))}`}
                        </div>
                        {a.client_note && (
                          <div className="text-sm text-zinc-500 mt-1 line-clamp-2">
                            &laquo; {a.client_note} &raquo;
                          </div>
                        )}
                      </div>
                      {a.rating && <Badge variant="outline">{a.rating}/5</Badge>}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "emerald" | "amber";
  delta?: number;
}) {
  const toneClasses = {
    primary: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[tone];

  return (
    <Card className="group hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_-8px_rgba(0,0,0,0.1)]">
      <CardContent className="pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center ${toneClasses} transition-transform group-hover:scale-105`}
          >
            {icon}
          </div>
          {typeof delta === "number" && (
            <Badge
              variant={delta >= 0 ? "success" : "warning"}
              className="text-[10px]"
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          <div className="text-sm text-zinc-500 mt-0.5">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="relative flex-shrink-0">
      <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-white font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        {initial}
      </div>
    </div>
  );
}

function EmptyClients() {
  return (
    <div className="text-center py-14">
      <div className="relative mx-auto mb-4 h-16 w-16">
        <div className="absolute inset-0 rounded-2xl bg-[var(--brand-primary)]/10 blur-xl" />
        <div className="relative h-16 w-16 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
          <Users className="h-7 w-7 text-[var(--brand-primary)]" />
        </div>
      </div>
      <p className="text-sm text-zinc-500 mb-4">Aucun client pour l&apos;instant.</p>
      <Link href="/coach/clients/new">
        <Button size="sm">
          <UserPlus className="h-3.5 w-3.5" />
          Créer ton premier client
        </Button>
      </Link>
    </div>
  );
}
