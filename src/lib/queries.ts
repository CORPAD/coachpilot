import {
  ensureDb,
  coerceClient,
  coerceProfile,
  coerceExercise,
  coerceSession,
  coerceSleep,
  coerceNutrition,
  coerceNote,
  type Client,
  type ClientProfile,
  type ProgramExercise,
  type Session,
  type SleepLog,
  type NutritionLog,
  type ClientNote,
} from "./db";

export async function listClients(coachId: string): Promise<Client[]> {
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM clients WHERE coach_id = ${coachId} ORDER BY created_at DESC`;
  return rows.map((r) => coerceClient(r as Record<string, unknown>));
}

export async function getClientById(id: string, coachId: string): Promise<Client | null> {
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM clients WHERE id = ${id} AND coach_id = ${coachId}`;
  if (rows.length === 0) return null;
  return coerceClient(rows[0] as Record<string, unknown>);
}

export async function getClientByToken(token: string): Promise<Client | null> {
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM clients WHERE access_token = ${token}`;
  if (rows.length === 0) return null;
  return coerceClient(rows[0] as Record<string, unknown>);
}

export async function getClientProfile(clientId: string): Promise<ClientProfile | null> {
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM client_profiles WHERE client_id = ${clientId}`;
  if (rows.length === 0) return null;
  return coerceProfile(rows[0] as Record<string, unknown>);
}

export async function listExercises(clientId: string): Promise<ProgramExercise[]> {
  const sql = await ensureDb();
  const rows = await sql`
    SELECT * FROM program_exercises WHERE client_id = ${clientId}
    ORDER BY day_order, exercise_order
  `;
  return rows.map((r) => coerceExercise(r as Record<string, unknown>));
}

export async function listSessions(clientId: string, limit = 100): Promise<Session[]> {
  const sql = await ensureDb();
  const rows = await sql`
    SELECT * FROM sessions WHERE client_id = ${clientId}
    ORDER BY date DESC LIMIT ${limit}
  `;
  return rows.map((r) => coerceSession(r as Record<string, unknown>));
}

export async function countCompletedSessions(clientId: string): Promise<number> {
  const sql = await ensureDb();
  const rows = await sql`SELECT COUNT(*)::int AS n FROM sessions WHERE client_id = ${clientId} AND completed = 1`;
  return Number((rows[0] as { n: number }).n);
}

export async function listNotes(clientId: string, limit = 50): Promise<ClientNote[]> {
  const sql = await ensureDb();
  const rows = await sql`
    SELECT * FROM client_notes WHERE client_id = ${clientId}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map((r) => coerceNote(r as Record<string, unknown>));
}

export async function listSleep(clientId: string, limit = 30): Promise<SleepLog[]> {
  const sql = await ensureDb();
  const rows = await sql`
    SELECT * FROM sleep_logs WHERE client_id = ${clientId}
    ORDER BY date DESC LIMIT ${limit}
  `;
  return rows.map((r) => coerceSleep(r as Record<string, unknown>));
}

export async function listNutrition(clientId: string, limit = 30): Promise<NutritionLog[]> {
  const sql = await ensureDb();
  const rows = await sql`
    SELECT * FROM nutrition_logs WHERE client_id = ${clientId}
    ORDER BY date DESC LIMIT ${limit}
  `;
  return rows.map((r) => coerceNutrition(r as Record<string, unknown>));
}

export async function buildClientContext(clientId: string) {
  const sql = await ensureDb();
  const rows = await sql`SELECT * FROM clients WHERE id = ${clientId}`;
  if (rows.length === 0) return null;
  const client = coerceClient(rows[0] as Record<string, unknown>);
  const [profile, exercises, recentSessions, completedCount, notes, sleep, nutrition] = await Promise.all([
    getClientProfile(clientId),
    listExercises(clientId),
    listSessions(clientId, 20),
    countCompletedSessions(clientId),
    listNotes(clientId, 20),
    listSleep(clientId, 14),
    listNutrition(clientId, 14),
  ]);
  return { client, profile, exercises, recentSessions, completedCount, notes, sleep, nutrition };
}
