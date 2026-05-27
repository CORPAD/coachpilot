import { type Coach } from "./db";
import { buildClientContext, listClients } from "./queries";
import { formatDate } from "./utils";

export async function coachOverviewText(coach: Coach): Promise<string> {
  const clients = await listClients(coach.id);
  const lines: string[] = [];
  lines.push(`# Coach: ${coach.name} (${coach.email})`);
  lines.push(`Nombre de clients: ${clients.length}\n`);

  for (const c of clients) {
    const ctx = await buildClientContext(c.id);
    if (!ctx) continue;
    lines.push(`## Client: ${c.name}`);
    if (c.age) lines.push(`- Âge: ${c.age}`);
    if (c.height_cm) lines.push(`- Taille: ${c.height_cm} cm`);
    if (c.weight_kg) lines.push(`- Poids: ${c.weight_kg} kg`);
    if (ctx.profile) {
      if (ctx.profile.muscular_goals) lines.push(`- Objectifs musculaires: ${ctx.profile.muscular_goals}`);
      if (ctx.profile.nutrition_goals) lines.push(`- Objectifs nutrition: ${ctx.profile.nutrition_goals}`);
      if (ctx.profile.advantages) lines.push(`- Avantages: ${ctx.profile.advantages}`);
      if (ctx.profile.constraints) lines.push(`- Contraintes: ${ctx.profile.constraints}`);
      if (ctx.profile.injuries) lines.push(`- Blessures: ${ctx.profile.injuries}`);
      if (ctx.profile.training_frequency)
        lines.push(`- Fréquence d'entraînement: ${ctx.profile.training_frequency}/semaine`);
    }
    lines.push(`- Séances complétées: ${ctx.completedCount}`);
    if (ctx.recentSessions.length) {
      const last = ctx.recentSessions.find((s) => s.completed === 1);
      if (last) {
        lines.push(
          `- Dernière séance: ${last.date}${last.rating ? ` (note ${last.rating}/5)` : ""}${
            last.client_note ? ` — "${last.client_note.slice(0, 120)}"` : ""
          }`
        );
      }
    }
    if (ctx.sleep.length) {
      const avg = ctx.sleep.reduce((a, s) => a + (s.quality ?? 0), 0) / ctx.sleep.length;
      lines.push(`- Sommeil moyen (14j): ${avg.toFixed(1)}/5`);
    }
    if (ctx.nutrition.length) {
      const met = ctx.nutrition.filter((n) => n.goal_met === 1).length;
      lines.push(`- Nutrition: objectifs atteints ${met}/${ctx.nutrition.length} derniers jours`);
    }
    if (ctx.notes.length) {
      lines.push(`- Notes récentes du client:`);
      for (const n of ctx.notes.slice(0, 5)) {
        lines.push(`  - [${formatDate(n.created_at)}] ${n.content.slice(0, 200)}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function clientFocusText(clientId: string): Promise<string> {
  const ctx = await buildClientContext(clientId);
  if (!ctx) return "Client introuvable.";
  const { client, profile, exercises, recentSessions, completedCount, notes, sleep, nutrition } = ctx;
  const lines: string[] = [];
  lines.push(`# Client: ${client.name}`);
  if (client.age) lines.push(`- Âge: ${client.age}`);
  if (client.height_cm && client.weight_kg)
    lines.push(`- Mensurations: ${client.height_cm} cm / ${client.weight_kg} kg`);
  lines.push(`- Inscrit depuis: ${formatDate(client.created_at)}`);
  lines.push(`- Séances complétées: ${completedCount}\n`);

  if (profile) {
    lines.push("## Profil");
    if (profile.muscular_goals) lines.push(`Objectifs musculaires: ${profile.muscular_goals}`);
    if (profile.nutrition_goals) lines.push(`Objectifs nutrition: ${profile.nutrition_goals}`);
    if (profile.advantages) lines.push(`Avantages: ${profile.advantages}`);
    if (profile.constraints) lines.push(`Contraintes: ${profile.constraints}`);
    if (profile.injuries) lines.push(`Blessures: ${profile.injuries}`);
    if (profile.experience_level) lines.push(`Niveau: ${profile.experience_level}`);
    if (profile.training_frequency) lines.push(`Fréquence: ${profile.training_frequency}/sem`);
    if (profile.preferences) lines.push(`Préférences: ${profile.preferences}`);
    lines.push("");
  }

  if (exercises.length) {
    lines.push("## Programme actuel");
    const byDay = new Map<string, typeof exercises>();
    for (const ex of exercises) {
      const k = ex.day_label || "Jour";
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k)!.push(ex);
    }
    for (const [day, list] of byDay) {
      lines.push(`### ${day}`);
      for (const ex of list) {
        lines.push(
          `- ${ex.name}: ${ex.sets}x${ex.reps}${ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ""}${
            ex.rest_seconds ? ` (repos ${ex.rest_seconds}s)` : ""
          }${ex.notes ? ` — ${ex.notes}` : ""}`
        );
      }
    }
    lines.push("");
  }

  if (recentSessions.length) {
    lines.push("## Séances récentes (20 dernières)");
    for (const s of recentSessions) {
      lines.push(
        `- ${s.date} ${s.completed ? "✓" : "○"}${s.rating ? ` ${s.rating}/5` : ""}${
          s.client_note ? ` — "${s.client_note.slice(0, 200)}"` : ""
        }`
      );
    }
    lines.push("");
  }

  if (sleep.length) {
    lines.push("## Sommeil (14 derniers jours)");
    for (const s of sleep.slice(0, 14)) {
      lines.push(`- ${s.date}: ${s.quality}/5${s.hours ? ` (${s.hours}h)` : ""}${s.note ? ` — ${s.note}` : ""}`);
    }
    lines.push("");
  }

  if (nutrition.length) {
    lines.push("## Nutrition (derniers jours)");
    for (const n of nutrition.slice(0, 14)) {
      lines.push(`- ${n.date}: ${n.goal_met ? "✓ objectif atteint" : "✗ raté"}${n.note ? ` — ${n.note}` : ""}`);
    }
    lines.push("");
  }

  if (notes.length) {
    lines.push("## Notes (client + coach)");
    for (const n of notes) {
      lines.push(`- [${formatDate(n.created_at)}] (${n.author}) ${n.content}`);
    }
  }

  return lines.join("\n");
}
