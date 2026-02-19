import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';

export interface UserReward {
  id: number;
  user_id: number;
  reward_id: number;
  earned_at: string;
  reward_title: string;
  reward_description: string | null;
  reward_type: string;
  reward_threshold: number;
  reward_icon: string | null;
}

export interface UserRewardsResponse {
  data: UserReward[];
  meta: {
    total: number;
    user_id: number;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/users/[id]/rewards - Get all rewards earned by a user
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UserRewardsResponse | ErrorResponse>> {
  try {
    const { id } = params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid user ID',
          },
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `User with id ${userId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Get user's earned rewards with reward details
    const userRewards = db.prepare(`
      SELECT 
        ur.id,
        ur.user_id,
        ur.reward_id,
        ur.earned_at,
        r.title as reward_title,
        r.description as reward_description,
        r.type as reward_type,
        r.threshold as reward_threshold,
        r.icon as reward_icon
      FROM user_rewards ur
      JOIN rewards r ON ur.reward_id = r.id
      WHERE ur.user_id = ?
      ORDER BY ur.earned_at DESC
    `).all(userId) as UserReward[];

    return NextResponse.json({
      data: userRewards,
      meta: {
        total: userRewards.length,
        user_id: userId,
      },
    });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user rewards',
        },
      },
      { status: 500 }
    );
  }
}
