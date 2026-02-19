import { getDatabase } from "./db/connection";

export const EXERCISE_TYPES = {
  BLOK_OKUMA: "blok-okuma",
  GRUP_OKUMA: "grup-okuma",
  METIN_ARAMA: "metin-arama",
  GOLGELEME: "golgeleme",
} as const;

export async function getCurrentUserId(): Promise<number | null> {
  // This is a placeholder - in a real app, this would get the user from the session
  return null;
}

export async function saveExerciseResult(
  userId: number,
  exerciseType: string,
  score: number,
  wpm: number
) {
  const db = getDatabase();
  
  // Find exercise by type
  const exercise = db
    .prepare("SELECT id FROM exercises WHERE type = ?")
    .get(exerciseType) as { id: number } | undefined;
  
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseType}`);
  }
  
  const result = db
    .prepare(
      "INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)"
    )
    .run(userId, exercise.id, score, wpm);
  
  return { id: result.lastInsertRowid };
}
