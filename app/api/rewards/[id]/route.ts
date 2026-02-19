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

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/rewards/[id] - Get a single reward by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<RewardResponse | ErrorResponse>> {
  try {
    const { id } = params;
    const rewardId = parseInt(id, 10);

    if (isNaN(rewardId)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid reward ID',
          },
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const reward = db.prepare(`
      SELECT id, title, description, type, threshold, icon, created_at, updated_at
      FROM rewards
      WHERE id = ?
    `).get(rewardId) as Reward | undefined;

    if (!reward) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Reward with id ${rewardId} not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: reward });
  } catch (error) {
    console.error('Error fetching reward:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch reward',
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/rewards/[id] - Update a reward
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<RewardResponse | ErrorResponse>> {
  try {
    const { id } = params;
    const rewardId = parseInt(id, 10);

    if (isNaN(rewardId)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid reward ID',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, type, threshold, icon } = body;

    // Validation
    const errors: { field: string; message: string }[] = [];

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    }

    if (type !== undefined && (typeof type !== 'string' || type.trim().length === 0)) {
      errors.push({ field: 'type', message: 'Type cannot be empty' });
    }

    if (threshold !== undefined && (typeof threshold !== 'number' || threshold < 0)) {
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

    // Check if reward exists
    const existing = db.prepare('SELECT id FROM rewards WHERE id = ?').get(rewardId);
    if (!existing) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Reward with id ${rewardId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description?.trim() || null);
    }

    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type.trim());
    }

    if (threshold !== undefined) {
      updates.push('threshold = ?');
      values.push(threshold);
    }

    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon?.trim() || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No fields to update',
          },
        },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(rewardId);

    db.prepare(`
      UPDATE rewards
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    // Fetch and return updated reward
    const updated = db.prepare(`
      SELECT id, title, description, type, threshold, icon, created_at, updated_at
      FROM rewards
      WHERE id = ?
    `).get(rewardId) as Reward;

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating reward:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update reward',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/rewards/[id] - Delete a reward
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    const { id } = params;
    const rewardId = parseInt(id, 10);

    if (isNaN(rewardId)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid reward ID',
          },
        },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if reward exists
    const existing = db.prepare('SELECT id FROM rewards WHERE id = ?').get(rewardId);
    if (!existing) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Reward with id ${rewardId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Delete the reward (user_rewards will be cascade deleted)
    db.prepare('DELETE FROM rewards WHERE id = ?').run(rewardId);

    return NextResponse.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete reward',
        },
      },
      { status: 500 }
    );
  }
}
