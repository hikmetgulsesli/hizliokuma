import { GET, POST, DELETE } from "@/app/api/users/rewards/route";
import { getDatabase } from "@/lib/db/connection";

// Mock the database connection
jest.mock("@/lib/db/connection", () => ({
  getDatabase: jest.fn(),
}));

describe("User Rewards API", () => {
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

  describe("GET /api/users/rewards", () => {
    it("returns earned rewards for a user", async () => {
      const mockRewards = [
        {
          id: 1,
          title: "Bronz Madalya",
          description: "İlk madalya",
          type: "medal",
          threshold: 100,
          icon: null,
          earned_at: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          title: "100 Puan",
          description: "100 puan ödülü",
          type: "points",
          threshold: 100,
          icon: null,
          earned_at: "2024-01-10T10:00:00Z",
        },
      ];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue(mockRewards),
        });

      const request = new Request("http://localhost:3000/api/users/rewards?userId=1");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockRewards);
    });

    it("returns 400 when userId is missing", async () => {
      const request = new Request("http://localhost:3000/api/users/rewards");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details).toContainEqual({
        field: "userId",
        message: "userId parameter is required",
      });
    });

    it("returns 400 for invalid userId", async () => {
      const request = new Request("http://localhost:3000/api/users/rewards?userId=invalid");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when user not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/users/rewards?userId=999");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const request = new Request("http://localhost:3000/api/users/rewards?userId=1");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("POST /api/users/rewards", () => {
    it("awards a reward to a user", async () => {
      const mockAwardedReward = {
        id: 1,
        title: "Bronz Madalya",
        description: "İlk madalya",
        type: "medal",
        threshold: 100,
        icon: null,
        earned_at: "2024-01-15T10:00:00Z",
      };

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(null),
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ lastInsertRowid: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(mockAwardedReward),
        });

      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({
          userId: 1,
          rewardId: 1,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(mockAwardedReward);
    });

    it("returns 400 for missing userId", async () => {
      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({ rewardId: 1 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "userId",
        message: "userId is required",
      });
    });

    it("returns 400 for missing rewardId", async () => {
      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({ userId: 1 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details).toContainEqual({
        field: "rewardId",
        message: "rewardId is required",
      });
    });

    it("returns 404 when user not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({ userId: 999, rewardId: 1 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 when reward not found", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue(null),
        });

      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({ userId: 1, rewardId: 999 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("returns 409 when user already has the reward", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        });

      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({ userId: 1, rewardId: 1 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe("CONFLICT");
    });

    it("returns 500 on database error", async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error("Database error");
      });

      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "POST",
        body: JSON.stringify({ userId: 1, rewardId: 1 }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("DELETE /api/users/rewards", () => {
    it("removes user reward successfully", async () => {
      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1 }),
        })
        .mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ changes: 1 }),
        });

      const request = new Request("http://localhost:3000/api/users/rewards?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe("User reward removed successfully");
      expect(data.data.deletedId).toBe(1);
    });

    it("returns 400 when ID is missing", async () => {
      const request = new Request("http://localhost:3000/api/users/rewards", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid ID", async () => {
      const request = new Request("http://localhost:3000/api/users/rewards?id=invalid", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when user reward not found", async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new Request("http://localhost:3000/api/users/rewards?id=999", {
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

      const request = new Request("http://localhost:3000/api/users/rewards?id=1", {
        method: "DELETE",
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });
});
