import { getDatabase } from './connection';

export function createSchema(): void {
  const db = getDatabase();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME DEFAULT NULL
    )
  `);

  // Exercises table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      difficulty_levels TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User exercise results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_exercise_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      wpm INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    )
  `);

  // Rewards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      threshold INTEGER NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User rewards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
      UNIQUE(user_id, reward_id)
    )
  `);

  // Create indexes for foreign keys and common queries
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_exercise_results_user_id ON user_exercise_results(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_exercise_results_exercise_id ON user_exercise_results(exercise_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_exercise_results_completed_at ON user_exercise_results(completed_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_id ON user_rewards(reward_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_exercises_is_active ON exercises(is_active)');
}

export function dropSchema(): void {
  const db = getDatabase();
  db.exec('DROP TABLE IF EXISTS user_rewards');
  db.exec('DROP TABLE IF EXISTS user_exercise_results');
  db.exec('DROP TABLE IF EXISTS rewards');
  db.exec('DROP TABLE IF EXISTS exercises');
  db.exec('DROP TABLE IF EXISTS users');
}
