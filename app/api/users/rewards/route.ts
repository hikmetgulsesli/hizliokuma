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

// GET /api/users/rewards?userId=X - Get earned rewards for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

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

    // Get earned rewards for the user
    const rewards = db
      .prepare(
        `
        SELECT 
          r.id,
          r.title,
          r.description,
          r.type,
          r.threshold,
          r.icon,
          ur.earned_at
        FROM user_rewards ur
        JOIN rewards r ON ur.reward_id = r.id
        WHERE ur.user_id = ?
        ORDER BY ur.earned_at DESC
      `
      )
      .all(userIdNum);

    return successResponse(rewards);
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch user rewards",
      500
    );
  }
}

// POST /api/users/rewards - Award a reward to a user
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

    // Validate rewardId
    if (!body.rewardId) {
      errors.push({ field: "rewardId", message: "rewardId is required" });
    } else {
      const rewardIdNum = parseInt(body.rewardId, 10);
      if (isNaN(rewardIdNum) || rewardIdNum <= 0) {
        errors.push({ field: "rewardId", message: "rewardId must be a positive integer" });
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
    const rewardId = parseInt(body.rewardId, 10);

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

    // Check if reward exists
    const rewardExists = db
      .prepare("SELECT id FROM rewards WHERE id = ?")
      .get(rewardId);

    if (!rewardExists) {
      return errorResponse(
        "NOT_FOUND",
        `Reward with id ${rewardId} not found`,
        404
      );
    }

    // Check if user already has this reward
    const existingAward = db
      .prepare("SELECT id FROM user_rewards WHERE user_id = ? AND reward_id = ?")
      .get(userId, rewardId);

    if (existingAward) {
      return errorResponse(
        "CONFLICT",
        "User already has this reward",
        409,
        [{ field: "rewardId", message: "This reward has already been awarded to the user" }]
      );
    }

    // Award the reward
    const result = db
      .prepare(
        `
        INSERT INTO user_rewards (user_id, reward_id)
        VALUES (?, ?)
      `
      )
      .run(userId, rewardId);

    if (!result.lastInsertRowid) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to award reward",
        500
      );
    }

    // Fetch the awarded reward with details
    const awardedReward = db
      .prepare(
        `
        SELECT 
          r.id,
          r.title,
          r.description,
          r.type,
          r.threshold,
          r.icon,
          ur.earned_at
        FROM user_rewards ur
        JOIN rewards r ON ur.reward_id = r.id
        WHERE ur.id = ?
      `
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(
      { data: awardedReward },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error awarding reward:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to award reward",
      500
    );
  }
}

// DELETE /api/users/rewards?id=X - Remove a reward from a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(
        "VALIDATION_ERROR",
        "User reward ID is required",
        400,
        [{ field: "id", message: "ID parameter is required" }]
      );
    }

    const userRewardId = parseInt(id, 10);
    if (isNaN(userRewardId) || userRewardId <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid user reward ID",
        400,
        [{ field: "id", message: "ID must be a positive integer" }]
      );
    }

    const db = getDatabase();

    // Check if user reward exists
    const existingUserReward = db
      .prepare("SELECT id FROM user_rewards WHERE id = ?")
      .get(userRewardId);

    if (!existingUserReward) {
      return errorResponse(
        "NOT_FOUND",
        `User reward with id ${userRewardId} not found`,
        404
      );
    }

    // Delete user reward
    const result = db
      .prepare("DELETE FROM user_rewards WHERE id = ?")
      .run(userRewardId);

    if (result.changes === 0) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to remove user reward",
        500
      );
    }

    return successResponse({
      message: "User reward removed successfully",
      deletedId: userRewardId,
    });
  } catch (error) {
    console.error("Error removing user reward:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to remove user reward",
      500
    );
  }
}
