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
  const id = nanoid();
  const sql = await ensureDb();
  await sql`
    INSERT INTO nutrition_logs (id, client_id, date, goal_met, note, created_at)
    VALUES (${id}, ${r.id}, ${parsed.data.date}, ${parsed.data.goal_met ? 1 : 0},
            ${parsed.data.note || null}, ${Date.now()})
  `;
  return NextResponse.json({ id });
}
