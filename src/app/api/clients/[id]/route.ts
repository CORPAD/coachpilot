import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { requireCoach } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { clientCreateSchema } from "@/lib/schemas";
import { getClientById } from "@/lib/queries";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  const client = await getClientById(id, coach.id);
  if (!client) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  const client = await getClientById(id, coach.id);
  if (!client) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = clientCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const sql = await ensureDb();
  const now = Date.now();

  await sql`
    UPDATE clients
    SET name=${data.name}, email=${data.email || null}, age=${data.age ?? null},
        height_cm=${data.height_cm ?? null}, weight_kg=${data.weight_kg ?? null},
        gender=${data.gender ?? null}
    WHERE id=${id} AND coach_id=${coach.id}
  `;
  await sql`
    INSERT INTO client_profiles (client_id, advantages, constraints, muscular_goals, nutrition_goals,
      training_frequency, experience_level, injuries, preferences, updated_at)
    VALUES (${id}, ${data.profile.advantages || null}, ${data.profile.constraints || null},
            ${data.profile.muscular_goals || null}, ${data.profile.nutrition_goals || null},
            ${data.profile.training_frequency ?? null}, ${data.profile.experience_level || null},
            ${data.profile.injuries || null}, ${data.profile.preferences || null}, ${now})
    ON CONFLICT (client_id) DO UPDATE SET
      advantages=EXCLUDED.advantages,
      constraints=EXCLUDED.constraints,
      muscular_goals=EXCLUDED.muscular_goals,
      nutrition_goals=EXCLUDED.nutrition_goals,
      training_frequency=EXCLUDED.training_frequency,
      experience_level=EXCLUDED.experience_level,
      injuries=EXCLUDED.injuries,
      preferences=EXCLUDED.preferences,
      updated_at=EXCLUDED.updated_at
  `;
  await sql`DELETE FROM program_exercises WHERE client_id=${id}`;
  for (const ex of data.exercises) {
    await sql`
      INSERT INTO program_exercises (id, client_id, name, muscle_group, sets, reps, weight_kg, rest_seconds,
        day_label, day_order, exercise_order, notes, created_at)
      VALUES (${nanoid()}, ${id}, ${ex.name}, ${ex.muscle_group || null}, ${ex.sets}, ${ex.reps},
              ${ex.weight_kg ?? null}, ${ex.rest_seconds ?? null}, ${ex.day_label || null},
              ${ex.day_order}, ${ex.exercise_order}, ${ex.notes || null}, ${now})
    `;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const { id } = await ctx.params;
  const sql = await ensureDb();
  await sql`DELETE FROM clients WHERE id=${id} AND coach_id=${coach.id}`;
  return NextResponse.json({ ok: true });
}
