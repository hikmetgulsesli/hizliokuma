import { NextResponse } from "next/server";
import { getLeaderboard, LeaderboardEntry } from "@/lib/db/queries";

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

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");

    // Default limit is 20, allow custom limit via query param
    let limit = 20;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
        limit = parsedLimit;
      } else if (parsedLimit > 100) {
        limit = 100; // Cap at 100 to prevent abuse
      }
    }

    const leaderboard = getLeaderboard(limit);

    return successResponse(leaderboard, {
      limit,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Puan tablosu verileri alınırken bir hata oluştu",
      500
    );
  }
}
