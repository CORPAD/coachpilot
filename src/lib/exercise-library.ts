export type LibraryExercise = {
  name: string;
  muscle_group: string;
};

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Pectoraux
  { name: "Développé couché barre", muscle_group: "Pectoraux" },
  { name: "Développé couché haltères", muscle_group: "Pectoraux" },
  { name: "Développé incliné", muscle_group: "Pectoraux" },
  { name: "Développé décliné", muscle_group: "Pectoraux" },
  { name: "Écarté couché haltères", muscle_group: "Pectoraux" },
  { name: "Écarté à la poulie", muscle_group: "Pectoraux" },
  { name: "Pompes", muscle_group: "Pectoraux" },
  { name: "Dips pectoraux", muscle_group: "Pectoraux" },

  // Dos
  { name: "Tractions", muscle_group: "Dos" },
  { name: "Tirage vertical", muscle_group: "Dos" },
  { name: "Tirage horizontal", muscle_group: "Dos" },
  { name: "Rowing barre", muscle_group: "Dos" },
  { name: "Rowing haltère", muscle_group: "Dos" },
  { name: "Soulevé de terre", muscle_group: "Dos" },
  { name: "Soulevé de terre roumain", muscle_group: "Dos" },
  { name: "Shrug haltères", muscle_group: "Trapèzes" },

  // Épaules
  { name: "Développé militaire barre", muscle_group: "Épaules" },
  { name: "Développé haltères assis", muscle_group: "Épaules" },
  { name: "Élévations latérales", muscle_group: "Épaules" },
  { name: "Élévations frontales", muscle_group: "Épaules" },
  { name: "Oiseau (postérieur d'épaule)", muscle_group: "Épaules" },
  { name: "Face pull", muscle_group: "Épaules" },

  // Bras
  { name: "Curl barre", muscle_group: "Biceps" },
  { name: "Curl haltères", muscle_group: "Biceps" },
  { name: "Curl marteau", muscle_group: "Biceps" },
  { name: "Curl pupitre", muscle_group: "Biceps" },
  { name: "Extensions triceps poulie", muscle_group: "Triceps" },
  { name: "Barre au front", muscle_group: "Triceps" },
  { name: "Dips triceps", muscle_group: "Triceps" },
  { name: "Extensions verticales haltère", muscle_group: "Triceps" },

  // Jambes
  { name: "Squat barre", muscle_group: "Quadriceps" },
  { name: "Front squat", muscle_group: "Quadriceps" },
  { name: "Presse à cuisses", muscle_group: "Quadriceps" },
  { name: "Hack squat", muscle_group: "Quadriceps" },
  { name: "Leg extension", muscle_group: "Quadriceps" },
  { name: "Fentes", muscle_group: "Quadriceps" },
  { name: "Leg curl assis", muscle_group: "Ischio-jambiers" },
  { name: "Leg curl allongé", muscle_group: "Ischio-jambiers" },
  { name: "Good morning", muscle_group: "Ischio-jambiers" },
  { name: "Mollets debout", muscle_group: "Mollets" },
  { name: "Mollets assis", muscle_group: "Mollets" },
  { name: "Hip thrust", muscle_group: "Fessiers" },
  { name: "Abduction poulie", muscle_group: "Fessiers" },

  // Abdos & gainage
  { name: "Crunch", muscle_group: "Abdos" },
  { name: "Relevés de jambes", muscle_group: "Abdos" },
  { name: "Planche", muscle_group: "Gainage" },
  { name: "Roue abdominale", muscle_group: "Abdos" },
  { name: "Russian twist", muscle_group: "Obliques" },

  // Cardio
  { name: "Tapis de course", muscle_group: "Cardio" },
  { name: "Vélo elliptique", muscle_group: "Cardio" },
  { name: "Rameur", muscle_group: "Cardio" },
  { name: "Corde à sauter", muscle_group: "Cardio" },
  { name: "HIIT", muscle_group: "Cardio" },
];

export const MUSCLE_GROUPS = [
  "Pectoraux",
  "Dos",
  "Épaules",
  "Trapèzes",
  "Biceps",
  "Triceps",
  "Quadriceps",
  "Ischio-jambiers",
  "Fessiers",
  "Mollets",
  "Abdos",
  "Obliques",
  "Gainage",
  "Cardio",
];
