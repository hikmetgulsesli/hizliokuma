import { getDatabase, closeDatabase } from '../lib/db/connection';
import { createSchema, dropSchema } from '../lib/db/schema';
import { seedDatabase } from '../lib/db/seed';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Schema', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'hizliokuma.db');

  beforeAll(() => {
    // Ensure clean state
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Remove WAL files if they exist
    const walPath = testDbPath + '-wal';
    const shmPath = testDbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    createSchema();
  });

  afterEach(() => {
    dropSchema();
    closeDatabase();
    // Clean up for next test
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Database File', () => {
    it('should create database file at data/hizliokuma.db', () => {
      expect(fs.existsSync(testDbPath)).toBe(true);
    });
  });

  describe('Users Table', () => {
    it('should create users table with correct columns', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string; type: string; notnull: number; dflt_value: any }>;
      
      const columnMap = new Map(columns.map(c => [c.name, c]));
      
      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.has('name')).toBe(true);
      expect(columnMap.has('email')).toBe(true);
      expect(columnMap.has('password_hash')).toBe(true);
      expect(columnMap.has('level')).toBe(true);
      expect(columnMap.has('points')).toBe(true);
      expect(columnMap.has('streak_days')).toBe(true);
      expect(columnMap.has('created_at')).toBe(true);
      expect(columnMap.has('updated_at')).toBe(true);
    });

    it('should have correct column types for users', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string; type: string }>;
      const columnMap = new Map(columns.map(c => [c.name, c.type]));
      
      expect(columnMap.get('id')).toBe('INTEGER');
      expect(columnMap.get('name')).toBe('TEXT');
      expect(columnMap.get('email')).toBe('TEXT');
      expect(columnMap.get('password_hash')).toBe('TEXT');
      expect(columnMap.get('level')).toBe('INTEGER');
      expect(columnMap.get('points')).toBe('INTEGER');
      expect(columnMap.get('streak_days')).toBe('INTEGER');
    });

    it('should enforce NOT NULL on required fields', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string; notnull: number }>;
      const columnMap = new Map(columns.map(c => [c.name, c.notnull]));
      
      expect(columnMap.get('name')).toBe(1);
      expect(columnMap.get('email')).toBe(1);
      expect(columnMap.get('password_hash')).toBe(1);
    });

    it('should have unique constraint on email', () => {
      const db = getDatabase();
      const indexes = db.prepare("PRAGMA index_list(users)").all() as Array<{ name: string; unique: number }>;
      const uniqueIndexes = indexes.filter(idx => idx.unique === 1);
      
      const indexInfo = db.prepare("PRAGMA index_info(sqlite_autoindex_users_1)").all() as Array<{ name: string }>;
      const hasEmailUnique = indexInfo.some(idx => idx.name === 'email');
      expect(hasEmailUnique).toBe(true);
    });
  });

  describe('Exercises Table', () => {
    it('should create exercises table with correct columns', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(exercises)").all() as Array<{ name: string }>;
      const columnNames = columns.map(c => c.name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('type');
      expect(columnNames).toContain('difficulty_levels');
      expect(columnNames).toContain('duration_minutes');
      expect(columnNames).toContain('is_active');
    });

    it('should have correct column types for exercises', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(exercises)").all() as Array<{ name: string; type: string }>;
      const columnMap = new Map(columns.map(c => [c.name, c.type]));
      
      expect(columnMap.get('id')).toBe('INTEGER');
      expect(columnMap.get('title')).toBe('TEXT');
      expect(columnMap.get('description')).toBe('TEXT');
      expect(columnMap.get('type')).toBe('TEXT');
      expect(columnMap.get('difficulty_levels')).toBe('TEXT');
      expect(columnMap.get('duration_minutes')).toBe('INTEGER');
      expect(columnMap.get('is_active')).toBe('BOOLEAN');
    });
  });

  describe('User Exercise Results Table', () => {
    it('should create user_exercise_results table with correct columns', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(user_exercise_results)").all() as Array<{ name: string }>;
      const columnNames = columns.map(c => c.name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('exercise_id');
      expect(columnNames).toContain('score');
      expect(columnNames).toContain('wpm');
      expect(columnNames).toContain('completed_at');
    });

    it('should have foreign key constraints', () => {
      const db = getDatabase();
      const foreignKeys = db.prepare("PRAGMA foreign_key_list(user_exercise_results)").all() as Array<{ table: string; from: string; to: string }>;
      
      const userFk = foreignKeys.find(fk => fk.from === 'user_id');
      const exerciseFk = foreignKeys.find(fk => fk.from === 'exercise_id');
      
      expect(userFk).toBeDefined();
      expect(userFk?.table).toBe('users');
      expect(userFk?.to).toBe('id');
      
      expect(exerciseFk).toBeDefined();
      expect(exerciseFk?.table).toBe('exercises');
      expect(exerciseFk?.to).toBe('id');
    });
  });

  describe('Rewards Table', () => {
    it('should create rewards table with correct columns', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(rewards)").all() as Array<{ name: string }>;
      const columnNames = columns.map(c => c.name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('type');
      expect(columnNames).toContain('threshold');
      expect(columnNames).toContain('icon');
    });

    it('should have correct column types for rewards', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(rewards)").all() as Array<{ name: string; type: string }>;
      const columnMap = new Map(columns.map(c => [c.name, c.type]));
      
      expect(columnMap.get('id')).toBe('INTEGER');
      expect(columnMap.get('title')).toBe('TEXT');
      expect(columnMap.get('description')).toBe('TEXT');
      expect(columnMap.get('type')).toBe('TEXT');
      expect(columnMap.get('threshold')).toBe('INTEGER');
      expect(columnMap.get('icon')).toBe('TEXT');
    });
  });

  describe('User Rewards Table', () => {
    it('should create user_rewards table with correct columns', () => {
      const db = getDatabase();
      const columns = db.prepare("PRAGMA table_info(user_rewards)").all() as Array<{ name: string }>;
      const columnNames = columns.map(c => c.name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('reward_id');
      expect(columnNames).toContain('earned_at');
    });

    it('should have foreign key constraints', () => {
      const db = getDatabase();
      const foreignKeys = db.prepare("PRAGMA foreign_key_list(user_rewards)").all() as Array<{ table: string; from: string; to: string }>;
      
      const userFk = foreignKeys.find(fk => fk.from === 'user_id');
      const rewardFk = foreignKeys.find(fk => fk.from === 'reward_id');
      
      expect(userFk).toBeDefined();
      expect(userFk?.table).toBe('users');
      
      expect(rewardFk).toBeDefined();
      expect(rewardFk?.table).toBe('rewards');
    });

    it('should have unique constraint on user_id and reward_id combination', () => {
      const db = getDatabase();
      const indexes = db.prepare("PRAGMA index_list(user_rewards)").all() as Array<{ name: string; unique: number }>;
      const uniqueIndex = indexes.find(idx => idx.unique === 1);
      expect(uniqueIndex).toBeDefined();
    });
  });

  describe('Indexes', () => {
    it('should create index on users.email', () => {
      const db = getDatabase();
      const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_email'").get();
      expect(indexes).toBeDefined();
    });

    it('should create indexes on user_exercise_results foreign keys', () => {
      const db = getDatabase();
      const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all() as Array<{ name: string }>;
      const indexNames = indexes.map(i => i.name);
      
      expect(indexNames).toContain('idx_user_exercise_results_user_id');
      expect(indexNames).toContain('idx_user_exercise_results_exercise_id');
    });

    it('should create indexes on user_rewards foreign keys', () => {
      const db = getDatabase();
      const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all() as Array<{ name: string }>;
      const indexNames = indexes.map(i => i.name);
      
      expect(indexNames).toContain('idx_user_rewards_user_id');
      expect(indexNames).toContain('idx_user_rewards_reward_id');
    });
  });

  describe('Seed Data', () => {
    it('should seed at least 10 users', () => {
      seedDatabase();
      const db = getDatabase();
      const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      expect(count.count).toBeGreaterThanOrEqual(10);
    });

    it('should seed at least 10 exercises', () => {
      seedDatabase();
      const db = getDatabase();
      const count = db.prepare('SELECT COUNT(*) as count FROM exercises').get() as { count: number };
      expect(count.count).toBeGreaterThanOrEqual(10);
    });

    it('should seed rewards', () => {
      seedDatabase();
      const db = getDatabase();
      const count = db.prepare('SELECT COUNT(*) as count FROM rewards').get() as { count: number };
      expect(count.count).toBeGreaterThan(0);
    });

    it('should seed user exercise results', () => {
      seedDatabase();
      const db = getDatabase();
      const count = db.prepare('SELECT COUNT(*) as count FROM user_exercise_results').get() as { count: number };
      expect(count.count).toBeGreaterThan(0);
    });

    it('should seed user rewards', () => {
      seedDatabase();
      const db = getDatabase();
      const count = db.prepare('SELECT COUNT(*) as count FROM user_rewards').get() as { count: number };
      expect(count.count).toBeGreaterThan(0);
    });

    it('should not duplicate seed data on subsequent runs', () => {
      seedDatabase();
      seedDatabase(); // Run again
      const db = getDatabase();
      const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      // Should still be the same count, not doubled
      expect(count.count).toBe(12);
    });
  });

  describe('Data Integrity', () => {
    beforeEach(() => {
      seedDatabase();
    });

    it('should enforce unique email constraint', () => {
      const db = getDatabase();
      expect(() => {
        db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
          .run('Test User', 'ahmet@example.com', 'somehash');
      }).toThrow();
    });

    it('should cascade delete user_exercise_results when user is deleted', () => {
      const db = getDatabase();
      const beforeCount = db.prepare('SELECT COUNT(*) as count FROM user_exercise_results WHERE user_id = 1').get() as { count: number };
      expect(beforeCount.count).toBeGreaterThan(0);
      
      db.prepare('DELETE FROM users WHERE id = 1').run();
      
      const afterCount = db.prepare('SELECT COUNT(*) as count FROM user_exercise_results WHERE user_id = 1').get() as { count: number };
      expect(afterCount.count).toBe(0);
    });

    it('should prevent duplicate user rewards', () => {
      const db = getDatabase();
      expect(() => {
        db.prepare('INSERT INTO user_rewards (user_id, reward_id) VALUES (1, 1)').run();
      }).toThrow();
    });
  });
});
