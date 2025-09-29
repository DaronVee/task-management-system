-- Task Management System Database Schema
-- Run this in your Supabase SQL Editor

-- Core tasks table
CREATE TABLE daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    tasks JSONB NOT NULL,
    summary JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable real-time
ALTER TABLE daily_tasks REPLICA IDENTITY FULL;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_tasks_updated_at
    BEFORE UPDATE ON daily_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_daily_tasks_date ON daily_tasks(date);
CREATE INDEX idx_daily_tasks_created_at ON daily_tasks(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy for authenticated users (you can customize this based on your auth needs)
CREATE POLICY "Users can view their own tasks" ON daily_tasks
    FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO daily_tasks (date, tasks, summary) VALUES
(
    CURRENT_DATE,
    '[
        {
            "id": "sample-1",
            "title": "Set up task management system",
            "description": "Complete the initial setup of the task management system with sub-agents",
            "priority": "P1",
            "status": "in_progress",
            "progress": 30,
            "category": "development",
            "estimated_minutes": 120,
            "actual_minutes": 0,
            "subtasks": [
                {"id": "sub-1", "title": "Create database schema", "completed": true},
                {"id": "sub-2", "title": "Set up Python backend", "completed": false},
                {"id": "sub-3", "title": "Build frontend", "completed": false}
            ],
            "notes": ["Started with folder structure", "Database schema created"],
            "time_block": "morning",
            "created_at": "2025-01-29T08:00:00Z",
            "updated_at": "2025-01-29T08:30:00Z"
        },
        {
            "id": "sample-2",
            "title": "Write documentation",
            "description": "Document the sub-agent system and workflow",
            "priority": "P2",
            "status": "not_started",
            "progress": 0,
            "category": "documentation",
            "estimated_minutes": 60,
            "actual_minutes": 0,
            "subtasks": [],
            "notes": [],
            "time_block": "afternoon",
            "created_at": "2025-01-29T08:00:00Z",
            "updated_at": "2025-01-29T08:00:00Z"
        }
    ]'::jsonb,
    '{
        "total_tasks": 2,
        "completed_tasks": 0,
        "in_progress_tasks": 1,
        "total_estimated_minutes": 180,
        "completion_percentage": 15
    }'::jsonb
);