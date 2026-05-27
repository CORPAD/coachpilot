import { notFound } from "next/navigation";
import { getClientByToken, buildClientContext } from "@/lib/queries";
import { ensureDb, coerceCoach, type Coach } from "@/lib/db";
import { ClientSpace } from "@/components/client-space";

export default async function ClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await getClientByToken(token);
  if (!client) notFound();
  const ctx = await buildClientContext(client.id);
  if (!ctx) notFound();
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM coaches WHERE id = ${client.coach_id}`;
  const coach = coerceCoach(rows[0] as Record<string, unknown>) as Coach;

  return (
    <ClientSpace
      token={token}
      client={ctx.client}
      profile={ctx.profile}
      exercises={ctx.exercises}
      recentSessions={ctx.recentSessions}
      completedCount={ctx.completedCount}
      notes={ctx.notes}
      sleep={ctx.sleep}
      nutrition={ctx.nutrition}
      brand={{
        name: coach.brand_name ?? "Mon coach",
        logo: coach.brand_logo,
        coachName: coach.name,
      }}
    />
  );
}
