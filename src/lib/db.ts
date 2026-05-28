import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

declare global {
  var __cp_sql: NeonQueryFunction<false, false> | undefined;
  var __cp_initPromise: Promise<void> | undefined;
}

function getSql(): NeonQueryFunction<false, false> {
  if (!global.__cp_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL manquante. Ajoute-la dans .env.local (provisionne une DB Neon via Vercel Marketplace)."
      );
    }
    global.__cp_sql = neon(url);
  }
  return global.__cp_sql;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS coaches (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    brand_primary TEXT DEFAULT '#0ea5e9',
    brand_secondary TEXT DEFAULT '#0f172a',
    brand_accent TEXT DEFAULT '#22c55e',
    brand_logo TEXT,
    brand_name TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    coach_id TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    access_token TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    height_cm DOUBLE PRECISION,
    weight_kg DOUBLE PRECISION,
    gender TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS client_profiles (
    client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    advantages TEXT,
    constraints TEXT,
    muscular_goals TEXT,
    nutrition_goals TEXT,
    training_frequency INTEGER,
    experience_level TEXT,
    injuries TEXT,
    preferences TEXT,
    updated_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS program_exercises (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT,
    sets INTEGER NOT NULL DEFAULT 3,
    reps TEXT NOT NULL DEFAULT '10',
    weight_kg DOUBLE PRECISION,
    rest_seconds INTEGER DEFAULT 60,
    day_label TEXT,
    day_order INTEGER DEFAULT 0,
    exercise_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    day_label TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at BIGINT,
    rating INTEGER,
    client_note TEXT,
    coach_note TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exercise_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets_done INTEGER,
    reps_done TEXT,
    weight_used DOUBLE PRECISION,
    succeeded INTEGER,
    note TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sleep_logs (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    quality INTEGER,
    hours DOUBLE PRECISION,
    note TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS nutrition_logs (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    goal_met INTEGER,
    note TEXT,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS client_notes (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    read_at BIGINT
  );

  CREATE INDEX IF NOT EXISTS idx_clients_coach ON clients(coach_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
  CREATE INDEX IF NOT EXISTS idx_exercises_client ON program_exercises(client_id);
  CREATE INDEX IF NOT EXISTS idx_notes_client ON client_notes(client_id);
  CREATE INDEX IF NOT EXISTS idx_sleep_client ON sleep_logs(client_id);
  CREATE INDEX IF NOT EXISTS idx_nutrition_client ON nutrition_logs(client_id);
  CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
`;

async function init(): Promise<void> {
  const sql = getSql();
  const statements = SCHEMA.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
}

export async function ensureDb(): Promise<NeonQueryFunction<false, false>> {
  if (!global.__cp_initPromise) {
    global.__cp_initPromise = init().catch((e) => {
      global.__cp_initPromise = undefined;
      throw e;
    });
  }
  await global.__cp_initPromise;
  return getSql();
}

export type Coach = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  brand_primary: string;
  brand_secondary: string;
  brand_accent: string;
  brand_logo: string | null;
  brand_name: string | null;
  created_at: number;
};

export type Client = {
  id: string;
  coach_id: string;
  access_token: string;
  name: string;
  email: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: string | null;
  created_at: number;
};

export type ClientProfile = {
  client_id: string;
  advantages: string | null;
  constraints: string | null;
  muscular_goals: string | null;
  nutrition_goals: string | null;
  training_frequency: number | null;
  experience_level: string | null;
  injuries: string | null;
  preferences: string | null;
  updated_at: number;
};

export type ProgramExercise = {
  id: string;
  client_id: string;
  name: string;
  muscle_group: string | null;
  sets: number;
  reps: string;
  weight_kg: number | null;
  rest_seconds: number | null;
  day_label: string | null;
  day_order: number;
  exercise_order: number;
  notes: string | null;
  created_at: number;
};

export type Session = {
  id: string;
  client_id: string;
  date: string;
  day_label: string | null;
  completed: number;
  completed_at: number | null;
  rating: number | null;
  client_note: string | null;
  coach_note: string | null;
  created_at: number;
};

export type ExerciseLog = {
  id: string;
  session_id: string;
  exercise_name: string;
  sets_done: number | null;
  reps_done: string | null;
  weight_used: number | null;
  succeeded: number | null;
  note: string | null;
  created_at: number;
};

export type SleepLog = {
  id: string;
  client_id: string;
  date: string;
  quality: number | null;
  hours: number | null;
  note: string | null;
  created_at: number;
};

export type NutritionLog = {
  id: string;
  client_id: string;
  date: string;
  goal_met: number | null;
  note: string | null;
  created_at: number;
};

export type ClientNote = {
  id: string;
  client_id: string;
  content: string;
  author: "client" | "coach";
  created_at: number;
};

export type Message = {
  id: string;
  client_id: string;
  sender: "client" | "coach";
  content: string;
  created_at: number;
  read_at: number | null;
};

// Neon returns BIGINT as string; coerce numeric columns when reading.
export function coerceCoach(row: Record<string, unknown>): Coach {
  return { ...row, created_at: Number(row.created_at) } as Coach;
}
export function coerceClient(row: Record<string, unknown>): Client {
  return {
    ...row,
    age: row.age == null ? null : Number(row.age),
    height_cm: row.height_cm == null ? null : Number(row.height_cm),
    weight_kg: row.weight_kg == null ? null : Number(row.weight_kg),
    created_at: Number(row.created_at),
  } as Client;
}
export function coerceProfile(row: Record<string, unknown>): ClientProfile {
  return {
    ...row,
    training_frequency: row.training_frequency == null ? null : Number(row.training_frequency),
    updated_at: Number(row.updated_at),
  } as ClientProfile;
}
export function coerceExercise(row: Record<string, unknown>): ProgramExercise {
  return {
    ...row,
    sets: Number(row.sets),
    weight_kg: row.weight_kg == null ? null : Number(row.weight_kg),
    rest_seconds: row.rest_seconds == null ? null : Number(row.rest_seconds),
    day_order: Number(row.day_order ?? 0),
    exercise_order: Number(row.exercise_order ?? 0),
    created_at: Number(row.created_at),
  } as ProgramExercise;
}
export function coerceSession(row: Record<string, unknown>): Session {
  return {
    ...row,
    completed: Number(row.completed),
    completed_at: row.completed_at == null ? null : Number(row.completed_at),
    rating: row.rating == null ? null : Number(row.rating),
    created_at: Number(row.created_at),
  } as Session;
}
export function coerceSleep(row: Record<string, unknown>): SleepLog {
  return {
    ...row,
    quality: row.quality == null ? null : Number(row.quality),
    hours: row.hours == null ? null : Number(row.hours),
    created_at: Number(row.created_at),
  } as SleepLog;
}
export function coerceNutrition(row: Record<string, unknown>): NutritionLog {
  return {
    ...row,
    goal_met: row.goal_met == null ? null : Number(row.goal_met),
    created_at: Number(row.created_at),
  } as NutritionLog;
}
export function coerceNote(row: Record<string, unknown>): ClientNote {
  return { ...row, created_at: Number(row.created_at) } as ClientNote;
}
export function coerceMessage(row: Record<string, unknown>): Message {
  return {
    ...row,
    created_at: Number(row.created_at),
    read_at: row.read_at == null ? null : Number(row.read_at),
  } as Message;
}
export function coerceExerciseLog(row: Record<string, unknown>): ExerciseLog {
  return {
    ...row,
    sets_done: row.sets_done == null ? null : Number(row.sets_done),
    weight_used: row.weight_used == null ? null : Number(row.weight_used),
    succeeded: row.succeeded == null ? null : Number(row.succeeded),
    created_at: Number(row.created_at),
  } as ExerciseLog;
}
