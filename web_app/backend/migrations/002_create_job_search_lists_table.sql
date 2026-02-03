-- Migration: Create job_search_lists table
CREATE TABLE JobSearchLists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create indexes for performance
CREATE INDEX idx_job_search_lists_user_id ON JobSearchLists(user_id);