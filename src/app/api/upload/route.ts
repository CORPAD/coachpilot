import { NextResponse } from "next/server";
import { requireCoach } from "@/lib/auth";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(req: Request) {
  try { await requireCoach(); } catch { return NextResponse.json({ error: "Non authentifié" }, { status: 401 }); }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (max 2 Mo)" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Format non supporté" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`;
  return NextResponse.json({ url: dataUrl });
}
