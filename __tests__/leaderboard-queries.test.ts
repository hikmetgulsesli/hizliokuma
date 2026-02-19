import { getLeaderboard, getUserRank } from '@/lib/db/queries';
import { getDatabase, closeDatabase } from '@/lib/db/connection';
import { createSchema, dropSchema } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';

describe('Leaderboard Queries', () => {
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

  describe('getLeaderboard', () => {
    it('returns an array of leaderboard entries', () => {
      const leaderboard = getLeaderboard();
      expect(Array.isArray(leaderboard)).toBe(true);
    });

    it('returns entries with all required fields', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(0);
      
      const entry = leaderboard[0];
      expect(entry).toHaveProperty('rank');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('points');
      expect(entry).toHaveProperty('streakDays');
      expect(entry).toHaveProperty('totalExercises');
    });

    it('returns correct data types for all fields', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(0);
      
      const entry = leaderboard[0];
      expect(typeof entry.rank).toBe('number');
      expect(typeof entry.name).toBe('string');
      expect(typeof entry.points).toBe('number');
      expect(typeof entry.streakDays).toBe('number');
      expect(typeof entry.totalExercises).toBe('number');
    });

    it('returns entries sorted by rank (1, 2, 3...)', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(1);
      
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].rank).toBe(i + 1);
        expect(leaderboard[i].rank).toBeLessThan(leaderboard[i + 1].rank);
      }
    });

    it('returns entries ordered by points descending', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(1);
      
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].points).toBeGreaterThanOrEqual(leaderboard[i + 1].points);
      }
    });

    it('respects the limit parameter', () => {
      const leaderboard = getLeaderboard(5);
      expect(leaderboard.length).toBeLessThanOrEqual(5);
    });

    it('defaults to 10 entries when no limit provided', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeLessThanOrEqual(10);
    });

    it('returns correct rank numbers starting from 1', () => {
      const leaderboard = getLeaderboard(5);
      expect(leaderboard[0].rank).toBe(1);
      if (leaderboard.length > 1) {
        expect(leaderboard[1].rank).toBe(2);
      }
    });

    it('includes totalExercises count for each user', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(0);
      
      leaderboard.forEach(entry => {
        expect(entry.totalExercises).toBeGreaterThanOrEqual(0);
      });
    });

    it('includes streakDays for each user', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(0);
      
      leaderboard.forEach(entry => {
        expect(entry.streakDays).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getUserRank', () => {
    it('returns null for non-existent user', () => {
      const userRank = getUserRank(99999);
      expect(userRank).toBeNull();
    });

    it('returns user rank with all required fields', () => {
      const userRank = getUserRank(1);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        expect(userRank).toHaveProperty('rank');
        expect(userRank).toHaveProperty('name');
        expect(userRank).toHaveProperty('points');
        expect(userRank).toHaveProperty('streakDays');
        expect(userRank).toHaveProperty('totalExercises');
      }
    });

    it('returns correct data types for all fields', () => {
      const userRank = getUserRank(1);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        expect(typeof userRank.rank).toBe('number');
        expect(typeof userRank.name).toBe('string');
        expect(typeof userRank.points).toBe('number');
        expect(typeof userRank.streakDays).toBe('number');
        expect(typeof userRank.totalExercises).toBe('number');
      }
    });

    it('returns rank as a positive number', () => {
      const userRank = getUserRank(1);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        expect(userRank.rank).toBeGreaterThan(0);
      }
    });

    it('returns correct user name', () => {
      const userRank = getUserRank(1);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        expect(userRank.name).toBe('Ahmet Yılmaz'); // First user from seed data
      }
    });

    it('returns consistent rank for same user', () => {
      const rank1 = getUserRank(1);
      const rank2 = getUserRank(1);
      
      expect(rank1).not.toBeNull();
      expect(rank2).not.toBeNull();
      
      if (rank1 && rank2) {
        expect(rank1.rank).toBe(rank2.rank);
      }
    });

    it('returns different ranks for different users', () => {
      const rank1 = getUserRank(1);
      const rank3 = getUserRank(3);
      
      expect(rank1).not.toBeNull();
      expect(rank3).not.toBeNull();
      
      if (rank1 && rank3) {
        // User 3 has more points than user 1, so should have better rank (lower number)
        expect(rank3.rank).toBeLessThan(rank1.rank);
      }
    });

    it('includes totalExercises count', () => {
      const userRank = getUserRank(1);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        expect(userRank.totalExercises).toBeGreaterThanOrEqual(0);
      }
    });

    it('includes streakDays', () => {
      const userRank = getUserRank(1);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        expect(userRank.streakDays).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns correct points value from database', () => {
      const userRank = getUserRank(3);
      expect(userRank).not.toBeNull();
      
      if (userRank) {
        // User 3 (Mehmet Demir) has 2340 points in seed data
        expect(userRank.points).toBe(2340);
      }
    });
  });

  describe('Leaderboard consistency', () => {
    it('getUserRank returns consistent rank with getLeaderboard', () => {
      const leaderboard = getLeaderboard(10);
      
      // Test the first few users in the leaderboard
      const usersToTest = Math.min(5, leaderboard.length);
      
      for (let i = 0; i < usersToTest; i++) {
        const entry = leaderboard[i];
        
        // Find the user ID by name (since leaderboard doesn't include ID)
        const db = getDatabase();
        const user = db.prepare('SELECT id FROM users WHERE name = ?').get(entry.name) as { id: number } | undefined;
        
        if (user) {
          const userRank = getUserRank(user.id);
          expect(userRank).not.toBeNull();
          
          if (userRank) {
            expect(userRank.rank).toBe(entry.rank);
            expect(userRank.name).toBe(entry.name);
            expect(userRank.points).toBe(entry.points);
            expect(userRank.streakDays).toBe(entry.streakDays);
          }
        }
      }
    });
  });
});
