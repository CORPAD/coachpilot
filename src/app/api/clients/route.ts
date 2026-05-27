import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { requireCoach } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { clientCreateSchema } from "@/lib/schemas";
import { listClients } from "@/lib/queries";

export async function GET() {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  return NextResponse.json({ clients: await listClients(coach.id) });
}

export async function POST(req: Request) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
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
  const id = nanoid();
  const token = nanoid(24);
  const now = Date.now();

  await sql`
    INSERT INTO clients (id, coach_id, access_token, name, email, age, height_cm, weight_kg, gender, created_at)
    VALUES (${id}, ${coach.id}, ${token}, ${data.name}, ${data.email || null},
            ${data.age ?? null}, ${data.height_cm ?? null}, ${data.weight_kg ?? null},
            ${data.gender ?? null}, ${now})
  `;
  await sql`
    INSERT INTO client_profiles (client_id, advantages, constraints, muscular_goals, nutrition_goals,
      training_frequency, experience_level, injuries, preferences, updated_at)
    VALUES (${id}, ${data.profile.advantages || null}, ${data.profile.constraints || null},
            ${data.profile.muscular_goals || null}, ${data.profile.nutrition_goals || null},
            ${data.profile.training_frequency ?? null}, ${data.profile.experience_level || null},
            ${data.profile.injuries || null}, ${data.profile.preferences || null}, ${now})
  `;
  for (const ex of data.exercises) {
    await sql`
      INSERT INTO program_exercises (id, client_id, name, muscle_group, sets, reps, weight_kg, rest_seconds,
        day_label, day_order, exercise_order, notes, created_at)
      VALUES (${nanoid()}, ${id}, ${ex.name}, ${ex.muscle_group || null}, ${ex.sets}, ${ex.reps},
              ${ex.weight_kg ?? null}, ${ex.rest_seconds ?? null}, ${ex.day_label || null},
              ${ex.day_order}, ${ex.exercise_order}, ${ex.notes || null}, ${now})
    `;
  }

  return NextResponse.json({ id, accessToken: token });
}
