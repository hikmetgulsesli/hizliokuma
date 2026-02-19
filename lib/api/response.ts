import { NextResponse } from 'next/server';
import { AppError, ApiErrorResponse, ApiSuccessResponse } from './errors';

export function createErrorResponse(error: AppError | Error): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Generic error fallback
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = { data };
  if (meta) {
    response.meta = meta;
  }
  return NextResponse.json(response, { status: statusCode });
}

// Helper to parse pagination params
export function getPaginationParams(searchParams: URLSearchParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  return { page, limit };
}
