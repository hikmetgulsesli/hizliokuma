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

// Valid reward types
const VALID_REWARD_TYPES = ["points", "medal", "streak"] as const;
type RewardType = typeof VALID_REWARD_TYPES[number];

// GET /api/rewards - Get all rewards with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const offset = (page - 1) * limit;
    const type = searchParams.get("type") as RewardType | null;

    const db = getDatabase();

    // Build query conditions
    let countQuery = "SELECT COUNT(*) as total FROM rewards";
    let listQuery = `
      SELECT 
        id,
        title,
        description,
        type,
        threshold,
        icon,
        created_at,
        updated_at
      FROM rewards
    `;
    const queryParams: (string | number)[] = [];

    if (type && VALID_REWARD_TYPES.includes(type)) {
      countQuery += " WHERE type = ?";
      listQuery += " WHERE type = ?";
      queryParams.push(type);
    }

    listQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    // Get total count
    const countResult = db
      .prepare(countQuery)
      .get(...(type ? [type] : [])) as { total: number };
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Get rewards with pagination
    const rewards = db
      .prepare(listQuery)
      .all(...queryParams, limit, offset);

    return successResponse(rewards, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch rewards",
      500
    );
  }
}

// POST /api/rewards - Create a new reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const errors: Array<{ field: string; message: string }> = [];

    // Validate title
    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      errors.push({ field: "title", message: "Title is required and must be a non-empty string" });
    }

    // Validate type
    if (!body.type || !VALID_REWARD_TYPES.includes(body.type as RewardType)) {
      errors.push({ 
        field: "type", 
        message: `Type must be one of: ${VALID_REWARD_TYPES.join(", ")}` 
      });
    }

    // Validate threshold
    const threshold = parseInt(body.threshold, 10);
    if (isNaN(threshold) || threshold < 0) {
      errors.push({ field: "threshold", message: "Threshold must be a non-negative integer" });
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

    // Insert new reward
    const result = db
      .prepare(
        `
        INSERT INTO rewards (title, description, type, threshold, icon)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .run(
        body.title.trim(),
        body.description?.trim() || null,
        body.type,
        threshold,
        body.icon?.trim() || null
      );

    if (!result.lastInsertRowid) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to create reward",
        500
      );
    }

    // Fetch the created reward
    const reward = db
      .prepare(
        `
        SELECT id, title, description, type, threshold, icon, created_at, updated_at
        FROM rewards
        WHERE id = ?
      `
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(
      { data: reward },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reward:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to create reward",
      500
    );
  }
}

// PATCH /api/rewards?id=X - Update reward by ID
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Reward ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const rewardId = parseInt(id, 10);
    if (isNaN(rewardId) || rewardId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid reward ID",
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
      if (!VALID_REWARD_TYPES.includes(body.type as RewardType)) {
        errors.push({ 
          field: "type", 
          message: `Type must be one of: ${VALID_REWARD_TYPES.join(", ")}` 
        });
      } else {
        updates.type = body.type;
      }
    }

    if (body.threshold !== undefined) {
      const threshold = parseInt(body.threshold, 10);
      if (isNaN(threshold) || threshold < 0) {
        errors.push({ field: "threshold", message: "Threshold must be a non-negative integer" });
      } else {
        updates.threshold = threshold;
      }
    }

    if (body.icon !== undefined) {
      updates.icon = body.icon?.trim() || null;
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

    // Check if reward exists
    const existingReward = db
      .prepare("SELECT id FROM rewards WHERE id = ?")
      .get(rewardId);

    if (!existingReward) {
      return errorResponse(
        "NOT_FOUND",
        `Reward with id ${rewardId} not found`,
        404
      );
    }

    // Build update query
    const positionalParams: (string | number | null)[] = [];
    Object.keys(updates).forEach((key) => {
      positionalParams.push(updates[key] as string | number | null);
    });
    positionalParams.push(rewardId);

    const updateResult = db
      .prepare(
        `
        UPDATE rewards 
        SET ${Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .run(...positionalParams);

    if (updateResult.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to update reward",
        500
      );
    }

    // Fetch the updated reward
    const reward = db
      .prepare(
        `
        SELECT id, title, description, type, threshold, icon, created_at, updated_at
        FROM rewards
        WHERE id = ?
      `
      )
      .get(rewardId);

    return successResponse(reward);
  } catch (error) {
    console.error("Error updating reward:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to update reward",
      500
    );
  }
}

// DELETE /api/rewards?id=X - Delete reward by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Reward ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const rewardId = parseInt(id, 10);
    if (isNaN(rewardId) || rewardId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid reward ID",
        400,
        [{ field: "id", message: "ID must be a positive integer" }]
      );
    }

    const db = getDatabase();

    // Check if reward exists
    const existingReward = db
      .prepare("SELECT id FROM rewards WHERE id = ?")
      .get(rewardId);

    if (!existingReward) {
      return errorResponse(
        "NOT_FOUND",
        `Reward with id ${rewardId} not found`,
        404
      );
    }

    // Delete reward (cascading deletes will handle related user_rewards)
    const result = db.prepare("DELETE FROM rewards WHERE id = ?").run(rewardId);

    if (result.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to delete reward",
        500
      );
    }

    return successResponse({
      message: "Reward deleted successfully",
      deletedId: rewardId,
    });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to delete reward",
      500
    );
  }
}
