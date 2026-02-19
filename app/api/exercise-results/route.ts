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

// GET /api/exercise-results?userId=X&limit=N - Get exercise results for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!userId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "User ID is required",
        400,
        [{ field: "userId", message: "userId parameter is required" }]
      );
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid user ID",
        400,
        [{ field: "userId", message: "userId must be a positive integer" }]
      );
    }

    const db = getDatabase();

    // Check if user exists
    const userExists = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userIdNum);

    if (!userExists) {
      return errorResponse(
        "NOT_FOUND",
        `User with id ${userIdNum} not found`,
        404
      );
    }

    // Get total count
    const countResult = db
      .prepare("SELECT COUNT(*) as count FROM user_exercise_results WHERE user_id = ?")
      .get(userIdNum) as { count: number };

    // Get exercise results with exercise titles
    const results = db
      .prepare(
        `
        SELECT 
          uer.id,
          e.title as exercise_title,
          uer.score,
          uer.wpm,
          uer.completed_at
        FROM user_exercise_results uer
        JOIN exercises e ON uer.exercise_id = e.id
        WHERE uer.user_id = ?
        ORDER BY uer.completed_at DESC
        LIMIT ?
      `
      )
      .all(userIdNum, limit);

    return successResponse(results, {
      total: countResult.count,
      limit,
    });
  } catch (error) {
    console.error("Error fetching exercise results:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch exercise results",
      500
    );
  }
}

// POST /api/exercise-results - Record a new exercise result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const errors: Array<{ field: string; message: string }> = [];

    // Validate userId
    if (!body.userId) {
      errors.push({ field: "userId", message: "userId is required" });
    } else {
      const userIdNum = parseInt(body.userId, 10);
      if (isNaN(userIdNum) || userIdNum <= 0) {
        errors.push({ field: "userId", message: "userId must be a positive integer" });
      }
    }

    // Validate exerciseId
    if (!body.exerciseId) {
      errors.push({ field: "exerciseId", message: "exerciseId is required" });
    } else {
      const exerciseIdNum = parseInt(body.exerciseId, 10);
      if (isNaN(exerciseIdNum) || exerciseIdNum <= 0) {
        errors.push({ field: "exerciseId", message: "exerciseId must be a positive integer" });
      }
    }

    // Validate score
    if (body.score === undefined || body.score === null) {
      errors.push({ field: "score", message: "score is required" });
    } else {
      const scoreNum = parseInt(body.score, 10);
      if (isNaN(scoreNum) || scoreNum < 0) {
        errors.push({ field: "score", message: "score must be a non-negative integer" });
      }
    }

    // Validate wpm
    if (body.wpm === undefined || body.wpm === null) {
      errors.push({ field: "wpm", message: "wpm is required" });
    } else {
      const wpmNum = parseInt(body.wpm, 10);
      if (isNaN(wpmNum) || wpmNum < 0) {
        errors.push({ field: "wpm", message: "wpm must be a non-negative integer" });
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

    const userId = parseInt(body.userId, 10);
    const exerciseId = parseInt(body.exerciseId, 10);
    const score = parseInt(body.score, 10);
    const wpm = parseInt(body.wpm, 10);

    const db = getDatabase();

    // Check if user exists
    const userExists = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userId);

    if (!userExists) {
      return errorResponse(
        "NOT_FOUND",
        `User with id ${userId} not found`,
        404
      );
    }

    // Check if exercise exists
    const exerciseExists = db
      .prepare("SELECT id FROM exercises WHERE id = ?")
      .get(exerciseId);

    if (!exerciseExists) {
      return errorResponse(
        "NOT_FOUND",
        `Exercise with id ${exerciseId} not found`,
        404
      );
    }

    // Insert exercise result
    const result = db
      .prepare(
        `
        INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm, completed_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `
      )
      .run(userId, exerciseId, score, wpm);

    if (!result.lastInsertRowid) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to record exercise result",
        500
      );
    }

    // Update user points
    db.prepare(`
      UPDATE users
      SET points = points + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(score, userId);

    // Fetch the recorded result with exercise title
    const recordedResult = db
      .prepare(
        `
        SELECT 
          uer.id,
          e.title as exercise_title,
          uer.score,
          uer.wpm,
          uer.completed_at
        FROM user_exercise_results uer
        JOIN exercises e ON uer.exercise_id = e.id
        WHERE uer.id = ?
      `
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(
      { data: recordedResult },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording exercise result:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to record exercise result",
      500
    );
  }
}
