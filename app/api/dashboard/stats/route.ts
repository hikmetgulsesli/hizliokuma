import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/connection";
import {
  getDashboardStats,
  getRecentActivities,
  getPopularExercises,
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

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const stats = getDashboardStats();
    const recentActivities = getRecentActivities(5);
    const popularExercises = getPopularExercises(4);

    return successResponse({
      stats,
      recentActivities,
      popularExercises,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch dashboard statistics",
      500
    );
  }
}
