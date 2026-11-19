-- Cloudflare D1 Migration: Initial Schema for WWM DPS Calculator
-- Table for stored builds
CREATE TABLE IF NOT EXISTS builds (
  shortId TEXT PRIMARY KEY,
  editToken TEXT NOT NULL,
  title TEXT,
  author TEXT,
  classId TEXT,
  dps REAL,
  data TEXT NOT NULL,
  ownerId TEXT,
  createdAt INTEGER NOT NULL,
  lastUpdated INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_builds_ownerId ON builds(ownerId);
CREATE INDEX IF NOT EXISTS idx_builds_lastUpdated ON builds(lastUpdated);

-- Table for users authenticated with Google
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  picture TEXT,
  createdAt INTEGER NOT NULL
);

-- Table for user sessions (30 days validity)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
