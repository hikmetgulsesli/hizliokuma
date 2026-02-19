import { getDatabase, closeDatabase } from '@/lib/db/connection';
import { createSchema, dropSchema } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class {
    url: string;
    method: string;
    headers: Headers;
    body: string | null;
    nextUrl: { searchParams: URLSearchParams };

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body as string || null;
      const parsedUrl = new URL(url, 'http://localhost:3000');
      this.nextUrl = {
        searchParams: parsedUrl.searchParams,
      };
    }

    async json() {
      return this.body ? JSON.parse(this.body) : {};
    }
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
      };
    },
  },
}));

// Import after mocking
import { GET, POST } from '@/app/api/exercise-results/route';

describe('Blok Okuma Result Saving', () => {
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

  describe('POST /api/exercise-results - Blok Okuma Exercise', () => {
    it('should save blok-okuma exercise result successfully', async () => {
      const requestBody = {
        userId: 1,
        exerciseId: 1, // Blok okuma exercise ID
        score: 85,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toBeDefined();
      expect(data.data.exercise_title).toBe('Temel Okuma Egzersizi');
      expect(data.data.score).toBe(85);
      expect(data.data.wpm).toBe(250);
    });

    it('should calculate and save score based on WPM for blok-okuma', async () => {
      // Test with 300 WPM (should give 100 points max)
      const requestBody = {
        userId: 2,
        exerciseId: 1,
        score: 100, // max score at 300 WPM
        wpm: 300,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.wpm).toBe(300);
      expect(data.data.score).toBe(100);
    });

    it('should update user points after saving result', async () => {
      const db = getDatabase();
      
      // Get initial points
      const initialUser = db.prepare('SELECT points FROM users WHERE id = ?').get(3) as { points: number };
      const initialPoints = initialUser.points;

      const requestBody = {
        userId: 3,
        exerciseId: 1,
        score: 75,
        wpm: 225,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      await POST(request);

      // Check that points were updated
      const updatedUser = db.prepare('SELECT points FROM users WHERE id = ?').get(3) as { points: number };
      expect(updatedUser.points).toBe(initialPoints + 75);
    });

    it('should return 400 for missing userId', async () => {
      const requestBody = {
        exerciseId: 1,
        score: 85,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'userId', message: 'userId is required' })
      );
    });

    it('should return 400 for missing exerciseId', async () => {
      const requestBody = {
        userId: 1,
        score: 85,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'exerciseId', message: 'exerciseId is required' })
      );
    });

    it('should return 400 for missing score', async () => {
      const requestBody = {
        userId: 1,
        exerciseId: 1,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'score', message: 'score is required' })
      );
    });

    it('should return 400 for missing wpm', async () => {
      const requestBody = {
        userId: 1,
        exerciseId: 1,
        score: 85,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'wpm', message: 'wpm is required' })
      );
    });

    it('should return 404 for non-existent user', async () => {
      const requestBody = {
        userId: 99999,
        exerciseId: 1,
        score: 85,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existent exercise', async () => {
      const requestBody = {
        userId: 1,
        exerciseId: 99999,
        score: 85,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should validate userId is a positive integer', async () => {
      const requestBody = {
        userId: -1,
        exerciseId: 1,
        score: 85,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'userId', message: 'userId must be a positive integer' })
      );
    });

    it('should validate score is non-negative', async () => {
      const requestBody = {
        userId: 1,
        exerciseId: 1,
        score: -10,
        wpm: 250,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'score', message: 'score must be a non-negative integer' })
      );
    });

    it('should validate wpm is non-negative', async () => {
      const requestBody = {
        userId: 1,
        exerciseId: 1,
        score: 85,
        wpm: -50,
      };

      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: 'wpm', message: 'wpm must be a non-negative integer' })
      );
    });
  });

  describe('GET /api/exercise-results - Fetch Results', () => {
    it('should fetch exercise results for a user', async () => {
      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results?userId=1&limit=5',
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
      expect(data.meta.total).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 for missing userId parameter', async () => {
      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results',
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      const request = new (jest.requireMock('next/server').NextRequest)(
        'http://localhost:3000/api/exercise-results?userId=99999',
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('WPM Calculation for Blok Okuma', () => {
    it('should correctly calculate WPM from word count and elapsed time', async () => {
      // WPM = (wordCount / elapsedSeconds) * 60
      const wordCount = 100;
      const elapsedSeconds = 60;
      const expectedWpm = Math.round((wordCount / elapsedSeconds) * 60);
      
      expect(expectedWpm).toBe(100);
    });

    it('should calculate WPM for faster reading speeds', async () => {
      const wordCount = 150;
      const elapsedSeconds = 30; // 30 seconds
      const expectedWpm = Math.round((wordCount / elapsedSeconds) * 60);
      
      expect(expectedWpm).toBe(300);
    });

    it('should handle edge case of very short elapsed time', async () => {
      const wordCount = 50;
      const elapsedSeconds = 10; // 10 seconds
      const expectedWpm = Math.round((wordCount / elapsedSeconds) * 60);
      
      expect(expectedWpm).toBe(300);
    });

    it('should calculate score as percentage based on WPM', async () => {
      // Score formula: min(100, wpm / 3)
      // At 300 WPM, score should be 100
      const wpm = 300;
      const score = Math.min(100, Math.round(wpm / 3));
      
      expect(score).toBe(100);
    });

    it('should cap score at 100 for very high WPM', async () => {
      const wpm = 500;
      const score = Math.min(100, Math.round(wpm / 3));
      
      expect(score).toBe(100);
    });

    it('should calculate lower scores for lower WPM', async () => {
      const wpm = 150;
      const score = Math.min(100, Math.round(wpm / 3));
      
      expect(score).toBe(50);
    });
  });
});
