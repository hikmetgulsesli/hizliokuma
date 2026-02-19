import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/db/connection';

// GET /api/users/me - Get current user profile
async function getCurrentUser(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const userId = req.user.id;

    // Get user data with streak_days
    const user = db.prepare(`
      SELECT id, name, email, level, points, streak_days, created_at
      FROM users
      WHERE id = ?
    `).get(userId) as {
      id: number;
      name: string;
      email: string;
      level: number;
      points: number;
      streak_days: number;
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Get total exercises completed
    const exerciseCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM user_exercise_results
      WHERE user_id = ?
    `).get(userId) as { count: number };

    // Get exercise history summary (last 10)
    const exerciseHistory = db.prepare(`
      SELECT 
        e.title as exercise_type,
        uer.score,
        uer.wpm,
        uer.completed_at
      FROM user_exercise_results uer
      JOIN exercises e ON uer.exercise_id = e.id
      WHERE uer.user_id = ?
      ORDER BY uer.completed_at DESC
      LIMIT 10
    `).all(userId) as Array<{
      exercise_type: string;
      score: number;
      wpm: number;
      completed_at: string;
    }>;

    // Get user rewards/medals
    const rewards = db.prepare(`
      SELECT 
        r.type,
        COUNT(*) as count
      FROM user_rewards ur
      JOIN rewards r ON ur.reward_id = r.id
      WHERE ur.user_id = ?
      GROUP BY r.type
    `).all(userId) as Array<{
      type: string;
      count: number;
    }>;

    // Calculate achievements
    const achievements = [];
    
    if (user.streak_days >= 7) {
      achievements.push({
        id: 'streak-7',
        title: '7 Gün Streak',
        description: '7 gün üst üste egzersiz',
        icon: 'flame',
        unlocked: true,
      });
    }
    
    if (user.points >= 100) {
      achievements.push({
        id: 'points-100',
        title: '100 Puan',
        description: 'İlk 100 puan',
        icon: 'star',
        unlocked: true,
      });
    }
    
    if (exerciseCount.count >= 10) {
      achievements.push({
        id: 'exercises-10',
        title: '10 Egzersiz',
        description: '10 egzersiz tamamla',
        icon: 'target',
        unlocked: true,
      });
    }

    // Format exercise history for display
    const formattedHistory = exerciseHistory.map(item => {
      const date = new Date(item.completed_at);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let dateLabel: string;
      if (diffDays === 0) {
        dateLabel = 'Bugün';
      } else if (diffDays === 1) {
        dateLabel = 'Dün';
      } else if (diffDays < 7) {
        dateLabel = `${diffDays} gün önce`;
      } else {
        dateLabel = date.toLocaleDateString('tr-TR');
      }

      return {
        type: item.exercise_type,
        score: item.score,
        wpm: item.wpm,
        date: dateLabel,
      };
    });

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        points: user.points,
        streakDays: user.streak_days,
        totalExercises: exerciseCount.count,
        joinedDate: new Date(user.created_at).toLocaleDateString('tr-TR'),
        exerciseHistory: formattedHistory,
        rewards: rewards.map(r => ({
          type: r.type,
          count: r.count,
        })),
        achievements,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user profile',
        },
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getCurrentUser);
