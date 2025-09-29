#!/usr/bin/env python3
"""
Direct insert script to bypass sync issues
"""

import os
import json
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv('backend/.env')

# Get Supabase credentials
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')

if not supabase_url or not supabase_key:
    print("ERROR: Missing Supabase credentials")
    exit(1)

# Create Supabase client
supabase = create_client(supabase_url, supabase_key)

# Load the task data
with open('data/daily/2025-09-29.json', 'r') as f:
    task_data = json.load(f)

print(f"Loaded {len(task_data['tasks'])} tasks for {task_data['date']}")

# First add the task back to the local file
task_data['tasks'] = [
    {
        "id": "affiliate-system-001",
        "title": "Build Affiliation System with Affiliation GPT",
        "description": "Develop the technical affiliation system using the Affiliation GPT for revenue generation",
        "priority": "P1",
        "status": "not_started",
        "progress": 0,
        "category": "development",
        "estimated_minutes": 180,
        "actual_minutes": 0,
        "time_block": "morning",
        "subtasks": [],
        "notes": [],
        "success_criteria": "Affiliation GPT deployed and functional, commission tracking system implemented",
        "dependencies": [],
        "tags": ["affiliate", "revenue", "gpt"],
        "created_at": "2025-09-29T08:00:00",
        "updated_at": "2025-09-29T08:00:00",
        "completed_at": None
    }
]

task_data['summary'] = {
    "total_tasks": 1,
    "completed_tasks": 0,
    "in_progress_tasks": 0,
    "blocked_tasks": 0,
    "total_estimated_minutes": 180,
    "total_actual_minutes": 0,
    "completion_percentage": 0.0,
    "categories": {"development": 1},
    "priorities": {"P1": 1}
}

print(f"Updated to {len(task_data['tasks'])} tasks")

# Try to update the existing record
try:
    result = supabase.table('daily_tasks').update(task_data).eq('date', '2025-09-29').execute()
    print(f"SUCCESS: Updated tasks in Supabase")
    print(f"Response: {result.data}")
except Exception as e:
    print(f"ERROR: {e}")
    # Try delete and insert
    try:
        print("Trying delete and insert...")
        supabase.table('daily_tasks').delete().eq('date', '2025-09-29').execute()
        result = supabase.table('daily_tasks').insert(task_data).execute()
        print(f"SUCCESS: Deleted and inserted tasks")
        print(f"Response: {result.data}")
    except Exception as e2:
        print(f"ERROR on delete/insert: {e2}")