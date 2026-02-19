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

// GET /api/users - Get all users with pagination
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
    const countResult = db.prepare("SELECT COUNT(*) as total FROM users").get() as {
      total: number;
    };
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Get users with pagination
    const users = db
      .prepare(
        `
        SELECT 
          id,
          name,
          email,
          level,
          points,
          streak_days,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(limit, offset);

    return successResponse(users, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch users",
      500
    );
  }
}

// PATCH /api/users?id=X - Update user by ID
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "User ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid user ID",
        400,
        [{ field: "id", message: "ID must be a positive integer" }]
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const errors: Array<{ field: string; message: string }> = [];

    // Validate and collect updates
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        errors.push({ field: "name", message: "Name must be a non-empty string" });
      } else {
        updates.name = body.name.trim();
      }
    }

    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof body.email !== "string" || !emailRegex.test(body.email)) {
        errors.push({ field: "email", message: "Invalid email format" });
      } else {
        updates.email = body.email.trim().toLowerCase();
      }
    }

    if (body.level !== undefined) {
      const level = parseInt(body.level, 10);
      if (isNaN(level) || level < 1) {
        errors.push({ field: "level", message: "Level must be a positive integer" });
      } else {
        updates.level = level;
      }
    }

    if (body.points !== undefined) {
      const points = parseInt(body.points, 10);
      if (isNaN(points) || points < 0) {
        errors.push({ field: "points", message: "Points must be a non-negative integer" });
      } else {
        updates.points = points;
      }
    }

    if (body.streak_days !== undefined) {
      const streakDays = parseInt(body.streak_days, 10);
      if (isNaN(streakDays) || streakDays < 0) {
        errors.push({ field: "streak_days", message: "Streak days must be a non-negative integer" });
      } else {
        updates.streak_days = streakDays;
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

    if (Object.keys(updates).length === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "No valid fields to update",
        400,
        [{ field: "body", message: "At least one field must be provided" }]
      );
    }

    const db = getDatabase();

    // Check if user exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userId);

    if (!existingUser) {
      return errorResponse(
        "NOT_FOUND",
        `User with id ${userId} not found`,
        404
      );
    }

    // Check for email uniqueness if email is being updated
    if (updates.email) {
      const emailExists = db
        .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
        .get(updates.email, userId);

      if (emailExists) {
        return errorResponse(
          "CONFLICT",
          "Email already in use",
          409,
          [{ field: "email", message: "This email is already registered" }]
        );
      }
    }

    // Build update query Convert to positional parameters for better-sqlite3
    const positionalParams: (string | number)[] = [];
    Object.keys(updates).forEach((key) => {
      positionalParams.push(updates[key] as string | number);
    });
    positionalParams.push(userId);

    const updatedUser = db
      .prepare(
        `
        UPDATE users 
        SET ${Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .run(...positionalParams);

    if (updatedUser.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to update user",
        500
      );
    }

    // Fetch the updated user
    const user = db
      .prepare(
        `
        SELECT id, name, email, level, points, streak_days, created_at, updated_at
        FROM users
        WHERE id = ?
      `
      )
      .get(userId);

    return successResponse(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to update user",
      500
    );
  }
}

// DELETE /api/users?id=X - Delete user by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "User ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid user ID",
        400,
        [{ field: "id", message: "ID must be a positive integer" }]
      );
    }

    const db = getDatabase();

    // Check if user exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE id = ?")
      .get(userId);

    if (!existingUser) {
      return errorResponse(
        "NOT_FOUND",
        `User with id ${userId} not found`,
        404
      );
    }

    // Delete user (cascading deletes will handle related records)
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(userId);

    if (result.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to delete user",
        500
      );
    }

    return successResponse({
      message: "User deleted successfully",
      deletedId: userId,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to delete user",
      500
    );
  }
}
