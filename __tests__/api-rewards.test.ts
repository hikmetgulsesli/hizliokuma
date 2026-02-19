import { GET, POST, PATCH, DELETE } from "@/app/api/rewards/route";
import { getDatabase } from "@/lib/db/connection";

// Mock the database connection
jest.mock("@/lib/db/connection", () => ({
  getDatabase: jest.fn(),
}));

describe("Rewards API", () => {
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

  describe("GET /api/rewards", () => {
    it("returns all rewards with pagination", async () => {
      const mockRewards = [
        {
          id: 1,
          title: "Bronz Madalya",
          description: "İlk madalya",
          type: "medal",
          threshold: 100,
          icon: null,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T10:00:00Z",
        },
        {
          id: 2,
          title: "100 Puan",
          description: "100 puan ödülü",
          type: "points",
          threshold: 100,
          icon: null,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-18T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 2 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockRewards),
        });

      const request = new Request("http://localhost:3000/api/rewards");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockRewards);
      expect(data.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it("filters by type when provided", async () => {
      const mockRewards = [
        {
          id: 1,
          title: "Bronz Madalya",
          description: "İlk madalya",
          type: "medal",
          threshold: 100,
          icon: null,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 1 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockRewards),
        });

      const request = new Request("http://localhost:3000/api/rewards?type=medal");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockRewards);
    });

    it("respects pagination parameters", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 25 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([]),
        });

      const request = new Request("http://localhost:3000/api/rewards?page=2&limit=10");
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

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new Request("http://localhost:3000/api/rewards");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("POST /api/rewards", () => {
    it("creates a reward with valid data", async () => {
      const mockReward = {
        id: 1,
        title: "Yeni Ödül",
        description: "Açıklama",
        type: "points",
        threshold: 50,
        icon: "star",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      };

      mockDb.prepare
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(mockReward),
        });

      const request = new Request("http://localhost:3000/api/rewards", {
        method: "POST",
        body: JSON.stringify({
          title: "Yeni Ödül",
          description: "Açıklama",
          type: "points",
          threshold: 50,
          icon: "star",
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(mockReward);
    });

    it("returns 400 for missing title", async () => {
      const request = new Request("http://localhost:3000/api/rewards", {
        method: "POST",
        body: JSON.stringify({
          type: "points",
          threshold: 50,
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

    it("returns 400 for invalid type", async () => {
      const request = new Request("http://localhost:3000/api/rewards", {
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          type: "invalid",
          threshold: 50,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "type",
        message: "Type must be one of: points, medal, streak",
      });
    });

    it("returns 400 for negative threshold", async () => {
      const request = new Request("http://localhost:3000/api/rewards", {
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          type: "points",
          threshold: -1,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "threshold",
        message: "Threshold must be a non-negative integer",
      });
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database error");
      });

      const request = new Request("http://localhost:3000/api/rewards", {
        method: "POST",
        body: JSON.stringify({
          title: "Test",
          type: "points",
          threshold: 50,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("PATCH /api/rewards", () => {
    beforeEach(() => {
      mockDb.prepare.mockReset();
    });

    it("updates reward with valid data", async () => {
      const mockReward = {
        id: 1,
        title: "Güncellenmiş Ödül",
        description: "Yeni açıklama",
        type: "medal",
        threshold: 200,
        icon: "trophy",
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
          get: jest.fn().mockReturnValue(mockReward),
        });

      const request = new Request("http://localhost:3000/api/rewards?id=1", {
        method: "PATCH",
        body: JSON.stringify({
          title: "Güncellenmiş Ödül",
          description: "Yeni açıklama",
          type: "medal",
          threshold: 200,
          icon: "trophy",
        }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockReward);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/rewards", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/rewards?id=invalid", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when reward not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/rewards?id=999", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 400 for invalid type", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/rewards?id=1", {
        method: "PATCH",
        body: JSON.stringify({ type: "invalid" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "type",
        message: "Type must be one of: points, medal, streak",
      });
    });

    it("returns 400 when no valid fields provided", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/rewards?id=1", {
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

      const request = new Request("http://localhost:3000/api/rewards?id=1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("DELETE /api/rewards", () => {
    it("deletes reward successfully", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ changes: 1 }),
        });

      const request = new Request("http://localhost:3000/api/rewards?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe("Reward deleted successfully");
      expect(data.data.deletedId).toBe(1);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/rewards", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/rewards?id=invalid", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when reward not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/rewards?id=999", {
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

      const request = new Request("http://localhost:3000/api/rewards?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });
});
