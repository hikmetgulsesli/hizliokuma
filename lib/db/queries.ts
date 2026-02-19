import { getDatabase } from './connection';

export interface RecentActivity {
  id: number;
  user_name: string;
  exercise_title: string;
  score: number;
  wpm: number;
  completed_at: string;
}

export interface PopularExercise {
  id: number;
  title: string;
  description: string | null;
  completion_count: number;
}

/**
 * Get total count of all users
 */
export function getTotalUsers(): number {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return result.count;
}

/**
 * Get count of active exercises (is_active = 1)
 */
export function getActiveExercises(): number {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM exercises WHERE is_active = 1').get() as { count: number };
  return result.count;
}

/**
 * Get total count of completed exercises (user_exercise_results)
 */
export function getTotalCompletedExercises(): number {
  const db = getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM user_exercise_results').get() as { count: number };
  return result.count;
}

/**
 * Get daily average minutes spent on exercises
 * Calculates average duration from all completed exercises
 */
export function getDailyAverageMinutes(): number {
  const db = getDatabase();
  const result = db.prepare(`
    SELECT AVG(e.duration_minutes) as average
    FROM user_exercise_results uer
    JOIN exercises e ON uer.exercise_id = e.id
  `).get() as { average: number | null };
  
  return result.average ? Math.round(result.average * 10) / 10 : 0;
}

/**
 * Get recent exercise completions with user names
 * @param limit - Number of activities to return (default: 10)
 */
export function getRecentActivities(limit: number = 10): RecentActivity[] {
  const db = getDatabase();
  const results = db.prepare(`
    SELECT 
      uer.id,
      u.name as user_name,
      e.title as exercise_title,
      uer.score,
      uer.wpm,
      uer.completed_at
    FROM user_exercise_results uer
    JOIN users u ON uer.user_id = u.id
    JOIN exercises e ON uer.exercise_id = e.id
    ORDER BY uer.completed_at DESC
    LIMIT ?
  `).all(limit) as RecentActivity[];
  
  return results;
}

/**
 * Get most popular exercises sorted by completion count
 * @param limit - Number of exercises to return (default: 10)
 */
export function getPopularExercises(limit: number = 10): PopularExercise[] {
  const db = getDatabase();
  const results = db.prepare(`
    SELECT 
      e.id,
      e.title,
      e.description,
      COUNT(uer.id) as completion_count
    FROM exercises e
    LEFT JOIN user_exercise_results uer ON e.id = uer.exercise_id
    GROUP BY e.id, e.title, e.description
    ORDER BY completion_count DESC
    LIMIT ?
  `).all(limit) as PopularExercise[];
  
  return results;
}
