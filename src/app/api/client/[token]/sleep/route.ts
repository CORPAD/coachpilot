import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ensureDb } from "@/lib/db";
import { sleepLogSchema } from "@/lib/schemas";
import { requireClientByToken } from "@/lib/client-token";

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  const body = await req.json().catch(() => null);
  const parsed = sleepLogSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const data = parsed.data;
  const sql = await ensureDb();

  // Un seul log par jour: si déjà existant, on refuse (figé jusqu'au lendemain).
  const existing = await sql`
    SELECT id FROM sleep_logs WHERE client_id=${r.id} AND date=${data.date} LIMIT 1
  `;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Tu as déjà enregistré ton sommeil pour aujourd'hui" },
      { status: 409 }
    );
  }

  const id = nanoid();
  await sql`
    INSERT INTO sleep_logs (id, client_id, date, quality, hours, note, created_at)
    VALUES (${id}, ${r.id}, ${data.date}, ${data.quality}, ${data.hours ?? null},
            ${data.note || null}, ${Date.now()})
  `;
  return NextResponse.json({ id });
}
