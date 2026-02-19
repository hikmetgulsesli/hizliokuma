import { getDatabase, closeDatabase } from '../lib/db/connection';
import { createSchema, dropSchema } from '../lib/db/schema';
import {
  getTotalUsers,
  getActiveExercises,
  getTotalCompletedExercises,
  getDailyAverageMinutes,
  getRecentActivities,
  getPopularExercises,
} from '../lib/db/queries';

describe('Dashboard Stats Queries', () => {
  beforeAll(() => {
    // Ensure fresh database
    dropSchema();
    createSchema();
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    // Clean tables before each test
    const db = getDatabase();
    db.exec('DELETE FROM user_exercise_results');
    db.exec('DELETE FROM user_rewards');
    db.exec('DELETE FROM rewards');
    db.exec('DELETE FROM exercises');
    db.exec('DELETE FROM users');
  });

  describe('getTotalUsers', () => {
    it('returns 0 when no users exist', () => {
      expect(getTotalUsers()).toBe(0);
    });

    it('returns correct count of users', () => {
      const db = getDatabase();
      const insert = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      
      insert.run('User 1', 'user1@test.com', 'hash1');
      expect(getTotalUsers()).toBe(1);
      
      insert.run('User 2', 'user2@test.com', 'hash2');
      expect(getTotalUsers()).toBe(2);
      
      insert.run('User 3', 'user3@test.com', 'hash3');
      expect(getTotalUsers()).toBe(3);
    });
  });

  describe('getActiveExercises', () => {
    it('returns 0 when no exercises exist', () => {
      expect(getActiveExercises()).toBe(0);
    });

    it('returns count of only active exercises', () => {
      const db = getDatabase();
      const insert = db.prepare('INSERT INTO exercises (title, type, difficulty_levels, is_active) VALUES (?, ?, ?, ?)');
      
      // Insert active exercises
      insert.run('Exercise 1', 'reading', 'easy', 1);
      insert.run('Exercise 2', 'reading', 'medium', 1);
      insert.run('Exercise 3', 'quiz', 'hard', 1);
      
      // Insert inactive exercises
      insert.run('Exercise 4', 'reading', 'easy', 0);
      insert.run('Exercise 5', 'quiz', 'medium', 0);
      
      expect(getActiveExercises()).toBe(3);
    });

    it('returns 0 when all exercises are inactive', () => {
      const db = getDatabase();
      const insert = db.prepare('INSERT INTO exercises (title, type, difficulty_levels, is_active) VALUES (?, ?, ?, ?)');
      
      insert.run('Exercise 1', 'reading', 'easy', 0);
      insert.run('Exercise 2', 'reading', 'medium', 0);
      
      expect(getActiveExercises()).toBe(0);
    });
  });

  describe('getTotalCompletedExercises', () => {
    it('returns 0 when no results exist', () => {
      expect(getTotalCompletedExercises()).toBe(0);
    });

    it('returns total count of completed exercises', () => {
      const db = getDatabase();
      
      // Create users
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const user1Id = insertUser.run('User 1', 'user1@test.com', 'hash1').lastInsertRowid;
      const user2Id = insertUser.run('User 2', 'user2@test.com', 'hash2').lastInsertRowid;
      
      // Create exercises
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels) VALUES (?, ?, ?)');
      const exercise1Id = insertExercise.run('Exercise 1', 'reading', 'easy').lastInsertRowid;
      const exercise2Id = insertExercise.run('Exercise 2', 'reading', 'medium').lastInsertRowid;
      
      // Create results
      const insertResult = db.prepare('INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)');
      insertResult.run(user1Id, exercise1Id, 85, 120);
      insertResult.run(user1Id, exercise2Id, 90, 130);
      insertResult.run(user2Id, exercise1Id, 75, 110);
      
      expect(getTotalCompletedExercises()).toBe(3);
    });
  });

  describe('getDailyAverageMinutes', () => {
    it('returns 0 when no results exist', () => {
      expect(getDailyAverageMinutes()).toBe(0);
    });

    it('returns average duration of completed exercises', () => {
      const db = getDatabase();
      
      // Create user
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const userId = insertUser.run('User 1', 'user1@test.com', 'hash1').lastInsertRowid;
      
      // Create exercises with different durations
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels, duration_minutes) VALUES (?, ?, ?, ?)');
      const exercise1Id = insertExercise.run('Exercise 1', 'reading', 'easy', 10).lastInsertRowid;
      const exercise2Id = insertExercise.run('Exercise 2', 'reading', 'medium', 20).lastInsertRowid;
      const exercise3Id = insertExercise.run('Exercise 3', 'reading', 'hard', 30).lastInsertRowid;
      
      // Create results
      const insertResult = db.prepare('INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)');
      insertResult.run(userId, exercise1Id, 85, 120);
      insertResult.run(userId, exercise2Id, 90, 130);
      insertResult.run(userId, exercise3Id, 95, 140);
      
      // Average should be (10 + 20 + 30) / 3 = 20
      expect(getDailyAverageMinutes()).toBe(20);
    });

    it('rounds to one decimal place', () => {
      const db = getDatabase();
      
      // Create user
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const userId = insertUser.run('User 1', 'user1@test.com', 'hash1').lastInsertRowid;
      
      // Create exercises with durations that produce repeating decimal
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels, duration_minutes) VALUES (?, ?, ?, ?)');
      const exercise1Id = insertExercise.run('Exercise 1', 'reading', 'easy', 10).lastInsertRowid;
      const exercise2Id = insertExercise.run('Exercise 2', 'reading', 'medium', 15).lastInsertRowid;
      
      // Create results
      const insertResult = db.prepare('INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)');
      insertResult.run(userId, exercise1Id, 85, 120);
      insertResult.run(userId, exercise2Id, 90, 130);
      
      // Average should be (10 + 15) / 2 = 12.5
      expect(getDailyAverageMinutes()).toBe(12.5);
    });
  });

  describe('getRecentActivities', () => {
    it('returns empty array when no activities exist', () => {
      expect(getRecentActivities(5)).toEqual([]);
    });

    it('returns recent activities with user names', () => {
      const db = getDatabase();
      
      // Create users
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const user1Id = insertUser.run('Alice', 'alice@test.com', 'hash1').lastInsertRowid;
      const user2Id = insertUser.run('Bob', 'bob@test.com', 'hash2').lastInsertRowid;
      
      // Create exercises
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels) VALUES (?, ?, ?)');
      const exercise1Id = insertExercise.run('Reading Test 1', 'reading', 'easy').lastInsertRowid;
      const exercise2Id = insertExercise.run('Reading Test 2', 'reading', 'medium').lastInsertRowid;
      
      // Create results
      const insertResult = db.prepare('INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)');
      insertResult.run(user1Id, exercise1Id, 85, 120);
      insertResult.run(user2Id, exercise2Id, 90, 130);
      
      const activities = getRecentActivities(5);
      
      expect(activities).toHaveLength(2);
      expect(activities[0]).toMatchObject({
        user_name: 'Bob',
        exercise_title: 'Reading Test 2',
        score: 90,
        wpm: 130,
      });
      expect(activities[1]).toMatchObject({
        user_name: 'Alice',
        exercise_title: 'Reading Test 1',
        score: 85,
        wpm: 120,
      });
    });

    it('respects the limit parameter', () => {
      const db = getDatabase();
      
      // Create user
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const userId = insertUser.run('User 1', 'user1@test.com', 'hash1').lastInsertRowid;
      
      // Create exercise
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels) VALUES (?, ?, ?)');
      const exerciseId = insertExercise.run('Exercise 1', 'reading', 'easy').lastInsertRowid;
      
      // Create 5 results
      const insertResult = db.prepare('INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)');
      for (let i = 0; i < 5; i++) {
        insertResult.run(userId, exerciseId, 80 + i, 100 + i);
      }
      
      expect(getRecentActivities(3)).toHaveLength(3);
      expect(getRecentActivities(5)).toHaveLength(5);
      expect(getRecentActivities(10)).toHaveLength(5);
    });

    it('returns activities sorted by completed_at DESC', () => {
      const db = getDatabase();
      
      // Create user
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const userId = insertUser.run('User 1', 'user1@test.com', 'hash1').lastInsertRowid;
      
      // Create exercise
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels) VALUES (?, ?, ?)');
      const exerciseId = insertExercise.run('Exercise 1', 'reading', 'easy').lastInsertRowid;
      
      // Create results with specific timestamps
      db.exec(`
        INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm, completed_at) 
        VALUES 
          (${userId}, ${exerciseId}, 80, 100, '2024-01-01 10:00:00'),
          (${userId}, ${exerciseId}, 85, 110, '2024-01-03 10:00:00'),
          (${userId}, ${exerciseId}, 90, 120, '2024-01-02 10:00:00')
      `);
      
      const activities = getRecentActivities(5);
      
      expect(activities[0].score).toBe(85); // Most recent
      expect(activities[1].score).toBe(90); // Second most recent
      expect(activities[2].score).toBe(80); // Oldest
    });
  });

  describe('getPopularExercises', () => {
    it('returns empty array when no exercises exist', () => {
      expect(getPopularExercises(4)).toEqual([]);
    });

    it('returns exercises sorted by completion count', () => {
      const db = getDatabase();
      
      // Create users
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const user1Id = insertUser.run('User 1', 'user1@test.com', 'hash1').lastInsertRowid;
      const user2Id = insertUser.run('User 2', 'user2@test.com', 'hash2').lastInsertRowid;
      const user3Id = insertUser.run('User 3', 'user3@test.com', 'hash3').lastInsertRowid;
      
      // Create exercises
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels, description) VALUES (?, ?, ?, ?)');
      const exercise1Id = insertExercise.run('Popular Exercise', 'reading', 'easy', 'Most popular').lastInsertRowid;
      const exercise2Id = insertExercise.run('Medium Exercise', 'reading', 'medium', 'Medium popularity').lastInsertRowid;
      const exercise3Id = insertExercise.run('Unpopular Exercise', 'reading', 'hard', 'Least popular').lastInsertRowid;
      
      // Create results with different counts
      const insertResult = db.prepare('INSERT INTO user_exercise_results (user_id, exercise_id, score, wpm) VALUES (?, ?, ?, ?)');
      
      // Exercise 1: 3 completions
      insertResult.run(user1Id, exercise1Id, 85, 120);
      insertResult.run(user2Id, exercise1Id, 90, 130);
      insertResult.run(user3Id, exercise1Id, 95, 140);
      
      // Exercise 2: 1 completion
      insertResult.run(user1Id, exercise2Id, 80, 110);
      
      // Exercise 3: 0 completions
      
      const popular = getPopularExercises(4);
      
      expect(popular).toHaveLength(3);
      expect(popular[0]).toMatchObject({
        id: Number(exercise1Id),
        title: 'Popular Exercise',
        completion_count: 3,
      });
      expect(popular[1]).toMatchObject({
        id: Number(exercise2Id),
        title: 'Medium Exercise',
        completion_count: 1,
      });
      expect(popular[2]).toMatchObject({
        id: Number(exercise3Id),
        title: 'Unpopular Exercise',
        completion_count: 0,
      });
    });

    it('respects the limit parameter', () => {
      const db = getDatabase();
      
      // Create exercises
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels) VALUES (?, ?, ?)');
      for (let i = 0; i < 5; i++) {
        insertExercise.run(`Exercise ${i}`, 'reading', 'easy');
      }
      
      expect(getPopularExercises(2)).toHaveLength(2);
      expect(getPopularExercises(4)).toHaveLength(4);
      expect(getPopularExercises(10)).toHaveLength(5);
    });

    it('includes exercises with zero completions', () => {
      const db = getDatabase();
      
      // Create exercise without any completions
      const insertExercise = db.prepare('INSERT INTO exercises (title, type, difficulty_levels) VALUES (?, ?, ?)');
      insertExercise.run('New Exercise', 'reading', 'easy');
      
      const popular = getPopularExercises(4);
      
      expect(popular).toHaveLength(1);
      expect(popular[0].completion_count).toBe(0);
    });
  });
});
