import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { requireCoach } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { noteSchema } from "@/lib/schemas";
import { getClientById, listNotes } from "@/lib/queries";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  if (!(await getClientById(id, coach.id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ notes: await listNotes(id) });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  if (!(await getClientById(id, coach.id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const nid = nanoid();
  const sql = await ensureDb();
  await sql`
    INSERT INTO client_notes (id, client_id, content, author, created_at)
    VALUES (${nid}, ${id}, ${parsed.data.content}, ${parsed.data.author}, ${Date.now()})
  `;
  return NextResponse.json({ id: nid });
}
