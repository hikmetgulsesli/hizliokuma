import { NextRequest, NextResponse } from "next/server";
import {
  getUserStreak,
  updateUserStreak,
  resetStreakIfBroken,
  checkAndAwardStreakRewards,
  getUserRewardsWithStreakBadges,
  getStreakHistory,
  STREAK_REWARDS,
} from "@/lib/streak-rewards";

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

// GET /api/users/streak?userId=X - Get user's streak information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const includeHistory = searchParams.get("history") === "true";

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

    // Check and reset streak if broken
    const wasReset = resetStreakIfBroken(userIdNum);

    // Get streak info
    const streakInfo = getUserStreak(userIdNum);

    // Get rewards with streak badges
    const rewards = getUserRewardsWithStreakBadges(userIdNum);

    // Get streak history if requested
    const history = includeHistory ? getStreakHistory(userIdNum) : undefined;

    return successResponse({
      streak: {
        ...streakInfo,
        wasReset,
      },
      rewards,
      availableRewards: STREAK_REWARDS,
      ...(history && { history }),
    });
  } catch (error) {
    console.error("Error fetching user streak:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch user streak information",
      500
    );
  }
}

// POST /api/users/streak - Update streak after exercise completion
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

    if (errors.length > 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        errors
      );
    }

    const userId = parseInt(body.userId, 10);

    // Update streak
    const newStreak = updateUserStreak(userId);

    // Check and award streak rewards
    const newRewards = checkAndAwardStreakRewards(userId);

    return NextResponse.json(
      {
        data: {
          streak: newStreak,
          newRewards,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user streak:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to update user streak",
      500
    );
  }
}
