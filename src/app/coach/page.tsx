import Link from "next/link";
import { requireCoach } from "@/lib/auth";
import { listClients } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ensureDb } from "@/lib/db";
import { UserPlus, Users, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { CoachSuggestions } from "@/components/coach-suggestions";

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

  const stats = [
    { label: "Clients actifs", value: clients.length, icon: Users },
    { label: "Séances réalisées", value: totalSessions, icon: Calendar },
    { label: "Séances cette semaine", value: weekSessions, icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bonjour {coach.name.split(" ")[0]} 👋</h1>
          <p className="text-zinc-500 mt-1">Voici l&apos;état de tes clients aujourd&apos;hui.</p>
        </div>
        <Link href="/coach/clients/new">
          <Button size="lg">
            <UserPlus className="h-4 w-4" />
            Nouveau client
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-sm text-zinc-500">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Suivi des clients</CardTitle>
                <CardDescription>Tes clients et leur dernière activité.</CardDescription>
              </div>
              <Link href="/coach/clients">
                <Button variant="outline" size="sm">Tout voir</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun client pour l&apos;instant.</p>
                <Link href="/coach/clients/new">
                  <Button className="mt-4">Créer ton premier client</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {clients.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    href={`/coach/clients/${c.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-white font-semibold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{c.email ?? "Sans email"}</div>
                    </div>
                    <Badge variant="muted">
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
              Suggestions IA
            </CardTitle>
            <CardDescription>Recommandations basées sur tes clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <CoachSuggestions />
          </CardContent>
        </Card>
      </div>

      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières séances complétées par tes clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <Link
                  key={i}
                  href={`/coach/clients/${a.client_id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {a.client_name} a complété sa séance
                    </div>
                    {a.client_note && (
                      <div className="text-sm text-zinc-500 mt-1 line-clamp-2">
                        &laquo; {a.client_note} &raquo;
                      </div>
                    )}
                  </div>
                  {a.rating && <Badge variant="outline">{a.rating}/5</Badge>}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
