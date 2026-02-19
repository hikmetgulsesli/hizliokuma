import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';

export interface Reward {
  id: number;
  title: string;
  description: string | null;
  type: string;
  threshold: number;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardsResponse {
  data: Reward[];
  meta: {
    total: number;
  };
}

export interface RewardResponse {
  data: Reward;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

// GET /api/rewards - Get all rewards
export async function GET(): Promise<NextResponse<RewardsResponse | ErrorResponse>> {
  try {
    const db = getDatabase();

    const rewards = db.prepare(`
      SELECT id, title, description, type, threshold, icon, created_at, updated_at
      FROM rewards
      ORDER BY threshold ASC, created_at DESC
    `).all() as Reward[];

    return NextResponse.json({
      data: rewards,
      meta: {
        total: rewards.length,
      },
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch rewards',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/rewards - Create a new reward
export async function POST(
  request: NextRequest
): Promise<NextResponse<RewardResponse | ErrorResponse>> {
  try {
    const body = await request.json();
    const { title, description, type, threshold, icon } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    }

    if (!type || typeof type !== 'string' || type.trim().length === 0) {
      errors.push({ field: 'type', message: 'Type is required' });
    }

    if (typeof threshold !== 'number' || threshold < 0) {
      errors.push({ field: 'threshold', message: 'Threshold must be a non-negative number' });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
          },
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const result = db.prepare(`
      INSERT INTO rewards (title, description, type, threshold, icon)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      title.trim(),
      description?.trim() || null,
      type.trim(),
      threshold,
      icon?.trim() || null
    );

    const newReward = db.prepare(`
      SELECT id, title, description, type, threshold, icon, created_at, updated_at
      FROM rewards
      WHERE id = ?
    `).get(result.lastInsertRowid) as Reward;

    return NextResponse.json({ data: newReward }, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create reward',
        },
      },
      { status: 500 }
    );
  }
}
