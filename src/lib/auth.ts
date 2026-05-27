import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ensureDb, coerceCoach, type Coach } from "./db";

const COOKIE_NAME = "cp_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-me-in-production-please-this-is-only-for-local"
);

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(coachId: string) {
  const token = await new SignJWT({ sub: coachId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getCurrentCoach(): Promise<Coach | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const coachId = payload.sub as string;
    const sql = await ensureDb();
    const rows = await sql`SELECT * FROM coaches WHERE id = ${coachId}`;
    if (rows.length === 0) return null;
    return coerceCoach(rows[0] as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function requireCoach(): Promise<Coach> {
  const coach = await getCurrentCoach();
  if (!coach) throw new Error("UNAUTHORIZED");
  return coach;
}
