import { getDatabase } from './db/connection';

export interface StreakInfo {
  currentStreak: number;
  lastExerciseDate: string | null;
  streakBroken: boolean;
  daysSinceLastExercise: number;
}

export interface RewardBadge {
  id: number;
  title: string;
  description: string;
  type: string;
  threshold: number;
  icon: string | null;
  earnedAt: string | null;
  isEarned: boolean;
}

export interface StreakReward {
  days: number;
  badgeId: number;
  title: string;
  description: string;
  icon: string;
}

// Streak milestone rewards (badges for streak days)
export const STREAK_REWARDS: StreakReward[] = [
  { days: 5, badgeId: 101, title: '5 Gün Streak', description: '5 gün üst üste egzersiz', icon: 'flame' },
  { days: 10, badgeId: 102, title: '10 Gün Streak', description: '10 gün üst üste egzersiz', icon: 'flame' },
  { days: 15, badgeId: 103, title: '15 Gün Streak', description: '15 gün üst üste egzersiz', icon: 'flame' },
  { days: 20, badgeId: 104, title: '20 Gün Streak', description: '20 gün üst üste egzersiz', icon: 'flame' },
  { days: 30, badgeId: 105, title: '30 Gün Streak', description: '30 gün üst üste egzersiz', icon: 'flame' },
];

/**
 * Get streak information for a user
 * Calculates current streak based on consecutive daily exercise completions
 */
