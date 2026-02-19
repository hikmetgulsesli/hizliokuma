import { NextResponse } from "next/server";
import {
  getAnalyticsMetrics,
  getWeeklyActivity,
  getExerciseDistribution,
} from "@/lib/db/queries";

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

// GET /api/analytics - Get analytics data
export async function GET() {
  try {
    const metrics = getAnalyticsMetrics();
    const weeklyActivity = getWeeklyActivity();
    const exerciseDistribution = getExerciseDistribution();

    return successResponse({
      metrics,
      weeklyActivity,
      exerciseDistribution,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch analytics data",
      500
    );
  }
}
