import { NextResponse } from "next/server";
import { requireCoach } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { brandSchema } from "@/lib/schemas";

export async function PATCH(req: Request) {
  let coach;
  try { coach = await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const body = await req.json().catch(() => null);
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const sql = await ensureDb();
  await sql`
    UPDATE coaches
    SET brand_primary=${d.brand_primary}, brand_secondary=${d.brand_secondary},
        brand_accent=${d.brand_accent}, brand_logo=${d.brand_logo ?? null},
        brand_name=${d.brand_name ?? null}
    WHERE id=${coach.id}
  `;
  return NextResponse.json({ ok: true });
}
