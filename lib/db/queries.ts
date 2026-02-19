import { getDatabase } from './connection';

export interface DashboardStats {
  totalUsers: number;
  activeExercises: number;
  totalCompletedExercises: number;
  dailyAverageMinutes: number;
}

export interface RecentActivity {
  id: number;
  userName: string;
  action: string;
  time: string;
  timeAgo: string;
}

export interface PopularExercise {
  id: number;
  name: string;
  completions: number;
  percentage: number;
}

export function getDashboardStats(): DashboardStats {
  const db = getDatabase();

  // Total users count
  const userCountResult = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const totalUsers = userCountResult.count;

  // Active exercises count (is_active = 1)
  const activeExercisesResult = db.prepare('SELECT COUNT(*) as count FROM exercises WHERE is_active = 1').get() as { count: number };
  const activeExercises = activeExercisesResult.count;

  // Total completed exercises
  const completedResult = db.prepare('SELECT COUNT(*) as count FROM user_exercise_results').get() as { count: number };
  const totalCompletedExercises = completedResult.count;

  // Daily average minutes (average duration of completed exercises)
  // Calculate total minutes from all completed exercises divided by unique days with activity
  const totalMinutesResult = db.prepare(`
    SELECT SUM(e.duration_minutes) as total_minutes
    FROM user_exercise_results uer
    JOIN exercises e ON uer.exercise_id = e.id
  `).get() as { total_minutes: number | null };
  
  const uniqueDaysResult = db.prepare(`
    SELECT COUNT(DISTINCT date(completed_at)) as unique_days
    FROM user_exercise_results
  `).get() as { unique_days: number };

  const totalMinutes = totalMinutesResult.total_minutes || 0;
  const uniqueDays = uniqueDaysResult.unique_days || 1; // Avoid division by zero
  const dailyAverageMinutes = Math.round(totalMinutes / uniqueDays);

  return {
    totalUsers,
    activeExercises,
    totalCompletedExercises,
    dailyAverageMinutes,
  };
}

export function getRecentActivities(limit: number = 10): RecentActivity[] {
  const db = getDatabase();

  // Get recent exercise completions with user names
  const activities = db.prepare(`
    SELECT 
      uer.id,
      u.name as user_name,
      e.title as exercise_title,
      uer.completed_at,
      uer.wpm
    FROM user_exercise_results uer
    JOIN users u ON uer.user_id = u.id
    JOIN exercises e ON uer.exercise_id = e.id
    ORDER BY uer.completed_at DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: number;
    user_name: string;
    exercise_title: string;
    completed_at: string;
    wpm: number;
  }>;

  return activities.map(activity => {
    const completedDate = new Date(activity.completed_at);
    const now = new Date();
    const diffMs = now.getTime() - completedDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeAgo: string;
    if (diffMins < 1) {
      timeAgo = 'az önce';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} dakika önce`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      timeAgo = `${diffDays} gün önce`;
    } else {
      timeAgo = completedDate.toLocaleDateString('tr-TR');
    }

    return {
      id: activity.id,
      userName: activity.user_name,
      action: `"${activity.exercise_title}" tamamladı (${activity.wpm} WPM)`,
      time: activity.completed_at,
      timeAgo,
    };
  });
}

export function getPopularExercises(limit: number = 5): PopularExercise[] {
  const db = getDatabase();

  // Get completion counts for each exercise
  const exercises = db.prepare(`
    SELECT 
      e.id,
      e.title as name,
      COUNT(uer.id) as completions
    FROM exercises e
    LEFT JOIN user_exercise_results uer ON e.id = uer.exercise_id
    GROUP BY e.id, e.title
    ORDER BY completions DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: number;
    name: string;
    completions: number;
  }>;

  // Calculate max completions for percentage calculation
  const maxCompletions = exercises.length > 0 ? Math.max(...exercises.map(e => e.completions)) : 0;

  return exercises.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    completions: exercise.completions,
    percentage: maxCompletions > 0 ? Math.round((exercise.completions / maxCompletions) * 100) : 0,
  }));
}

// Analytics metrics interfaces
export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalExercises: number;
  completedExercises: number;
  averageWpm: number;
  totalRewards: number;
  redeemedRewards: number;
}

export interface WeeklyActivity {
  day: string;
  completions: number;
}

export interface ExerciseDistribution {
  type: string;
  count: number;
}

// Get analytics metrics
export function getAnalyticsMetrics(): AnalyticsMetrics {
  const db = getDatabase();

  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  const activeUsers = (db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_exercise_results WHERE completed_at > datetime("now", "-7 days")').get() as { count: number }).count;
  const totalExercises = (db.prepare('SELECT COUNT(*) as count FROM exercises').get() as { count: number }).count;
  const completedExercises = (db.prepare('SELECT COUNT(*) as count FROM user_exercise_results').get() as { count: number }).count;
  const avgWpmResult = db.prepare('SELECT AVG(wpm) as avg FROM user_exercise_results').get() as { avg: number | null };
  const totalRewards = (db.prepare('SELECT COUNT(*) as count FROM rewards').get() as { count: number }).count;
  const redeemedRewards = (db.prepare('SELECT COUNT(*) as count FROM user_rewards WHERE is_redeemed = 1').get() as { count: number }).count;

  return {
    totalUsers,
    activeUsers,
    totalExercises,
    completedExercises,
    averageWpm: Math.round(avgWpmResult.avg || 0),
    totalRewards,
    redeemedRewards,
  };
}

// Get weekly activity data
export function getWeeklyActivity(): WeeklyActivity[] {
  const db = getDatabase();
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  const results: WeeklyActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayResult = db.prepare(`
      SELECT COUNT(*) as count 
      FROM user_exercise_results 
      WHERE date(completed_at) = date("now", "-${i} days")
    `).get() as { count: number };
    
    const dayIndex = (new Date().getDay() + 6 - i) % 7;
    results.push({
      day: days[dayIndex],
      completions: dayResult.count,
    });
  }
  
  return results;
}

// Get exercise type distribution
export function getExerciseDistribution(): ExerciseDistribution[] {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT 
      type,
      COUNT(*) as count
    FROM exercises
    WHERE is_active = 1
    GROUP BY type
  `).all() as ExerciseDistribution[];
}
