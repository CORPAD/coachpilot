"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EXERCISE_LIBRARY, MUSCLE_GROUPS } from "@/lib/exercise-library";

type ExerciseRow = {
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  weight_kg: string;
  rest_seconds: string;
  day_label: string;
  notes: string;
};

export type ClientFormInitial = {
  name: string;
  email?: string;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  gender?: string | null;
  profile?: {
    advantages?: string | null;
    constraints?: string | null;
    muscular_goals?: string | null;
    nutrition_goals?: string | null;
    training_frequency?: number | null;
    experience_level?: string | null;
    injuries?: string | null;
    preferences?: string | null;
  };
  exercises?: Array<{
    name: string;
    muscle_group?: string | null;
    sets: number;
    reps: string;
    weight_kg?: number | null;
    rest_seconds?: number | null;
    day_label?: string | null;
    notes?: string | null;
  }>;
};

const DEFAULT_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function ClientForm({
  initial,
  clientId,
}: {
  initial?: ClientFormInitial;
  clientId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identity, setIdentity] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    age: initial?.age?.toString() ?? "",
    height_cm: initial?.height_cm?.toString() ?? "",
    weight_kg: initial?.weight_kg?.toString() ?? "",
    gender: initial?.gender ?? "",
  });

  const [profile, setProfile] = useState({
    advantages: initial?.profile?.advantages ?? "",
    constraints: initial?.profile?.constraints ?? "",
    muscular_goals: initial?.profile?.muscular_goals ?? "",
    nutrition_goals: initial?.profile?.nutrition_goals ?? "",
    training_frequency: initial?.profile?.training_frequency?.toString() ?? "3",
    experience_level: initial?.profile?.experience_level ?? "Débutant",
    injuries: initial?.profile?.injuries ?? "",
    preferences: initial?.profile?.preferences ?? "",
  });

  const [exercises, setExercises] = useState<ExerciseRow[]>(
    initial?.exercises?.map((e) => ({
      name: e.name,
      muscle_group: e.muscle_group ?? "",
      sets: e.sets,
      reps: e.reps,
      weight_kg: e.weight_kg?.toString() ?? "",
      rest_seconds: e.rest_seconds?.toString() ?? "60",
      day_label: e.day_label ?? "Lundi",
      notes: e.notes ?? "",
    })) ?? [
      {
        name: "",
        muscle_group: "",
        sets: 3,
        reps: "10",
        weight_kg: "",
        rest_seconds: "60",
        day_label: "Lundi",
        notes: "",
      },
    ]
  );

  function addExerciseFromLibrary(name: string, muscle: string) {
    setExercises((prev) => [
      ...prev,
      {
        name,
        muscle_group: muscle,
        sets: 3,
        reps: "10",
        weight_kg: "",
        rest_seconds: "60",
        day_label: prev[prev.length - 1]?.day_label ?? "Lundi",
        notes: "",
      },
    ]);
  }

  function addBlankExercise() {
    setExercises((prev) => [
      ...prev,
      {
        name: "",
        muscle_group: "",
        sets: 3,
        reps: "10",
        weight_kg: "",
        rest_seconds: "60",
        day_label: prev[prev.length - 1]?.day_label ?? "Lundi",
        notes: "",
      },
    ]);
  }

  function updateExercise(i: number, patch: Partial<ExerciseRow>) {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)));
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const orderByDay = new Map<string, number>();
    const exercisesPayload = exercises
      .filter((ex) => ex.name.trim().length > 0)
      .map((ex) => {
        const day = ex.day_label || "Lundi";
        const dayOrder = DEFAULT_DAYS.indexOf(day);
        const order = orderByDay.get(day) ?? 0;
        orderByDay.set(day, order + 1);
        return {
          name: ex.name.trim(),
          muscle_group: ex.muscle_group,
          sets: ex.sets,
          reps: ex.reps || "10",
          weight_kg: ex.weight_kg ? parseFloat(ex.weight_kg) : null,
          rest_seconds: ex.rest_seconds ? parseInt(ex.rest_seconds, 10) : null,
          day_label: day,
          day_order: dayOrder < 0 ? 0 : dayOrder,
          exercise_order: order,
          notes: ex.notes,
        };
      });

    const payload = {
      name: identity.name,
      email: identity.email || undefined,
      age: identity.age ? parseInt(identity.age, 10) : null,
      height_cm: identity.height_cm ? parseFloat(identity.height_cm) : null,
      weight_kg: identity.weight_kg ? parseFloat(identity.weight_kg) : null,
      gender: identity.gender || null,
      profile: {
        ...profile,
        training_frequency: profile.training_frequency ? parseInt(profile.training_frequency, 10) : null,
      },
      exercises: exercisesPayload,
    };

    const url = clientId ? `/api/clients/${clientId}` : "/api/clients";
    const method = clientId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Erreur");
      return;
    }
    if (clientId) {
      router.push(`/coach/clients/${clientId}`);
    } else {
      const j = await res.json();
      router.push(`/coach/clients/${j.id}`);
    }
    router.refresh();
  }

  const byDay = new Map<string, number[]>();
  exercises.forEach((ex, i) => {
    const day = ex.day_label || "Lundi";
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(i);
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>Informations de base du client.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              required
              value={identity.name}
              onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={identity.email}
              onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Âge</Label>
            <Input
              id="age"
              type="number"
              value={identity.age}
              onChange={(e) => setIdentity({ ...identity, age: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height">Taille (cm)</Label>
            <Input
              id="height"
              type="number"
              value={identity.height_cm}
              onChange={(e) => setIdentity({ ...identity, height_cm: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Poids (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={identity.weight_kg}
              onChange={(e) => setIdentity({ ...identity, weight_kg: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">Genre</Label>
            <select
              id="gender"
              className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              value={identity.gender}
              onChange={(e) => setIdentity({ ...identity, gender: e.target.value })}
            >
              <option value="">—</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil & objectifs</CardTitle>
          <CardDescription>
            Plus c&apos;est précis, plus l&apos;IA peut t&apos;aider à coacher.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Objectifs musculaires / performance</Label>
            <Textarea
              placeholder="Ex: prise de masse haut du corps, gagner 5kg sur le squat, etc."
              value={profile.muscular_goals}
              onChange={(e) => setProfile({ ...profile, muscular_goals: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Objectifs nutritionnels</Label>
            <Textarea
              placeholder="Ex: déficit 300 kcal, 2g protéines/kg, réduire alcool, etc."
              value={profile.nutrition_goals}
              onChange={(e) => setProfile({ ...profile, nutrition_goals: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Avantages / atouts</Label>
            <Textarea
              placeholder="Ex: motivé, déjà 2 ans d'expérience, accès salle complète..."
              value={profile.advantages}
              onChange={(e) => setProfile({ ...profile, advantages: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contraintes</Label>
            <Textarea
              placeholder="Ex: temps limité, déplacements fréquents, matériel limité..."
              value={profile.constraints}
              onChange={(e) => setProfile({ ...profile, constraints: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Blessures / restrictions médicales</Label>
            <Textarea
              placeholder="Ex: dos sensible, ancienne entorse genou..."
              value={profile.injuries}
              onChange={(e) => setProfile({ ...profile, injuries: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Préférences</Label>
            <Textarea
              placeholder="Ex: préfère poids libres, n'aime pas le cardio..."
              value={profile.preferences}
              onChange={(e) => setProfile({ ...profile, preferences: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Niveau</Label>
            <select
              className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              value={profile.experience_level}
              onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
            >
              <option>Débutant</option>
              <option>Intermédiaire</option>
              <option>Avancé</option>
              <option>Élite</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Fréquence (séances/semaine)</Label>
            <Input
              type="number"
              min={1}
              max={14}
              value={profile.training_frequency}
              onChange={(e) => setProfile({ ...profile, training_frequency: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Programme d&apos;entraînement</CardTitle>
              <CardDescription>Sélectionne des exercices ou ajoute les tiens.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addBlankExercise}>
              <Plus className="h-4 w-4" />
              Exercice vierge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-[var(--brand-primary)] hover:underline">
              <Sparkles className="inline h-3 w-3 mr-1" />
              Bibliothèque d&apos;exercices ({EXERCISE_LIBRARY.length})
            </summary>
            <div className="mt-3 max-h-64 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 space-y-1">
              {MUSCLE_GROUPS.map((mg) => {
                const exs = EXERCISE_LIBRARY.filter((e) => e.muscle_group === mg);
                if (exs.length === 0) return null;
                return (
                  <div key={mg}>
                    <div className="text-xs font-semibold text-zinc-500 px-2 py-1">{mg}</div>
                    <div className="flex flex-wrap gap-1 px-2 pb-2">
                      {exs.map((e) => (
                        <button
                          type="button"
                          key={e.name}
                          onClick={() => addExerciseFromLibrary(e.name, e.muscle_group)}
                          className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-[var(--brand-primary)] hover:text-white hover:border-transparent transition-colors"
                        >
                          + {e.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>

          <div className="space-y-4">
            {Array.from(byDay.entries())
              .sort((a, b) => DEFAULT_DAYS.indexOf(a[0]) - DEFAULT_DAYS.indexOf(b[0]))
              .map(([day, indices]) => (
                <div key={day}>
                  <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2 px-1">
                    {day}
                  </div>
                  <div className="space-y-2">
                    {indices.map((i) => {
                      const ex = exercises[i];
                      return (
                        <div
                          key={i}
                          className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                        >
                          <GripVertical className="col-span-1 h-5 w-5 text-zinc-400 mt-2.5" />
                          <div className="col-span-12 md:col-span-4 space-y-1">
                            <Input
                              placeholder="Nom de l'exercice"
                              value={ex.name}
                              onChange={(e) => updateExercise(i, { name: e.target.value })}
                              required
                            />
                            <select
                              className="flex h-8 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 text-xs"
                              value={ex.day_label}
                              onChange={(e) => updateExercise(i, { day_label: e.target.value })}
                            >
                              {DEFAULT_DAYS.map((d) => (
                                <option key={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-3 md:col-span-1">
                            <Input
                              type="number"
                              min={1}
                              placeholder="Séries"
                              value={ex.sets}
                              onChange={(e) => updateExercise(i, { sets: parseInt(e.target.value, 10) || 1 })}
                            />
                            <div className="text-[10px] text-zinc-500 text-center mt-0.5">séries</div>
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            <Input
                              placeholder="Reps"
                              value={ex.reps}
                              onChange={(e) => updateExercise(i, { reps: e.target.value })}
                            />
                            <div className="text-[10px] text-zinc-500 text-center mt-0.5">reps (ex 8-10)</div>
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="Poids"
                              value={ex.weight_kg}
                              onChange={(e) => updateExercise(i, { weight_kg: e.target.value })}
                            />
                            <div className="text-[10px] text-zinc-500 text-center mt-0.5">kg</div>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <Input
                              type="number"
                              placeholder="Repos"
                              value={ex.rest_seconds}
                              onChange={(e) => updateExercise(i, { rest_seconds: e.target.value })}
                            />
                            <div className="text-[10px] text-zinc-500 text-center mt-0.5">s repos</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExercise(i)}
                            className="col-span-1 text-red-500 hover:text-red-700 p-2"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="col-span-12 md:col-start-2 md:col-span-11">
                            <Input
                              placeholder="Notes (technique, tempo...)"
                              value={ex.notes}
                              onChange={(e) => updateExercise(i, { notes: e.target.value })}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            {exercises.length === 0 && (
              <div className="text-center py-8 text-sm text-zinc-500">
                Aucun exercice. Ajoute-en depuis la bibliothèque ou crée-en un.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Enregistrement..." : clientId ? "Enregistrer les modifications" : "Créer le client"}
        </Button>
      </div>
    </form>
  );
}
