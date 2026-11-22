-- Prepared schema for the authenticated server phase; not applied to the static prototype.
-- The existing users table is expected to provide users(id).
CREATE TABLE IF NOT EXISTS user_growth_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sport_plan TEXT NOT NULL DEFAULT '',
  current_book TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS daily_growth_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date TEXT NOT NULL,           -- Gregorian YYYY-MM-DD, stable unique key
  report_date_jalali TEXT NOT NULL,    -- Persian YYYY-MM-DD displayed to members
  time_zone TEXT NOT NULL,
  sport_hours REAL NOT NULL CHECK(sport_hours BETWEEN 0 AND 24),
  reading_pages INTEGER NOT NULL CHECK(reading_pages BETWEEN 0 AND 10000),
  skill_title TEXT NOT NULL DEFAULT '',
  learned TEXT NOT NULL DEFAULT '',
  practice TEXT NOT NULL DEFAULT '',
  responsibility TEXT NOT NULL DEFAULT '',
  leisure TEXT NOT NULL DEFAULT '' CHECK(leisure IN ('','خواب','ورزش','بازی','شبکه‌های اجتماعی')),
  sport_plan_at_report TEXT NOT NULL DEFAULT '',
  current_book_at_report TEXT NOT NULL DEFAULT '',
  proof_storage_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, report_date)
);
CREATE INDEX IF NOT EXISTS daily_growth_date_idx ON daily_growth_reports(report_date);