export function getUserStreak(userId: number): StreakInfo {
  const db = getDatabase();

  // Get the most recent exercise completion date
  const lastResult = db.prepare(`
    SELECT date(completed_at) as completion_date
    FROM user_exercise_results
    WHERE user_id = ?
    ORDER BY completed_at DESC
    LIMIT 1
  `).get(userId) as { completion_date: string } | undefined;

  if (!lastResult) {
    return {
      currentStreak: 0,
      lastExerciseDate: null,
      streakBroken: false,
      daysSinceLastExercise: 0,
    };
  }

  const lastExerciseDate = lastResult.completion_date;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calculate days since last exercise
  const lastDate = new Date(lastExerciseDate);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const daysSinceLastExercise = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Check if streak is broken (more than 1 day gap)
  const streakBroken = daysSinceLastExercise > 1;

  // Calculate current streak
  let currentStreak = 0;

  if (!streakBroken) {
    // Count consecutive days with exercises
    const results = db.prepare(`
      SELECT DISTINCT date(completed_at) as completion_date
      FROM user_exercise_results
      WHERE user_id = ?
      ORDER BY completion_date DESC
    `).all(userId) as Array<{ completion_date: string }>;

    if (results.length === 0) {
      currentStreak = 0;
    } else {
      // Check if user exercised today or yesterday to maintain streak
      const mostRecentDate = results[0].completion_date;
      const canContinueStreak = mostRecentDate === today || mostRecentDate === yesterday;

      if (canContinueStreak) {
        currentStreak = 1; // At least today or yesterday

        // Count consecutive days going backwards
        for (let i = 1; i < results.length; i++) {
          const currentDate = new Date(results[i - 1].completion_date);
          const prevDate = new Date(results[i].completion_date);
          const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }
  }

  return {
    currentStreak,
    lastExerciseDate,
    streakBroken,
    daysSinceLastExercise,
  };
}

/**
 * Update user's streak_days in the database
 * Call this after an exercise is completed
 */
export function updateUserStreak(userId: number): number {
  const db = getDatabase();
  const streakInfo = getUserStreak(userId);

  db.prepare(`
    UPDATE users
    SET streak_days = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(streakInfo.currentStreak, userId);

  return streakInfo.currentStreak;
}

/**
 * Reset streak if user missed a day
 * Call this when checking user status
 */
export function resetStreakIfBroken(userId: number): boolean {
  const db = getDatabase();
  const streakInfo = getUserStreak(userId);

  if (streakInfo.streakBroken && streakInfo.currentStreak === 0) {
    // Get current streak from database
    const user = db.prepare('SELECT streak_days FROM users WHERE id = ?').get(userId) as { streak_days: number } | undefined;

    if (user && user.streak_days > 0) {
      // Reset streak to 0
      db.prepare(`
        UPDATE users
        SET streak_days = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(userId);
      return true; // Streak was reset
    }
  }

  return false; // No reset needed
}

/**
 * Check and award streak rewards for a user
 * Returns list of newly awarded rewards
 */
export function checkAndAwardStreakRewards(userId: number): StreakReward[] {
  const db = getDatabase();
  const streakInfo = getUserStreak(userId);
  const newlyAwarded: StreakReward[] = [];

  // Ensure streak_days is up to date
  updateUserStreak(userId);

  // Check each streak milestone
  for (const reward of STREAK_REWARDS) {
    if (streakInfo.currentStreak >= reward.days) {
      // Check if user already has this reward
      const existingReward = db.prepare(`
        SELECT id FROM user_rewards
        WHERE user_id = ? AND reward_id = ?
      `).get(userId, reward.badgeId);

      if (!existingReward) {
        // Check if reward exists in rewards table, if not create it
        const rewardExists = db.prepare('SELECT id FROM rewards WHERE id = ?').get(reward.badgeId);

        if (!rewardExists) {
          // Create the streak reward in rewards table
          db.prepare(`
            INSERT INTO rewards (id, title, description, type, threshold, icon)
            VALUES (?, ?, ?, 'streak_badge', ?, ?)
          `).run(reward.badgeId, reward.title, reward.description, reward.days, reward.icon);
        }

        // Award the reward to user
        db.prepare(`
          INSERT INTO user_rewards (user_id, reward_id, earned_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `).run(userId, reward.badgeId);

        newlyAwarded.push(reward);
      }
    }
  }

  return newlyAwarded;
}

/**
 * Get all rewards/badges for a user including streak badges
 */
export function getUserRewardsWithStreakBadges(userId: number): RewardBadge[] {
  const db = getDatabase();

  // Get regular rewards
  const regularRewards = db.prepare(`
    SELECT 
      r.id,
      r.title,
      r.description,
      r.type,
      r.threshold,
      r.icon,
      ur.earned_at as earnedAt,
      1 as isEarned
    FROM rewards r
    JOIN user_rewards ur ON r.id = ur.reward_id
    WHERE ur.user_id = ?
    ORDER BY ur.earned_at DESC
  `).all(userId) as RewardBadge[];

  // Get all possible streak badges with earned status
  const streakBadges: RewardBadge[] = STREAK_REWARDS.map(reward => {
    const earned = regularRewards.find(r => r.id === reward.badgeId);
    return {
      id: reward.badgeId,
      title: reward.title,
      description: reward.description,
      type: 'streak_badge',
      threshold: reward.days,
      icon: reward.icon,
      earnedAt: earned?.earnedAt || null,
      isEarned: !!earned,
    };
  });

  // Combine and return
  return [...regularRewards, ...streakBadges.filter(sb => !regularRewards.find(r => r.id === sb.id))];
}

/**
 * Record exercise completion and update streak
 * Call this when a user completes an exercise
 */
export function recordExerciseCompletion(
  userId: number,
  exerciseId: number,
  score: number,
  wpm: number
): { streak: number; newRewards: StreakReward[] } {
  const db = getDatabase();

  // Insert exercise result
  db.prepare(`
    INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm, completed_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(userId, exerciseId, score, wpm);

  // Update user's total points
  db.prepare(`
    UPDATE users
    SET points = points + ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(score, userId);

  // Update streak
  const newStreak = updateUserStreak(userId);

  // Check and award streak rewards
  const newRewards = checkAndAwardStreakRewards(userId);

  return {
    streak: newStreak,
    newRewards,
  };
}

/**
 * Get user's streak history (last 30 days)
 */
export function getStreakHistory(userId: number, days: number = 30): Array<{ date: string; exercised: boolean }> {
  const db = getDatabase();

  // Get all exercise dates in the last N days
  const results = db.prepare(`
    SELECT DISTINCT date(completed_at) as completion_date
    FROM user_exercise_results
    WHERE user_id = ? AND completed_at >= date('now', '-${days} days')
    ORDER BY completion_date DESC
  `).all(userId) as Array<{ completion_date: string }>;

  const exerciseDates = new Set(results.map(r => r.completion_date));

  // Build history array
  const history: Array<{ date: string; exercised: boolean }> = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    history.push({
      date: dateStr,
      exercised: exerciseDates.has(dateStr),
    });
  }

  return history.reverse();
}
