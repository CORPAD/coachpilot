import Link from "next/link";
import { requireCoach } from "@/lib/auth";
import { listClients } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoachAIButton } from "@/components/coach-ai-button";
import { UserPlus, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage() {
  const coach = await requireCoach();
  const clients = await listClients(coach.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mes clients</h1>
          <p className="text-zinc-500 mt-1">{clients.length} client{clients.length > 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex gap-4 flex-wrap items-center">
          <CoachAIButton />
          <Link href="/coach/clients/new">
            <Button>
              <UserPlus className="h-4 w-4" />
              Nouveau client
            </Button>
          </Link>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-zinc-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun client pour l&apos;instant.</p>
            <Link href="/coach/clients/new">
              <Button className="mt-4">Créer ton premier client</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <Link key={c.id} href={`/coach/clients/${c.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full brand-gradient flex items-center justify-center text-white font-semibold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{c.email ?? "Sans email"}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Client depuis le {formatDate(c.created_at)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
