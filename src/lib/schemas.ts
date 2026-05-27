import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Mot de passe trop court (min 6 caractères)"),
  name: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const clientCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  age: z.coerce.number().int().positive().optional().nullable(),
  height_cm: z.coerce.number().positive().optional().nullable(),
  weight_kg: z.coerce.number().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  profile: z.object({
    advantages: z.string().optional().default(""),
    constraints: z.string().optional().default(""),
    muscular_goals: z.string().optional().default(""),
    nutrition_goals: z.string().optional().default(""),
    training_frequency: z.coerce.number().int().min(1).max(14).optional().nullable(),
    experience_level: z.string().optional().default(""),
    injuries: z.string().optional().default(""),
    preferences: z.string().optional().default(""),
  }),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1),
        muscle_group: z.string().optional().default(""),
        sets: z.coerce.number().int().min(1).default(3),
        reps: z.string().default("10"),
        weight_kg: z.coerce.number().nonnegative().optional().nullable(),
        rest_seconds: z.coerce.number().int().nonnegative().optional().nullable(),
        day_label: z.string().optional().default(""),
        day_order: z.coerce.number().int().default(0),
        exercise_order: z.coerce.number().int().default(0),
        notes: z.string().optional().default(""),
      })
    )
    .default([]),
});

export const sessionLogSchema = z.object({
  session_id: z.string(),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  client_note: z.string().optional().default(""),
  completed: z.boolean().optional(),
  exercises: z
    .array(
      z.object({
        exercise_name: z.string(),
        sets_done: z.coerce.number().int().optional().nullable(),
        reps_done: z.string().optional().default(""),
        weight_used: z.coerce.number().optional().nullable(),
        succeeded: z.boolean().optional(),
        note: z.string().optional().default(""),
      })
    )
    .default([]),
});

export const sleepLogSchema = z.object({
  date: z.string(),
  quality: z.coerce.number().int().min(1).max(5),
  hours: z.coerce.number().min(0).max(24).optional().nullable(),
  note: z.string().optional().default(""),
});

export const nutritionLogSchema = z.object({
  date: z.string(),
  goal_met: z.boolean(),
  note: z.string().optional().default(""),
});

export const noteSchema = z.object({
  content: z.string().min(1),
  author: z.enum(["client", "coach"]),
});

export const brandSchema = z.object({
  brand_primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  brand_secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  brand_accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  brand_logo: z.string().optional().nullable(),
  brand_name: z.string().optional().nullable(),
});
