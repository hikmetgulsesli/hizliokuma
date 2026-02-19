import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/connection";

// Error response helper
function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Array<{ field: string; message: string }>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

// Success response helper
function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      data,
      ...(meta && { meta }),
    },
    { status: 200 }
  );
}

// GET /api/exercises - Get all exercises with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Get total count
    const countResult = db.prepare("SELECT COUNT(*) as total FROM exercises").get() as {
      total: number;
    };
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Get exercises with pagination
    const exercises = db
      .prepare(
        `
        SELECT 
          id,
          title,
          description,
          type,
          difficulty_levels,
          duration_minutes,
          is_active,
          created_at,
          updated_at
        FROM exercises
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(limit, offset);

    return successResponse(exercises, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch exercises",
      500
    );
  }
}

// POST /api/exercises - Create new exercise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const errors: Array<{ field: string; message: string }> = [];

    // Validate required fields
    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      errors.push({ field: "title", message: "Title is required and must be a non-empty string" });
    }

    if (!body.type || typeof body.type !== "string" || body.type.trim().length === 0) {
      errors.push({ field: "type", message: "Type is required and must be a non-empty string" });
    }

    if (!body.difficulty_levels || typeof body.difficulty_levels !== "string" || body.difficulty_levels.trim().length === 0) {
      errors.push({ field: "difficulty_levels", message: "Difficulty levels is required and must be a non-empty string" });
    }

    // Validate optional fields
    if (body.duration_minutes !== undefined) {
      const duration = parseInt(body.duration_minutes, 10);
      if (isNaN(duration) || duration < 0) {
        errors.push({ field: "duration_minutes", message: "Duration must be a non-negative integer" });
      }
    }

    if (errors.length > 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        errors
      );
    }

    const db = getDatabase();

    // Insert new exercise
    const result = db
      .prepare(
        `
        INSERT INTO exercises (title, description, type, difficulty_levels, duration_minutes, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        body.title.trim(),
        body.description?.trim() || null,
        body.type.trim(),
        body.difficulty_levels.trim(),
        body.duration_minutes || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      );

    if (!result.lastInsertRowid) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to create exercise",
        500
      );
    }

    // Fetch the created exercise
    const exercise = db
      .prepare(
        `
        SELECT id, title, description, type, difficulty_levels, duration_minutes, is_active, created_at, updated_at
        FROM exercises
        WHERE id = ?
      `
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        data: exercise,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exercise:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to create exercise",
      500
    );
  }
}

// PATCH /api/exercises?id=X - Update exercise by ID
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Exercise ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const exerciseId = parseInt(id, 10);
    if (isNaN(exerciseId) || exerciseId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid exercise ID",
        400,
        [{ field: "id", message: "ID must be a positive integer" }]
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const errors: Array<{ field: string; message: string }> = [];

    // Validate and collect updates
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim().length === 0) {
        errors.push({ field: "title", message: "Title must be a non-empty string" });
      } else {
        updates.title = body.title.trim();
      }
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null;
    }

    if (body.type !== undefined) {
      if (typeof body.type !== "string" || body.type.trim().length === 0) {
        errors.push({ field: "type", message: "Type must be a non-empty string" });
      } else {
        updates.type = body.type.trim();
      }
    }

    if (body.difficulty_levels !== undefined) {
      if (typeof body.difficulty_levels !== "string" || body.difficulty_levels.trim().length === 0) {
        errors.push({ field: "difficulty_levels", message: "Difficulty levels must be a non-empty string" });
      } else {
        updates.difficulty_levels = body.difficulty_levels.trim();
      }
    }

    if (body.duration_minutes !== undefined) {
      const duration = parseInt(body.duration_minutes, 10);
      if (isNaN(duration) || duration < 0) {
        errors.push({ field: "duration_minutes", message: "Duration must be a non-negative integer" });
      } else {
        updates.duration_minutes = duration;
      }
    }

    if (body.is_active !== undefined) {
      updates.is_active = body.is_active ? 1 : 0;
    }

    if (errors.length > 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        errors
      );
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "No valid fields to update",
        400,
        [{ field: "body", message: "At least one field must be provided" }]
      );
    }

    const db = getDatabase();

    // Check if exercise exists
    const existingExercise = db
      .prepare("SELECT id FROM exercises WHERE id = ?")
      .get(exerciseId);

    if (!existingExercise) {
      return errorResponse(
        "NOT_FOUND",
        `Exercise with id ${exerciseId} not found`,
        404
      );
    }

    // Build update query
    const positionalParams: (string | number | null)[] = [];
    Object.keys(updates).forEach((key) => {
      positionalParams.push(updates[key] as string | number | null);
    });
    positionalParams.push(exerciseId);

    const updatedExercise = db
      .prepare(
        `
        UPDATE exercises 
        SET ${Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .run(...positionalParams);

    if (updatedExercise.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to update exercise",
        500
      );
    }

    // Fetch the updated exercise
    const exercise = db
      .prepare(
        `
        SELECT id, title, description, type, difficulty_levels, duration_minutes, is_active, created_at, updated_at
        FROM exercises
        WHERE id = ?
      `
      )
      .get(exerciseId);

    return successResponse(exercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to update exercise",
      500
    );
  }
}

// DELETE /api/exercises?id=X - Delete exercise by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Exercise ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const exerciseId = parseInt(id, 10);
    if (isNaN(exerciseId) || exerciseId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid exercise ID",
        400,
        [{ field: "id", message: "ID must be a positive integer" }]
      );
    }

    const db = getDatabase();

    // Check if exercise exists
    const existingExercise = db
      .prepare("SELECT id FROM exercises WHERE id = ?")
      .get(exerciseId);

    if (!existingExercise) {
      return errorResponse(
        "NOT_FOUND",
        `Exercise with id ${exerciseId} not found`,
        404
      );
    }

    // Delete exercise (cascading deletes will handle related records)
    const result = db.prepare("DELETE FROM exercises WHERE id = ?").run(exerciseId);

    if (result.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to delete exercise",
        500
      );
    }

    return successResponse({
      message: "Exercise deleted successfully",
      deletedId: exerciseId,
    });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to delete exercise",
      500
    );
  }
}
