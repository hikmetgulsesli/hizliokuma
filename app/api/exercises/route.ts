import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';

export interface Exercise {
  id: number;
  title: string;
  description: string | null;
  type: string;
  difficulty_levels: string;
  duration_minutes: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ExercisesResponse {
  data: Exercise[];
  meta: {
    total: number;
  };
}

export interface ExerciseUpdateResponse {
  data: Exercise;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

// GET /api/exercises - Get all exercises
export async function GET(): Promise<NextResponse<ExercisesResponse | ErrorResponse>> {
  try {
    const db = getDatabase();
    
    const exercises = db.prepare(`
      SELECT id, title, description, type, difficulty_levels, duration_minutes, is_active, created_at, updated_at
      FROM exercises
      ORDER BY created_at DESC
    `).all() as Exercise[];

    return NextResponse.json({
      data: exercises,
      meta: {
        total: exercises.length,
      },
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch exercises',
        },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/exercises/:id - Update exercise (toggle active status)
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ExerciseUpdateResponse | ErrorResponse>> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Exercise ID is required',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean' && typeof is_active !== 'number') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'is_active must be a boolean or number',
            details: [{ field: 'is_active', message: 'Invalid type' }],
          },
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Check if exercise exists
    const existing = db.prepare('SELECT id FROM exercises WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Exercise with id ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Update the exercise
    const isActiveValue = typeof is_active === 'boolean' ? (is_active ? 1 : 0) : is_active;
    
    db.prepare(`
      UPDATE exercises 
      SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(isActiveValue, id);

    // Fetch and return the updated exercise
    const updated = db.prepare(`
      SELECT id, title, description, type, difficulty_levels, duration_minutes, is_active, created_at, updated_at
      FROM exercises
      WHERE id = ?
    `).get(id) as Exercise;

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update exercise',
        },
      },
      { status: 500 }
    );
  }
}
