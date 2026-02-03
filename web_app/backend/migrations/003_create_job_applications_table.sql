-- Migration: 003_create_job_applications_table.sql
-- Description: Creates the job_applications table to store job applications with links to users, resumes, and job search lists
-- Dependencies: Users table, Resumes table, JobSearchLists table

CREATE TABLE IF NOT EXISTS JobApplications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_search_list_id TEXT,
    resume_id TEXT, -- Nullable for Chrome extension integration
    company TEXT, -- Nullable for Chrome extension integration
    position TEXT, -- Nullable for Chrome extension integration
    job_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'rejected', 'accepted', 'withdrawn')),
    applied_date INTEGER, -- Unix timestamp in milliseconds
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_search_list_id) REFERENCES JobSearchLists(id) ON DELETE SET NULL,
    FOREIGN KEY (resume_id) REFERENCES Resumes(id) ON DELETE CASCADE
);

-- Index for efficient queries by user
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON JobApplications(user_id);

-- Index for efficient queries by job search list
CREATE INDEX IF NOT EXISTS idx_job_applications_list_id ON JobApplications(job_search_list_id);

-- Index for efficient queries by resume
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_id ON JobApplications(resume_id);

-- Index for efficient queries by status
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON JobApplications(status);

-- Index for efficient queries by applied date
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_date ON JobApplications(applied_date);