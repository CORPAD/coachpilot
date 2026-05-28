import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ensureDb } from "@/lib/db";
import { listMessages } from "@/lib/queries";
import { requireClientByToken } from "@/lib/client-token";

const messageSchema = z.object({ content: z.string().min(1).max(2000) });

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;

  const messages = await listMessages(r.id);
  // Marquer comme lus les messages du coach
  const sql = await ensureDb();
  await sql`
    UPDATE messages SET read_at = ${Date.now()}
    WHERE client_id = ${r.id} AND sender = 'coach' AND read_at IS NULL
  `;
  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const mid = nanoid();
  const sql = await ensureDb();
  await sql`
    INSERT INTO messages (id, client_id, sender, content, created_at)
    VALUES (${mid}, ${r.id}, 'client', ${parsed.data.content}, ${Date.now()})
  `;
  return NextResponse.json({ id: mid });
}
