import { NextResponse } from "next/server";
import { ensureDb, coerceCoach, type Coach } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM coaches WHERE email = ${email.toLowerCase()}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  const coach = coerceCoach(rows[0] as Record<string, unknown>) as Coach;
  if (!(await verifyPassword(password, coach.password_hash))) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  await createSession(coach.id);
  return NextResponse.json({ ok: true });
}
