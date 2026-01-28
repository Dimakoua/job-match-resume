-- Migration: Create users table
CREATE TABLE Users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  google_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Create resumes table
CREATE TABLE Resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON stored as TEXT
  template_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Migration: Create templates table
CREATE TABLE Templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE UNIQUE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_google_id ON Users(google_id);
CREATE INDEX idx_resumes_user_id ON Resumes(user_id);
CREATE INDEX idx_resumes_template_id ON Resumes(template_id);
CREATE UNIQUE INDEX idx_templates_name ON Templates(name);