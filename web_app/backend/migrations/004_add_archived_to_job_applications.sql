-- Migration: 004_add_archived_to_job_applications.sql
-- Description: Adds archived boolean column to JobApplications table for archiving functionality
-- Dependencies: JobApplications table exists

ALTER TABLE JobApplications ADD COLUMN archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1));

-- Index for efficient queries by archived status
CREATE INDEX IF NOT EXISTS idx_job_applications_archived ON JobApplications(archived);