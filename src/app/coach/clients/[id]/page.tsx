import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ChevronLeft, Edit, Copy, Calendar, Dumbbell, Moon, Apple, MessageSquare, Trash2, Mail } from "lucide-react";
import { requireCoach } from "@/lib/auth";
import { buildClientContext } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, timeAgo } from "@/lib/utils";
import { ClientAIButton } from "@/components/client-ai-button";
import { ClientLinkCopy } from "@/components/client-link-copy";
import { DeleteClientButton } from "@/components/delete-client-button";
import { CoachMessages } from "@/components/coach-messages";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const coach = await requireCoach();
  const { id } = await params;
  const ctx = await buildClientContext(id);
  if (!ctx || ctx.client.coach_id !== coach.id) redirect("/coach/clients");

  const { client, profile, exercises, recentSessions, completedCount, notes, sleep, nutrition, messages } = ctx;
  const unreadFromClient = messages.filter((m) => m.sender === "client" && !m.read_at).length;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const clientUrl = `${proto}://${host}/client/${client.access_token}`;

  const byDay = new Map<string, typeof exercises>();
  for (const ex of exercises) {
    const k = ex.day_label || "Jour";
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(ex);
  }

  const sleepAvg = sleep.length
    ? (sleep.reduce((a, s) => a + (s.quality ?? 0), 0) / sleep.length).toFixed(1)
    : null;
  const nutritionMet = nutrition.filter((n) => n.goal_met === 1).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href="/coach/clients"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-[var(--brand-primary)] mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux clients
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full brand-gradient flex items-center justify-center text-white font-semibold text-2xl">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{client.name}</h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {client.email ?? "Sans email"} • Client depuis {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ClientAIButton clientId={client.id} clientName={client.name} />
            <Link href={`/coach/clients/${client.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4" />
                Modifier la fiche
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Lien d&apos;accès personnalisé du client
          </CardTitle>
          <CardDescription>
            Envoie ce lien à {client.name.split(" ")[0]}. Aucun mot de passe nécessaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientLinkCopy url={clientUrl} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <Dumbbell className="h-5 w-5 mx-auto mb-1 text-[var(--brand-primary)]" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-xs text-zinc-500">séances</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-[var(--brand-primary)]" />
            <div className="text-2xl font-bold">{profile?.training_frequency ?? "—"}</div>
            <div className="text-xs text-zinc-500">séances/sem</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Moon className="h-5 w-5 mx-auto mb-1 text-[var(--brand-primary)]" />
            <div className="text-2xl font-bold">{sleepAvg ?? "—"}</div>
            <div className="text-xs text-zinc-500">sommeil /5</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Apple className="h-5 w-5 mx-auto mb-1 text-[var(--brand-primary)]" />
            <div className="text-2xl font-bold">
              {nutrition.length > 0 ? `${nutritionMet}/${nutrition.length}` : "—"}
            </div>
            <div className="text-xs text-zinc-500">objectifs nutri</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profile && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle>Profil & objectifs</CardTitle>
                <Link href={`/coach/clients/${client.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.muscular_goals && (
                <div>
                  <div className="font-semibold text-xs uppercase text-zinc-500 mb-1">Objectifs musculaires</div>
                  <div>{profile.muscular_goals}</div>
                </div>
              )}
              {profile.nutrition_goals && (
                <div>
                  <div className="font-semibold text-xs uppercase text-zinc-500 mb-1">Objectifs nutrition</div>
                  <div>{profile.nutrition_goals}</div>
                </div>
              )}
              {profile.advantages && (
                <div>
                  <div className="font-semibold text-xs uppercase text-zinc-500 mb-1">Atouts</div>
                  <div>{profile.advantages}</div>
                </div>
              )}
              {profile.constraints && (
                <div>
                  <div className="font-semibold text-xs uppercase text-zinc-500 mb-1">Contraintes</div>
                  <div>{profile.constraints}</div>
                </div>
              )}
              {profile.injuries && (
                <div>
                  <div className="font-semibold text-xs uppercase text-zinc-500 mb-1">Blessures</div>
                  <div>{profile.injuries}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle>Programme d&apos;entraînement</CardTitle>
              <Link href={`/coach/clients/${client.id}/edit#programme`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {exercises.length === 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-zinc-500">Aucun exercice configuré.</div>
                <Link href={`/coach/clients/${client.id}/edit#programme`}>
                  <Button size="sm">
                    <Edit className="h-3.5 w-3.5" />
                    Créer le programme
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(byDay.entries()).map(([day, list]) => (
                  <div key={day}>
                    <div className="font-semibold text-sm mb-2">{day}</div>
                    <ul className="space-y-1.5 text-sm">
                      {list.map((ex) => (
                        <li key={ex.id} className="flex justify-between gap-2">
                          <span className="text-zinc-700 dark:text-zinc-300">{ex.name}</span>
                          <span className="text-zinc-500 whitespace-nowrap">
                            {ex.sets}x{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={unreadFromClient > 0 ? "border-[var(--brand-primary)]" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Messagerie avec {client.name.split(" ")[0]}
            {unreadFromClient > 0 && (
              <Badge variant="default" className="ml-auto">
                {unreadFromClient} nouveau{unreadFromClient > 1 ? "x" : ""}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Envoie un mot, une félicitation ou un rappel.</CardDescription>
        </CardHeader>
        <CardContent>
          <CoachMessages clientId={client.id} clientName={client.name} initialMessages={messages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes & retours du client
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-sm text-zinc-500">Pas encore de notes. Elles apparaîtront ici dès que {client.name.split(" ")[0]} en ajoutera depuis son espace.</div>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="text-sm border-l-2 border-[var(--brand-primary)] pl-3 py-1"
                >
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <Badge variant={n.author === "client" ? "default" : "muted"}>
                      {n.author === "client" ? "Client" : "Coach"}
                    </Badge>
                    <span>{timeAgo(n.created_at)}</span>
                  </div>
                  <div>{n.content}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des séances</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="text-sm text-zinc-500">Aucune séance pour l&apos;instant.</div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${s.completed ? "bg-emerald-500" : "bg-zinc-300"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {s.date} {s.day_label && <span className="text-zinc-500">— {s.day_label}</span>}
                    </div>
                    {s.client_note && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">{s.client_note}</div>
                    )}
                  </div>
                  {s.rating && <Badge variant="outline">{s.rating}/5</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-base">
            <Trash2 className="h-4 w-4" />
            Zone dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </CardContent>
      </Card>
    </div>
  );
}
