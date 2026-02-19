import { GET, PATCH, DELETE } from "@/app/api/users/route";
import { getDatabase } from "@/lib/db/connection";

// Mock the database connection
jest.mock("@/lib/db/connection", () => ({
  getDatabase: jest.fn(),
}));

describe("Users API", () => {
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

  describe("GET /api/users", () => {
    it("returns all users with pagination", async () => {
      const mockUsers = [
        {
          id: 1,
          name: "Ahmet Yılmaz",
          email: "ahmet@example.com",
          level: 5,
          points: 1250,
          streak_days: 12,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T10:00:00Z",
        },
        {
          id: 2,
          name: "Ayşe Kaya",
          email: "ayse@example.com",
          level: 3,
          points: 680,
          streak_days: 7,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-18T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 2 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockUsers),
        });

      const request = new Request("http://localhost:3000/api/users");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockUsers);
      expect(data.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it("respects pagination parameters", async () => {
      const mockUsers = [
        {
          id: 3,
          name: "Mehmet Demir",
          email: "mehmet@example.com",
          level: 2,
          points: 340,
          streak_days: 3,
          created_at: "2024-01-05T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ total: 25 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockUsers),
        });

      const request = new Request("http://localhost:3000/api/users?page=2&limit=10");
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

      const request = new Request("http://localhost:3000/api/users?limit=200");
      const response = await GET(request as any);
      const data = await response.json();

      expect(data.meta.limit).toBe(100);
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new Request("http://localhost:3000/api/users");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("PATCH /api/users", () => {
    beforeEach(() => {
      // Reset the mock for each PATCH test - reset removes mock implementations
      mockDb.prepare.mockReset();
    });

    it("updates user with valid data", async () => {
      const mockUser = {
        id: 1,
        name: "Updated Name",
        email: "updated@example.com",
        level: 10,
        points: 5000,
        streak_days: 30,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-25T10:00:00Z",
      };

      // prepare calls in order:
      // 1. Check user exists (.get)
      // 2. Check email uniqueness (.get) 
      // 3. Unused prepare for update query (no call)
      // 4. Actual UPDATE (.run)
      // 5. Fetch updated user (.get)
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(null), // Email check - no conflict
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ changes: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(mockUser),
        });

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Updated Name",
          email: "updated@example.com",
          level: 10,
          points: 5000,
          streak_days: 30,
        }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockUser);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/users", {
        method: "PATCH",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/users?id=invalid", {
        method: "PATCH",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when user not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/users?id=999", {
        method: "PATCH",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 400 for invalid email format", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "PATCH",
        body: JSON.stringify({ email: "invalid-email" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details).toContainEqual({
        field: "email",
        message: "Invalid email format",
      });
    });

    it("returns 400 for negative points", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "PATCH",
        body: JSON.stringify({ points: -10 }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "points",
        message: "Points must be a non-negative integer",
      });
    });

    it("returns 400 for invalid level", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "PATCH",
        body: JSON.stringify({ level: 0 }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "level",
        message: "Level must be a positive integer",
      });
    });

    it("returns 409 for duplicate email", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 2 }), // Email exists on another user
        });

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "PATCH",
        body: JSON.stringify({ email: "existing@example.com" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("returns 400 when no valid fields provided", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 }),
      });

      const request = new Request("http://localhost:3000/api/users?id=1", {
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

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("DELETE /api/users", () => {
    it("deletes user successfully", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ changes: 1 }),
        });

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe("User deleted successfully");
      expect(data.data.deletedId).toBe(1);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/users", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/users?id=invalid", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when user not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/users?id=999", {
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

      const request = new Request("http://localhost:3000/api/users?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });
});
