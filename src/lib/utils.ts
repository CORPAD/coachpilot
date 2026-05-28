import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = "Europe/Paris";

const DAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/**
 * Retourne la date du jour au format YYYY-MM-DD selon le fuseau Europe/Paris.
 * Évite les décalages liés au serveur Vercel qui tourne en UTC.
 */
export function isoDate(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${day}`;
}

/**
 * Retourne le nom du jour ("Lundi", "Mardi"...) pour une date calendaire
 * au format YYYY-MM-DD. Indépendant du fuseau (la date calendaire est sans
 * ambiguïté quant au jour de la semaine).
 */
export function dayNameFromIsoDate(isoStr: string): string {
  const [y, m, d] = isoStr.split("-").map(Number);
  if (!y || !m || !d) return "";
  // On utilise UTC midi pour éviter tout problème de DST/fuseau.
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return DAYS_FR[date.getUTCDay()];
}

/**
 * Nom du jour ("Lundi", "Mardi"...) pour aujourd'hui dans le fuseau Paris.
 */
export function todayDayName(): string {
  return dayNameFromIsoDate(isoDate());
}

/**
 * Formate une date — accepte timestamp, Date ou YYYY-MM-DD.
 * - Si YYYY-MM-DD : format calendaire ("28 mai 2026")
 * - Si timestamp/Date : format avec fuseau Paris
 */
export function formatDate(d: string | number | Date): string {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, day, 12));
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format long "Jeudi 28 mai" — pour les en-têtes de séance/historique.
 */
export function formatDayWithName(isoStr: string): string {
  const dayName = dayNameFromIsoDate(isoStr);
  const [y, m, d] = isoStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const dayMonth = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(date);
  return `${dayName} ${dayMonth}`;
}

/**
 * Heure au format HH:MM dans le fuseau Paris.
 */
export function formatTime(d: string | number | Date): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d}j`;
  return formatDate(ts);
}
