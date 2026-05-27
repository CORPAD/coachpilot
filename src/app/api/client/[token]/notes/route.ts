import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ensureDb } from "@/lib/db";
import { listNotes } from "@/lib/queries";
import { requireClientByToken } from "@/lib/client-token";

const noteSchema = z.object({ content: z.string().min(1) });

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  return NextResponse.json({ notes: await listNotes(r.id) });
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  const body = await req.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const nid = nanoid();
  const sql = await ensureDb();
  await sql`
    INSERT INTO client_notes (id, client_id, content, author, created_at)
    VALUES (${nid}, ${r.id}, ${parsed.data.content}, 'client', ${Date.now()})
  `;
  return NextResponse.json({ id: nid });
}
