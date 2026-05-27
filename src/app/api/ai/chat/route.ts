import { NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { requireCoach } from "@/lib/auth";
import { getClientById } from "@/lib/queries";
import { coachOverviewText, clientFocusText } from "@/lib/ai-context";

export const runtime = "nodejs";
export const maxDuration = 60;

type Scope =
  | { kind: "coach" }
  | { kind: "client"; clientId: string; clientName: string };

type Message = { role: "user" | "assistant"; content: string };

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY manquante. Ajoute-la dans .env.local" },
      { status: 500 }
    );
  }
  let coach;
  try {
    coach = await requireCoach();
  } catch {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await req.json()) as { messages: Message[]; scope: Scope };
  const { messages, scope } = body;

  let contextText: string;
  if (scope.kind === "client") {
    const client = await getClientById(scope.clientId, coach.id);
    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
    contextText = await clientFocusText(scope.clientId);
  } else {
    contextText = await coachOverviewText(coach);
  }

  const system = `Tu es l'assistant IA personnel de ${coach.name}, un coach sportif.
Tu es son bras droit : tu as accès à toutes les données de ses clients et tu l'aides à prendre les meilleures décisions.

Style : direct, concis, actionnable, en français. Pas de blabla. Va droit au but.
Quand tu fais des suggestions, sois spécifique (nom du client, exercice précis, ajustement chiffré).
Quand tu détectes un signal faible (décrochage, plateau, mauvais sommeil récurrent), mentionne-le proactivement.

Contexte actuel des données du coach :
---
${contextText}
---

Si on te demande un récap, structure-le clairement avec des sous-titres. Si on te demande une analyse, donne 2-3 insights max + 1-2 actions concrètes.`;

  try {
    const result = streamText({
      model: anthropic(MODEL),
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.5,
    });

    return result.toTextStreamResponse();
  } catch (e) {
    return NextResponse.json(
      { error: `Erreur IA : ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
