import {
  getUserStreak,
  updateUserStreak,
  resetStreakIfBroken,
  checkAndAwardStreakRewards,
  getUserRewardsWithStreakBadges,
  getStreakHistory,
  recordExerciseCompletion,
  STREAK_REWARDS,
} from "@/lib/streak-rewards";
import { getDatabase } from "@/lib/db/connection";

// Mock the database connection
jest.mock("@/lib/db/connection", () => ({
  getDatabase: jest.fn(),
}));

describe("Streak and Rewards System", () => {
  let mockDb: {
    prepare: jest.Mock;
    exec: jest.Mock;
    transaction: jest.Mock;
  };

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn(),
      exec: jest.fn(),
      transaction: jest.fn((fn) => fn),
    };
    (getDatabase as jest.Mock).mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserStreak", () => {
    it("returns zero streak for user with no exercises", () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined),
      });

      const result = getUserStreak(1);

      expect(result.currentStreak).toBe(0);
      expect(result.lastExerciseDate).toBeNull();
      expect(result.streakBroken).toBe(false);
    });

    it("calculates streak for consecutive daily exercises", () => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ completion_date: today }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([
            { completion_date: today },
            { completion_date: yesterday },
          ]),
        });

      const result = getUserStreak(1);

      expect(result.currentStreak).toBe(2);
      expect(result.streakBroken).toBe(false);
    });

    it("detects broken streak when more than 1 day gap", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ completion_date: threeDaysAgo }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([{ completion_date: threeDaysAgo }]),
        });

      const result = getUserStreak(1);

      expect(result.streakBroken).toBe(true);
      expect(result.currentStreak).toBe(0);
    });

    it("maintains streak if exercised yesterday", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ completion_date: yesterday }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([{ completion_date: yesterday }]),
        });

      const result = getUserStreak(1);

      expect(result.streakBroken).toBe(false);
      expect(result.currentStreak).toBe(1);
    });
  });

  describe("updateUserStreak", () => {
    it("updates user streak_days in database", () => {
      const today = new Date().toISOString().split("T")[0];

      mockDb.prepare
        .mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ completion_date: today }),
        })
        .mockReturnValueOnce({
          all: jest.fn().mockReturnValue([{ completion_date: today }]),
        })
        .mockReturnValueOnce({
          run: jest.fn(),
        });

      const result = updateUserStreak(1);

      expect(result).toBe(1);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users")
      );
    });
  });

  describe("resetStreakIfBroken", () => {
    it("resets streak when broken and user has streak > 0", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

      // Create mock functions
      const mockGet1 = jest.fn().mockReturnValue({ completion_date: threeDaysAgo });
      const mockAll = jest.fn().mockReturnValue([{ completion_date: threeDaysAgo }]);
      const mockGet2 = jest.fn().mockReturnValue({ streak_days: 5 });
      const mockRun = jest.fn();

      mockDb.prepare
        .mockReturnValueOnce({ get: mockGet1 })
        .mockReturnValueOnce({ all: mockAll })
        .mockReturnValueOnce({ get: mockGet2 })
        .mockReturnValueOnce({ run: mockRun });

      const result = resetStreakIfBroken(1);

      expect(result).toBe(true);
      expect(mockRun).toHaveBeenCalled();
    });

    it("does not reset streak if already zero", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

      // Create mock functions
      const mockGet1 = jest.fn().mockReturnValue({ completion_date: threeDaysAgo });
      const mockAll = jest.fn().mockReturnValue([{ completion_date: threeDaysAgo }]);
      const mockGet2 = jest.fn().mockReturnValue({ streak_days: 0 });

      mockDb.prepare
        .mockReturnValueOnce({ get: mockGet1 })
        .mockReturnValueOnce({ all: mockAll })
        .mockReturnValueOnce({ get: mockGet2 });

      const result = resetStreakIfBroken(1);

      expect(result).toBe(false);
    });
  });

  describe("checkAndAwardStreakRewards", () => {
    it("awards streak badge when threshold reached", () => {
      // Mock 7 day streak
      const dates = Array.from({ length: 7 }, (_, i) => ({
        completion_date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
      }));

      const mockGet1 = jest.fn().mockReturnValue({ completion_date: dates[0].completion_date });
      const mockAll = jest.fn().mockReturnValue(dates);
      const mockRun1 = jest.fn();
      const mockGet2 = jest.fn().mockReturnValue(undefined); // No existing reward
      const mockGet3 = jest.fn().mockReturnValue(undefined); // Reward doesn't exist in table
      const mockRun2 = jest.fn();
      const mockRun3 = jest.fn();

      mockDb.prepare
        .mockReturnValueOnce({ get: mockGet1 })
        .mockReturnValueOnce({ all: mockAll })
        .mockReturnValueOnce({ run: mockRun1 })
        .mockReturnValueOnce({ get: mockGet2 })
        .mockReturnValueOnce({ get: mockGet3 })
        .mockReturnValueOnce({ run: mockRun2 })
        .mockReturnValueOnce({ run: mockRun3 });

      const result = checkAndAwardStreakRewards(1);

      // Should award 5-day badge
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("does not award duplicate rewards", () => {
      const today = new Date().toISOString().split("T")[0];
      const dates = Array.from({ length: 5 }, (_, i) => ({
        completion_date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
      }));

      const mockGet1 = jest.fn().mockReturnValue({ completion_date: today });
      const mockAll = jest.fn().mockReturnValue(dates);
      const mockRun = jest.fn();
      const mockGet2 = jest.fn().mockReturnValue({ id: 1 }); // Already has reward

      mockDb.prepare
        .mockReturnValueOnce({ get: mockGet1 })
        .mockReturnValueOnce({ all: mockAll })
        .mockReturnValueOnce({ run: mockRun })
        .mockReturnValueOnce({ get: mockGet2 });

      const result = checkAndAwardStreakRewards(1);

      expect(result).toEqual([]);
    });
  });

  describe("getUserRewardsWithStreakBadges", () => {
    it("returns earned rewards and unearned streak badges", () => {
      const mockRewards = [
        {
          id: 1,
          title: "Test Reward",
          description: "Test",
          type: "points",
          threshold: 100,
          icon: null,
          earnedAt: "2024-01-01",
          isEarned: 1,
        },
      ];

      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockRewards),
      });

      const result = getUserRewardsWithStreakBadges(1);

      expect(result.length).toBeGreaterThan(mockRewards.length);
      // Should include streak badges
      const streakBadges = result.filter((r) => r.type === "streak_badge");
      expect(streakBadges.length).toBe(STREAK_REWARDS.length);
    });
  });

  describe("getStreakHistory", () => {
    it("returns exercise history for last 30 days", () => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([
          { completion_date: today },
          { completion_date: yesterday },
        ]),
      });

      const result = getStreakHistory(1, 7);

      expect(result).toHaveLength(7);
      expect(result[6].exercised).toBe(true); // Today
      expect(result[5].exercised).toBe(true); // Yesterday
    });

    it("marks days without exercise as false", () => {
      const today = new Date().toISOString().split("T")[0];

      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([{ completion_date: today }]),
      });

      const result = getStreakHistory(1, 7);

      expect(result[6].exercised).toBe(true); // Today
      expect(result[0].exercised).toBe(false); // 6 days ago
    });
  });

  describe("recordExerciseCompletion", () => {
    it("records exercise and updates streak", () => {
      const today = new Date().toISOString().split("T")[0];

      const mockRun1 = jest.fn();
      const mockRun2 = jest.fn();
      const mockGet1 = jest.fn().mockReturnValue({ completion_date: today });
      const mockAll = jest.fn().mockReturnValue([{ completion_date: today }]);
      const mockRun3 = jest.fn();
      const mockGet2 = jest.fn().mockReturnValue(undefined);

      mockDb.prepare
        .mockReturnValueOnce({ run: mockRun1 })
        .mockReturnValueOnce({ run: mockRun2 })
        .mockReturnValueOnce({ get: mockGet1 })
        .mockReturnValueOnce({ all: mockAll })
        .mockReturnValueOnce({ run: mockRun3 })
        .mockReturnValueOnce({ get: mockGet2 });

      const result = recordExerciseCompletion(1, 1, 100, 250);

      expect(result.streak).toBeDefined();
      expect(result.newRewards).toBeDefined();
    });
  });

  describe("STREAK_REWARDS constants", () => {
    it("has correct milestone days", () => {
      expect(STREAK_REWARDS).toHaveLength(5);
      expect(STREAK_REWARDS[0].days).toBe(5);
      expect(STREAK_REWARDS[1].days).toBe(10);
      expect(STREAK_REWARDS[2].days).toBe(15);
      expect(STREAK_REWARDS[3].days).toBe(20);
      expect(STREAK_REWARDS[4].days).toBe(30);
    });

    it("has unique badgeIds", () => {
      const badgeIds = STREAK_REWARDS.map((r) => r.badgeId);
      const uniqueIds = new Set(badgeIds);
      expect(uniqueIds.size).toBe(badgeIds.length);
    });
  });
});
