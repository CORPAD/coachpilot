import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ensureDb } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { email, password, name } = parsed.data;
  const sql = await ensureDb();
  const existing = await sql`SELECT id FROM coaches WHERE email = ${email.toLowerCase()}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }
  const id = nanoid();
  const password_hash = await hashPassword(password);
  await sql`
    INSERT INTO coaches (id, email, password_hash, name, created_at)
    VALUES (${id}, ${email.toLowerCase()}, ${password_hash}, ${name}, ${Date.now()})
  `;
  await createSession(id);
  return NextResponse.json({ ok: true });
}
