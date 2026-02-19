import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/users/me/route';
import { getDatabase } from '@/lib/db/connection';

// Mock the database
jest.mock('@/lib/db/connection', () => ({
  getDatabase: jest.fn(),
}));

// Mock the auth middleware to bypass JWT verification
jest.mock('@/lib/auth/middleware', () => ({
  withAuth: (handler: any) => {
    return async (req: NextRequest) => {
      // Simulate authenticated request with user attached
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }
      
      const token = authHeader.replace('Bearer ', '');
      if (token === 'invalid-token') {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
          { status: 401 }
        );
      }

      // Attach mock user to request
      (req as any).user = { id: 1, name: 'Test User', email: 'test@example.com', level: 5, points: 1250 };
      return handler(req);
    };
  },
}));

describe('GET /api/users/me', () => {
  let mockDb: {
    prepare: jest.Mock;
    exec: jest.Mock;
  };

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn(),
      exec: jest.fn(),
    };
    (getDatabase as jest.Mock).mockReturnValue(mockDb);
    jest.clearAllMocks();
  });

  it('returns user profile with authentication', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 5,
      points: 1250,
      streak_days: 7,
      created_at: '2024-01-15T10:00:00Z',
    };

    // Mock user lookup
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockUser),
    });

    // Mock exercise count
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 42 }),
    });

    // Mock exercise history
    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([
        {
          exercise_type: 'Blok Okuma',
          score: 85,
          wpm: 120,
          completed_at: new Date().toISOString(),
        },
      ]),
    });

    // Mock rewards
    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([
        { type: 'altın', count: 3 },
        { type: 'gümüş', count: 2 },
      ]),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const { data } = await response.json();
    expect(data).toMatchObject({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 5,
      points: 1250,
      streakDays: 7,
    });
    expect(data.totalExercises).toBe(42);
    expect(data.exerciseHistory).toBeInstanceOf(Array);
    expect(data.rewards).toBeInstanceOf(Array);
    expect(data.achievements).toBeInstanceOf(Array);
  });

  it('returns 401 without authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/users/me');

    const response = await GET(request);
    expect(response.status).toBe(401);

    const { error } = await response.json();
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 with invalid token', async () => {
    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(401);

    const { error } = await response.json();
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('includes exercise history in response', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 3,
      points: 500,
      streak_days: 3,
      created_at: '2024-01-15T10:00:00Z',
    };

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockUser),
    });

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 5 }),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([
        {
          exercise_type: 'Test Exercise',
          score: 85,
          wpm: 120,
          completed_at: new Date().toISOString(),
        },
        {
          exercise_type: 'Another Exercise',
          score: 90,
          wpm: 150,
          completed_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const { data } = await response.json();
    expect(data.exerciseHistory).toHaveLength(2);
    expect(data.exerciseHistory[0]).toMatchObject({
      type: 'Test Exercise',
      score: 85,
      wpm: 120,
      date: 'Bugün',
    });
  });

  it('includes total exercises count', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 1,
      points: 100,
      streak_days: 1,
      created_at: '2024-01-15T10:00:00Z',
    };

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockUser),
    });

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 15 }),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    const { data } = await response.json();
    
    expect(data.totalExercises).toBe(15);
  });

  it('returns achievements based on user stats', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 5,
      points: 1250,
      streak_days: 7,
      created_at: '2024-01-15T10:00:00Z',
    };

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockUser),
    });

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 15 }),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    const { data } = await response.json();

    // User has 7 streak days, 1250 points, 15 exercises
    expect(data.achievements).toBeInstanceOf(Array);
    
    // Should have streak achievement (7+ days)
    const streakAchievement = data.achievements.find((a: any) => a.id === 'streak-7');
    expect(streakAchievement).toBeDefined();
    expect(streakAchievement.title).toBe('7 Gün Streak');

    // Should have points achievement (100+ points)
    const pointsAchievement = data.achievements.find((a: any) => a.id === 'points-100');
    expect(pointsAchievement).toBeDefined();
    expect(pointsAchievement.title).toBe('100 Puan');

    // Should have exercises achievement (10+ exercises)
    const exercisesAchievement = data.achievements.find((a: any) => a.id === 'exercises-10');
    expect(exercisesAchievement).toBeDefined();
    expect(exercisesAchievement.title).toBe('10 Egzersiz');
  });

  it('returns 404 for non-existent user', async () => {
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(undefined),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(404);

    const { error } = await response.json();
    expect(error.code).toBe('NOT_FOUND');
  });

  it('formats exercise dates correctly', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 3,
      points: 500,
      streak_days: 3,
      created_at: '2024-01-15T10:00:00Z',
    };

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockUser),
    });

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 3 }),
    });

    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 86400000);

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([
        {
          exercise_type: 'Today Exercise',
          score: 85,
          wpm: 120,
          completed_at: today.toISOString(),
        },
        {
          exercise_type: 'Yesterday Exercise',
          score: 90,
          wpm: 150,
          completed_at: yesterday.toISOString(),
        },
        {
          exercise_type: 'Old Exercise',
          score: 70,
          wpm: 100,
          completed_at: threeDaysAgo.toISOString(),
        },
      ]),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    const { data } = await response.json();

    expect(data.exerciseHistory[0].date).toBe('Bugün');
    expect(data.exerciseHistory[1].date).toBe('Dün');
    expect(data.exerciseHistory[2].date).toBe('3 gün önce');
  });

  it('includes rewards in response', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      level: 5,
      points: 1250,
      streak_days: 7,
      created_at: '2024-01-15T10:00:00Z',
    };

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(mockUser),
    });

    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 10 }),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([]),
    });

    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue([
        { type: 'altın', count: 5 },
        { type: 'gümüş', count: 3 },
        { type: 'bronz', count: 2 },
      ]),
    });

    const request = new NextRequest('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': 'Bearer valid_token',
      },
    });

    const response = await GET(request);
    const { data } = await response.json();

    expect(data.rewards).toHaveLength(3);
    expect(data.rewards).toContainEqual({ type: 'altın', count: 5 });
    expect(data.rewards).toContainEqual({ type: 'gümüş', count: 3 });
    expect(data.rewards).toContainEqual({ type: 'bronz', count: 2 });
  });
});
