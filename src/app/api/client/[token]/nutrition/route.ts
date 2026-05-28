import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ensureDb } from "@/lib/db";
import { nutritionLogSchema } from "@/lib/schemas";
import { requireClientByToken } from "@/lib/client-token";

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  const body = await req.json().catch(() => null);
  const parsed = nutritionLogSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const data = parsed.data;
  const sql = await ensureDb();

  const existing = await sql`
    SELECT id FROM nutrition_logs WHERE client_id=${r.id} AND date=${data.date} LIMIT 1
  `;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Tu as déjà enregistré ta nutrition pour aujourd'hui" },
      { status: 409 }
    );
  }

  const id = nanoid();
  await sql`
    INSERT INTO nutrition_logs (id, client_id, date, goal_met, note, created_at)
    VALUES (${id}, ${r.id}, ${data.date}, ${data.goal_met ? 1 : 0},
            ${data.note || null}, ${Date.now()})
  `;
  return NextResponse.json({ id });
}
