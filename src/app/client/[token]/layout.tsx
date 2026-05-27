import { notFound } from "next/navigation";
import { getClientByToken } from "@/lib/queries";
import { ensureDb, coerceCoach, type Coach } from "@/lib/db";
import { BrandStyle } from "@/components/brand-style";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await getClientByToken(token);
  if (!client) notFound();
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM coaches WHERE id = ${client.coach_id}`;
  if (rows.length === 0) notFound();
  const coach = coerceCoach(rows[0] as Record<string, unknown>) as Coach;

  return (
    <>
      <BrandStyle
        primary={coach.brand_primary}
        secondary={coach.brand_secondary}
        accent={coach.brand_accent}
      />
      {children}
    </>
  );
}
