import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth';
import { findUserById } from '@/lib/db/queries';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  level: number;
  points: number;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requireAuth = true
) {
  return async (req: AuthenticatedRequest) => {
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      if (requireAuth) {
        return NextResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          },
          { status: 401 }
        );
      }
      return handler(req);
    }

    try {
      // Verify token
      const payload = verifyToken(token);
      const user = findUserById(payload.userId);

      if (!user) {
        return NextResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not found',
            },
          },
          { status: 401 }
        );
      }

      // Attach user to request
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        points: user.points,
      };

      return handler(req);
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
        },
        { status: 401 }
      );
    }
  };
}
