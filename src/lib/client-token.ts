import { NextResponse } from "next/server";
import { getClientByToken } from "./queries";
import type { Client } from "./db";

export async function requireClientByToken(
  token: string | undefined
): Promise<Client | NextResponse> {
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
  const client = await getClientByToken(token);
  if (!client) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  return client;
}
