import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.join(DB_DIR, 'edugenie.sqlite');

export const db = new DatabaseSync(DB_FILE);

// Initialize tables with schema matching EduGenie requirements
export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      education_level TEXT NOT NULL DEFAULT 'High School',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      key_points TEXT,
      follow_ups TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS explanations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      style TEXT NOT NULL,
      explanation TEXT NOT NULL,
      model_used TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      question_count INTEGER NOT NULL,
      quiz_data TEXT NOT NULL,
      score INTEGER DEFAULT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source_text TEXT NOT NULL,
      summary TEXT NOT NULL,
      length TEXT NOT NULL,
      style TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_paths (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      current_level TEXT NOT NULL,
      goal TEXT NOT NULL,
      study_time TEXT NOT NULL,
      learning_path_data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_explanations_user ON explanations(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_summaries_user ON summaries(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
  `);
}

// Activity logger helper
export function logActivity(userId: string, activityType: string, title: string, metadata: any = {}) {
  try {
    const id = randomUUID();
    const metaStr = JSON.stringify(metadata);
    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, user_id, activity_type, title, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, userId, activityType, title, metaStr);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
