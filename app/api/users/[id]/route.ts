import { NextRequest } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/api/user-service';
import { validateUpdateUser } from '@/lib/api/users';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { ValidationError, NotFoundError } from '@/lib/api/errors';

// GET /api/users/[id] - Get a single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID', [{ field: 'id', message: 'ID must be a number' }]);
    }

    const user = getUserById(userId);

    return createSuccessResponse(user);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return createErrorResponse(error);
    }
    return createErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID', [{ field: 'id', message: 'ID must be a number' }]);
    }

    const body = await request.json();

    let validatedInput;
    try {
      validatedInput = validateUpdateUser(body);
    } catch (error) {
      if (error instanceof Error && 'details' in error) {
        throw new ValidationError('Validation failed', (error as Error & { details: Array<{ field: string; message: string }> }).details);
      }
      throw new ValidationError('Invalid input');
    }

    const user = updateUser(userId, validatedInput);

    return createSuccessResponse(user);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return createErrorResponse(error);
    }
    return createErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
  }
}

// DELETE /api/users/[id] - Soft delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID', [{ field: 'id', message: 'ID must be a number' }]);
    }

    deleteUser(userId);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return createErrorResponse(error);
    }
    return createErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
  }
}
