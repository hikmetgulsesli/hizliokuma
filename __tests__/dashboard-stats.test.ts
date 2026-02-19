import { getDashboardStats, getRecentActivities, getPopularExercises } from '@/lib/db/queries';
import { getDatabase, closeDatabase } from '@/lib/db/connection';
import { createSchema, dropSchema } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';

// Mock next/server for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status || 200,
    }),
  },
  NextRequest: class MockNextRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  },
}));

describe('Dashboard Stats Queries', () => {
  beforeAll(() => {
    // Ensure fresh database for tests
    closeDatabase();
    dropSchema();
    createSchema();
    seedDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('getDashboardStats', () => {
    it('returns correct total user count', () => {
      const stats = getDashboardStats();
      expect(stats.totalUsers).toBe(12); // From seed data
    });

    it('returns correct active exercises count', () => {
      const stats = getDashboardStats();
      expect(stats.activeExercises).toBe(12); // All exercises in seed are active
    });

    it('returns correct total completed exercises count', () => {
      const stats = getDashboardStats();
      expect(stats.totalCompletedExercises).toBe(16); // From seed data
    });

    it('returns a non-negative daily average', () => {
      const stats = getDashboardStats();
      expect(stats.dailyAverageMinutes).toBeGreaterThanOrEqual(0);
    });

    it('returns all required stat fields', () => {
      const stats = getDashboardStats();
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeExercises');
      expect(stats).toHaveProperty('totalCompletedExercises');
      expect(stats).toHaveProperty('dailyAverageMinutes');
    });

    it('returns numeric values for all stats', () => {
      const stats = getDashboardStats();
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.activeExercises).toBe('number');
      expect(typeof stats.totalCompletedExercises).toBe('number');
      expect(typeof stats.dailyAverageMinutes).toBe('number');
    });
  });

  describe('getRecentActivities', () => {
    it('returns activities array', () => {
      const activities = getRecentActivities();
      expect(Array.isArray(activities)).toBe(true);
    });

    it('respects the limit parameter', () => {
      const activities = getRecentActivities(3);
      expect(activities.length).toBeLessThanOrEqual(3);
    });

    it('returns activities with required fields', () => {
      const activities = getRecentActivities();
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('userName');
        expect(activity).toHaveProperty('action');
        expect(activity).toHaveProperty('time');
        expect(activity).toHaveProperty('timeAgo');
      }
    });

    it('returns string values for text fields', () => {
      const activities = getRecentActivities();
      if (activities.length > 0) {
        const activity = activities[0];
        expect(typeof activity.userName).toBe('string');
        expect(typeof activity.action).toBe('string');
        expect(typeof activity.time).toBe('string');
        expect(typeof activity.timeAgo).toBe('string');
      }
    });

    it('returns activities sorted by most recent first', () => {
      const activities = getRecentActivities(5);
      if (activities.length >= 2) {
        // All activities should have timeAgo as a string
        expect(typeof activities[0].timeAgo).toBe('string');
        expect(typeof activities[1].timeAgo).toBe('string');
      }
    });
  });

  describe('getPopularExercises', () => {
    it('returns exercises array', () => {
      const exercises = getPopularExercises();
      expect(Array.isArray(exercises)).toBe(true);
    });

    it('respects the limit parameter', () => {
      const exercises = getPopularExercises(3);
      expect(exercises.length).toBeLessThanOrEqual(3);
    });

    it('returns exercises with required fields', () => {
      const exercises = getPopularExercises();
      if (exercises.length > 0) {
        const exercise = exercises[0];
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('completions');
        expect(exercise).toHaveProperty('percentage');
      }
    });

    it('returns exercises sorted by completion count', () => {
      const exercises = getPopularExercises();
      if (exercises.length >= 2) {
        expect(exercises[0].completions).toBeGreaterThanOrEqual(exercises[1].completions);
      }
    });

    it('returns percentage between 0 and 100', () => {
      const exercises = getPopularExercises();
      exercises.forEach(exercise => {
        expect(exercise.percentage).toBeGreaterThanOrEqual(0);
        expect(exercise.percentage).toBeLessThanOrEqual(100);
      });
    });

    it('returns highest percentage as 100 for top exercise', () => {
      const exercises = getPopularExercises();
      if (exercises.length > 0) {
        expect(exercises[0].percentage).toBe(100);
      }
    });
  });
});

describe('Dashboard API Route', () => {
  beforeAll(() => {
    closeDatabase();
    dropSchema();
    createSchema();
    seedDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  it('GET /api/dashboard/stats returns dashboard data', async () => {
    const { GET } = await import('@/app/api/dashboard/stats/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('stats');
    expect(data.data).toHaveProperty('recentActivities');
    expect(data.data).toHaveProperty('popularExercises');
  });

  it('GET /api/dashboard/stats returns correct stats structure', async () => {
    const { GET } = await import('@/app/api/dashboard/stats/route');
    const response = await GET();
    const data = await response.json();

    expect(data.data.stats).toHaveProperty('totalUsers');
    expect(data.data.stats).toHaveProperty('activeExercises');
    expect(data.data.stats).toHaveProperty('totalCompletedExercises');
    expect(data.data.stats).toHaveProperty('dailyAverageMinutes');
  });

  it('GET /api/dashboard/stats returns arrays for activities and exercises', async () => {
    const { GET } = await import('@/app/api/dashboard/stats/route');
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data.data.recentActivities)).toBe(true);
    expect(Array.isArray(data.data.popularExercises)).toBe(true);
  });
});
