import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireCoach } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { getClientById, listMessages } from "@/lib/queries";

const messageSchema = z.object({ content: z.string().min(1).max(2000) });

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  if (!(await getClientById(id, coach.id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const messages = await listMessages(id);
  // Marquer comme lus les messages du client
  const sql = await ensureDb();
  await sql`
    UPDATE messages SET read_at = ${Date.now()}
    WHERE client_id = ${id} AND sender = 'client' AND read_at IS NULL
  `;
  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  if (!(await getClientById(id, coach.id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const mid = nanoid();
  const sql = await ensureDb();
  await sql`
    INSERT INTO messages (id, client_id, sender, content, created_at)
    VALUES (${mid}, ${id}, 'coach', ${parsed.data.content}, ${Date.now()})
  `;
  return NextResponse.json({ id: mid });
}
