import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { requireCoach } from "@/lib/auth";
import { coachOverviewText } from "@/lib/ai-context";
import { listClients } from "@/lib/queries";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

type RawSuggestion = { title: string; body: string; clientName?: string };

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Réponse IA non JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function GET() {
  let coach;
  try {
    coach = await requireCoach();
  } catch {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const clients = await listClients(coach.id);
  if (clients.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY manquante dans .env.local" },
      { status: 500 }
    );
  }

  const context = await coachOverviewText(coach);

  try {
    const { text } = await generateText({
      model: anthropic(MODEL),
      system: `Tu es l'assistant d'un coach sportif. Tu génères 2 à 4 suggestions concrètes et actionnables.
Priorités : (1) clients qui semblent décrocher, (2) plateaux à débloquer, (3) ajustements nutrition/sommeil, (4) félicitations à faire.
Style : court, direct, français. Pas de généralités.

Tu réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown :
{"suggestions":[{"title":"...","body":"...","clientName":"..."}]}

Le champ clientName est optionnel et doit correspondre EXACTEMENT à un nom de client présent dans le contexte.`,
      prompt: context,
      temperature: 0.4,
    });

    const parsed = extractJson(text) as { suggestions: RawSuggestion[] };
    const clientIdByName = new Map(clients.map((c) => [c.name, c.id] as const));
    const enriched = (parsed.suggestions ?? []).slice(0, 4).map((s) => ({
      title: String(s.title ?? ""),
      body: String(s.body ?? ""),
      clientName: s.clientName,
      clientId: s.clientName ? clientIdByName.get(s.clientName) : undefined,
    }));
    return NextResponse.json({ suggestions: enriched });
  } catch (e) {
    return NextResponse.json(
      { error: `Erreur IA : ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
