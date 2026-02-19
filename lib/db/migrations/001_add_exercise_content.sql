-- Migration: Add exercise_content table
-- Created: 2024-01-19

-- Create exercise_content table
CREATE TABLE IF NOT EXISTS exercise_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  word_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exercise_content
CREATE INDEX IF NOT EXISTS idx_exercise_content_type ON exercise_content(type);
CREATE INDEX IF NOT EXISTS idx_exercise_content_difficulty ON exercise_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercise_content_is_active ON exercise_content(is_active);

-- Down migration (rollback)
-- DROP TABLE IF EXISTS exercise_content;
