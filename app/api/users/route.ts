import { NextRequest } from 'next/server';
import { getUsers, createUser } from '@/lib/api/user-service';
import { validateCreateUser } from '@/lib/api/users';
import { createSuccessResponse, createErrorResponse, getPaginationParams } from '@/lib/api/response';
import { ValidationError } from '@/lib/api/errors';

// GET /api/users - List all users with pagination
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = getPaginationParams(searchParams);

    const { users, total } = getUsers(page, limit);

    const totalPages = Math.ceil(total / limit);

    return createSuccessResponse(users, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return createErrorResponse(error);
    }
    return createErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();

    let validatedInput;
    try {
      validatedInput = validateCreateUser(body);
    } catch (error) {
      if (error instanceof Error && 'details' in error) {
        throw new ValidationError('Validation failed', (error as Error & { details: Array<{ field: string; message: string }> }).details);
      }
      throw new ValidationError('Invalid input');
    }

    const user = createUser(validatedInput);

    return createSuccessResponse(user, 201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return createErrorResponse(error);
    }
    return createErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
  }
}
