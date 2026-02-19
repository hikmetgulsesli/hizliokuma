import { POST as RegisterPOST } from "@/app/api/auth/register/route";
import { POST as LoginPOST } from "@/app/api/auth/login/route";
import { getDatabase } from "@/lib/db/connection";

// Mock dependencies
jest.mock("@/lib/db/connection", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed_password"),
  verifyPassword: jest.fn().mockResolvedValue(true),
  generateToken: jest.fn().mockReturnValue("mock_jwt_token"),
  verifyToken: jest.fn().mockReturnValue({ userId: 1, email: "test@example.com" }),
}));

describe("Auth API", () => {
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

  describe("POST /api/auth/register", () => {
    it("creates a user with valid input", async () => {
      // Mock: user doesn't exist
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined),
      });

      // Mock: insert user
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
      });

      // Mock: fetch created user
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({
          id: 1,
          name: "Test User",
          email: "test@example.com",
          password_hash: "hashed_password",
          level: 1,
          points: 0,
          streak_days: 0,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        }),
      });

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.user).toEqual({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        level: 1,
        points: 0,
      });
    });

    it("returns 400 for missing name", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid email format", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: "invalid-email",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: "email" })
      );
    });

    it("returns 400 for short password", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "123",
        }),
      });

      const response = await RegisterPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details).toContainEqual(
        expect.objectContaining({ field: "password" })
      );
    });

    it("returns 409 for duplicate email", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({
          id: 1,
          email: "test@example.com",
        }),
      });

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("returns 400 for short name", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "A",
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await RegisterPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns JWT token for valid credentials", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({
          id: 1,
          name: "Test User",
          email: "test@example.com",
          password_hash: "hashed_password",
          level: 1,
          points: 0,
          streak_days: 0,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        }),
      });

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await LoginPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.token).toBe("mock_jwt_token");
      expect(data.data.user).toEqual({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        level: 1,
        points: 0,
      });
    });

    it("returns 400 for missing email", async () => {
      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          password: "password123",
        }),
      });

      const response = await LoginPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid email format", async () => {
      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: "password123",
        }),
      });

      const response = await LoginPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 401 for non-existent user", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined),
      });

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      });

      const response = await LoginPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 for invalid password", async () => {
      const { verifyPassword } = require("@/lib/auth");
      (verifyPassword as jest.Mock).mockResolvedValueOnce(false);

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({
          id: 1,
          name: "Test User",
          email: "test@example.com",
          password_hash: "hashed_password",
          level: 1,
          points: 0,
          streak_days: 0,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        }),
      });

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrong_password",
        }),
      });

      const response = await LoginPOST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });
});
