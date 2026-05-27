import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireCoach } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { getClientById, listSessions } from "@/lib/queries";

const createSchema = z.object({
  date: z.string(),
  day_label: z.string().optional().default(""),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  if (!(await getClientById(id, coach.id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ sessions: await listSessions(id) });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  if (!(await getClientById(id, coach.id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const sid = nanoid();
  const sql = await ensureDb();
  await sql`
    INSERT INTO sessions (id, client_id, date, day_label, completed, created_at)
    VALUES (${sid}, ${id}, ${parsed.data.date}, ${parsed.data.day_label || null}, 0, ${Date.now()})
  `;
  return NextResponse.json({ id: sid });
}
