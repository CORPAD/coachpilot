import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ensureDb } from "@/lib/db";
import { listSessions } from "@/lib/queries";
import { requireClientByToken } from "@/lib/client-token";

const logSchema = z.object({
  session_id: z.string().optional().nullable(),
  date: z.string(),
  day_label: z.string().optional().default(""),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  client_note: z.string().optional().default(""),
  exercises: z
    .array(
      z.object({
        exercise_name: z.string(),
        sets_done: z.coerce.number().int().optional().nullable(),
        reps_done: z.string().optional().default(""),
        weight_used: z.coerce.number().optional().nullable(),
        succeeded: z.boolean().optional(),
        note: z.string().optional().default(""),
      })
    )
    .default([]),
});

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  return NextResponse.json({ sessions: await listSessions(r.id) });
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await requireClientByToken(token);
  if (r instanceof NextResponse) return r;
  const body = await req.json().catch(() => null);
  const parsed = logSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const data = parsed.data;
  const sql = await ensureDb();
  const sid = data.session_id ?? nanoid();
  const now = Date.now();

  if (data.session_id) {
    await sql`
      UPDATE sessions
      SET completed=1, completed_at=${now}, rating=${data.rating ?? null},
          client_note=${data.client_note || null}
      WHERE id=${sid} AND client_id=${r.id}
    `;
  } else {
    await sql`
      INSERT INTO sessions (id, client_id, date, day_label, completed, completed_at, rating, client_note, created_at)
      VALUES (${sid}, ${r.id}, ${data.date}, ${data.day_label || null}, 1, ${now},
              ${data.rating ?? null}, ${data.client_note || null}, ${now})
    `;
  }
  for (const e of data.exercises) {
    await sql`
      INSERT INTO exercise_logs (id, session_id, exercise_name, sets_done, reps_done, weight_used, succeeded, note, created_at)
      VALUES (${nanoid()}, ${sid}, ${e.exercise_name}, ${e.sets_done ?? null},
              ${e.reps_done || null}, ${e.weight_used ?? null},
              ${e.succeeded === undefined ? null : e.succeeded ? 1 : 0},
              ${e.note || null}, ${now})
    `;
  }
  return NextResponse.json({ id: sid });
}
