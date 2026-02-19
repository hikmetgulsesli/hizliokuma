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

// Valid exercise content types
const VALID_TYPES = ["blok_okuma", "grup_okuma", "metin_arama", "golgeleme"];

// GET /api/exercise-content?type=X&limit=Y - Get random exercise content by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(
      10,
      Math.max(1, parseInt(searchParams.get("limit") || "1", 10))
    );

    // Validate type parameter
    if (!type) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Exercise type is required",
        400,
        [{ field: "type", message: "Type parameter is required" }]
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid exercise type",
        400,
        [{ 
          field: "type", 
          message: `Type must be one of: ${VALID_TYPES.join(", ")}` 
        }]
      );
    }

    const db = getDatabase();

    // Get random exercise content by type
    const content = db
      .prepare(`
        SELECT 
          id,
          type,
          content,
          difficulty,
          word_count,
          is_active,
          created_at,
          updated_at
        FROM exercise_content
        WHERE type = ? AND is_active = 1
        ORDER BY RANDOM()
        LIMIT ?
      `)
      .all(type, limit);

    if (!content || content.length === 0) {
      return errorResponse(
        "NOT_FOUND",
        `No exercise content found for type: ${type}`,
        404
      );
    }

    return successResponse(content, {
      type,
      count: content.length,
    });
  } catch (error) {
    console.error("Error fetching exercise content:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to fetch exercise content",
      500
    );
  }
}

// POST /api/exercise-content - Create new exercise content (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const errors: Array<{ field: string; message: string }> = [];

    // Validate type
    if (!body.type || typeof body.type !== "string") {
      errors.push({ field: "type", message: "Type is required and must be a string" });
    } else if (!VALID_TYPES.includes(body.type)) {
      errors.push({ 
        field: "type", 
        message: `Type must be one of: ${VALID_TYPES.join(", ")}` 
      });
    }

    // Validate content
    if (!body.content || typeof body.content !== "string" || body.content.trim().length === 0) {
      errors.push({ field: "content", message: "Content is required and must be a non-empty string" });
    }

    // Validate difficulty (optional, defaults to 'beginner')
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    const difficulty = body.difficulty || "beginner";
    if (!validDifficulties.includes(difficulty)) {
      errors.push({ 
        field: "difficulty", 
        message: `Difficulty must be one of: ${validDifficulties.join(", ")}` 
      });
    }

    if (errors.length > 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        errors
      );
    }

    // Calculate word count
    const wordCount = body.content.trim().split(/\s+/).length;

    const db = getDatabase();

    const result = db
      .prepare(`
        INSERT INTO exercise_content (type, content, difficulty, word_count, is_active)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(body.type, body.content.trim(), difficulty, wordCount, body.is_active !== false ? 1 : 0);

    if (!result.lastInsertRowid) {
      return errorResponse(
        "DATABASE_ERROR",
        "Failed to create exercise content",
        500
      );
    }

    // Fetch the created content
    const createdContent = db
      .prepare("SELECT * FROM exercise_content WHERE id = ?")
      .get(result.lastInsertRowid);

    return successResponse(createdContent);
  } catch (error) {
    console.error("Error creating exercise content:", error);
    return errorResponse(
      "DATABASE_ERROR",
      "Failed to create exercise content",
      500
    );
  }
}
