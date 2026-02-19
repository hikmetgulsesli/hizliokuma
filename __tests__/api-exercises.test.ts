import { GET, POST, PATCH, DELETE } from "@/app/api/exercises/route";
import { getDatabase } from "@/lib/db/connection";

// Mock the database connection
jest.mock("@/lib/db/connection", () => ({
  getDatabase: jest.fn(),
}));

describe("Exercises API", () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/exercises", () => {
    it("returns all exercises with pagination", async () => {
      const mockExercises = [
        {
          id: 1,
          title: "Blok Okuma",
          description: "Metin bitene kadar bölünmeden okuma",
          type: "reading",
          difficulty_levels: "Seviye 1-8",
          duration_minutes: 15,
          is_active: 1,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T10:00:00Z",
        },
        {
          id: 2,
          title: "Grup Okuma",
          description: "3+ kelime grubu ile okuma",
          type: "chunking",
          difficulty_levels: "Seviye 1-8",
          duration_minutes: 10,
          is_active: 1,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-18T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 2 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockExercises),
        });

      const request = new Request("http://localhost:3000/api/exercises");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockExercises);
      expect(data.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it("respects pagination parameters", async () => {
      const mockExercises = [
        {
          id: 3,
          title: "Metin Arama",
          description: "Kelime bulma egzersizi",
          type: "scanning",
          difficulty_levels: "Seviye 1-8",
          duration_minutes: 3,
          is_active: 1,
          created_at: "2024-01-05T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 25 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockExercises),
        });

      const request = new Request("http://localhost:3000/api/exercises?page=2&limit=10");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it("limits maximum page size to 100", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 150 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([]),
        });

      const request = new Request("http://localhost:3000/api/exercises?limit=200");
      const response = await GET(request as any);
      const data = await response.json();

      expect(data.meta.limit).toBe(100);
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new Request("http://localhost:3000/api/exercises");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("POST /api/exercises", () => {
    it("creates exercise with valid data", async () => {
      const mockExercise = {
        id: 1,
        title: "Yeni Egzersiz",
        description: "Test açıklama",
        type: "reading",
        difficulty_levels: "Seviye 1-5",
        duration_minutes: 10,
        is_active: 1,
        created_at: "2024-01-25T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      mockDb.prepare
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(mockExercise),
        });

      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          title: "Yeni Egzersiz",
          description: "Test açıklama",
          type: "reading",
          difficulty_levels: "Seviye 1-5",
          duration_minutes: 10,
          is_active: true,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(mockExercise);
    });

    it("creates exercise with minimal required fields", async () => {
      const mockExercise = {
        id: 1,
        title: "Basit Egzersiz",
        description: null,
        type: "focus",
        difficulty_levels: "Seviye 1",
        duration_minutes: 0,
        is_active: 1,
        created_at: "2024-01-25T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      mockDb.prepare
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(mockExercise),
        });

      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          title: "Basit Egzersiz",
          type: "focus",
          difficulty_levels: "Seviye 1",
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.title).toBe("Basit Egzersiz");
    });

    it("returns 400 for missing title", async () => {
      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          type: "reading",
          difficulty_levels: "Seviye 1-5",
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details).toContainEqual({
        field: "title",
        message: "Title is required and must be a non-empty string",
      });
    });

    it("returns 400 for missing type", async () => {
      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Egzersiz",
          difficulty_levels: "Seviye 1-5",
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "type",
        message: "Type is required and must be a non-empty string",
      });
    });

    it("returns 400 for missing difficulty_levels", async () => {
      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Egzersiz",
          type: "reading",
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "difficulty_levels",
        message: "Difficulty levels is required and must be a non-empty string",
      });
    });

    it("returns 400 for negative duration", async () => {
      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Egzersiz",
          type: "reading",
          difficulty_levels: "Seviye 1-5",
          duration_minutes: -5,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "duration_minutes",
        message: "Duration must be a non-negative integer",
      });
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database error");
      });

      const request = new Request("http://localhost:3000/api/exercises", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Egzersiz",
          type: "reading",
          difficulty_levels: "Seviye 1-5",
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("PATCH /api/exercises", () => {
    beforeEach(() => {
      mockDb.prepare.mockReset();
    });

    it("updates exercise with valid data", async () => {
      const mockExercise = {
        id: 1,
        title: "Güncellenmiş Egzersiz",
        description: "Güncel açıklama",
        type: "reading",
        difficulty_levels: "Seviye 1-10",
        duration_minutes: 20,
        is_active: 0,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ changes: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(mockExercise),
        });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "PATCH",
        body: JSON.stringify({
          title: "Güncellenmiş Egzersiz",
          description: "Güncel açıklama",
          difficulty_levels: "Seviye 1-10",
          duration_minutes: 20,
          is_active: false,
        }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockExercise);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/exercises", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/exercises?id=invalid", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when exercise not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/exercises?id=999", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 400 for empty title", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "PATCH",
        body: JSON.stringify({ title: "" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "title",
        message: "Title must be a non-empty string",
      });
    });

    it("returns 400 for negative duration", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "PATCH",
        body: JSON.stringify({ duration_minutes: -10 }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "duration_minutes",
        message: "Duration must be a non-negative integer",
      });
    });

    it("returns 400 when no valid fields provided", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "PATCH",
        body: JSON.stringify({ invalidField: "value" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe("No valid fields to update");
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database error");
      });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("DELETE /api/exercises", () => {
    it("deletes exercise successfully", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ changes: 1 }),
        });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe("Exercise deleted successfully");
      expect(data.data.deletedId).toBe(1);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/exercises", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/exercises?id=invalid", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when exercise not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/exercises?id=999", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database error");
      });

      const request = new Request("http://localhost:3000/api/exercises?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });
});
