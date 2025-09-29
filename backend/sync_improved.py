#!/usr/bin/env python3
"""
Improved Task Management System - Supabase Sync Layer
with comprehensive error handling and recovery procedures.

This script addresses all the issues encountered in the original sync.py:
1. Pydantic V2 compatibility (.model_dump() instead of .dict())
2. Proper environment variable loading
3. Database constraint handling (UPDATE vs INSERT)
4. Better error reporting and recovery
"""

import os
import json
import sys
import traceback
from datetime import date, datetime
from typing import List, Dict, Optional, Callable, Any
from pathlib import Path
from dataclasses import dataclass

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing dependencies: {e}")
    print("Install with: pip install supabase python-dotenv")
    exit(1)

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))
from models import Task, DailyTasks, DaySummary

# Load environment variables from backend/.env (FIXED PATH)
load_dotenv(Path(__file__).parent / '.env')

@dataclass
class SyncResult:
    """Enhanced result of a sync operation with detailed error info"""
    success: bool
    message: str
    data: Optional[Dict] = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    suggested_fix: Optional[str] = None

class ImprovedTaskSync:
    """Enhanced sync class with comprehensive error handling"""

    def __init__(self, data_dir: str = "data"):
        """Initialize sync client with enhanced error checking"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')

        # Enhanced environment validation
        if not self.supabase_url:
            raise ValueError(
                "SUPABASE_URL not found. Check that backend/.env exists and contains SUPABASE_URL=your-url"
            )
        if not self.supabase_key:
            raise ValueError(
                "SUPABASE_KEY not found. Check that backend/.env exists and contains SUPABASE_KEY=your-key"
            )

        try:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        except Exception as e:
            raise ValueError(f"Failed to create Supabase client: {e}")

        # Set up directory paths
        self.data_dir = Path(data_dir)
        self.daily_dir = self.data_dir / "daily"
        self.processed_dir = self.data_dir / "processed"

        # Ensure directories exist
        self.daily_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def test_connection(self) -> SyncResult:
        """Test Supabase connection with detailed diagnostics"""
        try:
            # Test basic connection
            response = self.supabase.table('daily_tasks').select('date').limit(1).execute()

            return SyncResult(
                success=True,
                message="Supabase connection successful",
                data={"connection": "ok", "table_access": "ok"}
            )
        except Exception as e:
            return SyncResult(
                success=False,
                message="Supabase connection failed",
                error=str(e),
                error_type="connection_error",
                suggested_fix="Check SUPABASE_URL and SUPABASE_KEY in backend/.env"
            )

    def _record_exists(self, target_date: str) -> bool:
        """Check if a record already exists for the given date"""
        try:
            response = self.supabase.table('daily_tasks')\
                .select('date')\
                .eq('date', target_date)\
                .execute()

            return len(response.data) > 0
        except Exception:
            return False

    def _save_local_copy(self, daily_tasks: DailyTasks) -> None:
        """Save a local copy with error handling"""
        file_path = self.daily_dir / f"{daily_tasks.date}.json"
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                # FIXED: Use model_dump() instead of .dict()
                json.dump(daily_tasks.model_dump(), f, indent=2, default=str)
            print(f"✅ Local copy saved: {file_path}")
        except Exception as e:
            print(f"⚠️ Warning: Failed to save local copy: {e}")

    def _load_local_copy(self, target_date: str) -> Optional[DailyTasks]:
        """Load local copy with validation"""
        file_path = self.daily_dir / f"{target_date}.json"
        if not file_path.exists():
            return None

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Validate with Pydantic model
            return DailyTasks(**data)
        except Exception as e:
            print(f"⚠️ Warning: Failed to load local copy: {e}")
            return None

    def push_tasks_smart(self, tasks: List[Task], target_date: str = None) -> SyncResult:
        """
        Smart push that handles existing records properly

        This method:
        1. Checks if record exists
        2. Uses UPDATE if exists, INSERT if new
        3. Handles constraint violations gracefully
        4. Provides detailed error reporting
        """
        if not target_date:
            target_date = date.today().isoformat()

        try:
            # Create DailyTasks object
            daily_tasks = DailyTasks(date=target_date, tasks=tasks)
            daily_tasks.update_summary()

            # Prepare data for Supabase (FIXED: Use model_dump())
            task_data = {
                'date': target_date,
                'tasks': [task.model_dump() for task in tasks],
                'summary': daily_tasks.summary.model_dump()
            }

            # Save local copy first
            self._save_local_copy(daily_tasks)

            # Check if record exists
            record_exists = self._record_exists(target_date)

            if record_exists:
                print(f"📝 Updating existing record for {target_date}")
                response = self.supabase.table('daily_tasks')\
                    .update(task_data)\
                    .eq('date', target_date)\
                    .execute()
            else:
                print(f"➕ Creating new record for {target_date}")
                response = self.supabase.table('daily_tasks')\
                    .insert(task_data)\
                    .execute()

            if response.data:
                return SyncResult(
                    success=True,
                    message=f"✅ Successfully {'updated' if record_exists else 'created'} {len(tasks)} tasks for {target_date}",
                    data=response.data[0] if response.data else None
                )
            else:
                return SyncResult(
                    success=False,
                    message=f"❌ Failed to sync tasks for {target_date}",
                    error="No data returned from Supabase",
                    error_type="database_error",
                    suggested_fix="Check Supabase table permissions and schema"
                )

        except Exception as e:
            error_message = str(e)
            error_type = "unknown_error"
            suggested_fix = "Check logs for details"

            # Provide specific fixes for common errors
            if "duplicate key" in error_message.lower():
                error_type = "constraint_violation"
                suggested_fix = "Record already exists. Try using UPDATE instead of INSERT."
            elif "permission" in error_message.lower():
                error_type = "permission_error"
                suggested_fix = "Check Supabase API key permissions"
            elif "network" in error_message.lower() or "connection" in error_message.lower():
                error_type = "network_error"
                suggested_fix = "Check internet connection and Supabase URL"

            return SyncResult(
                success=False,
                message=f"❌ Error syncing tasks for {target_date}",
                error=error_message,
                error_type=error_type,
                suggested_fix=suggested_fix
            )

    def push_tasks_from_file(self, target_date: str = None) -> SyncResult:
        """Push tasks from local daily file with validation"""
        if not target_date:
            target_date = date.today().isoformat()

        # Load from local file
        daily_tasks = self._load_local_copy(target_date)
        if not daily_tasks:
            return SyncResult(
                success=False,
                message=f"❌ No local file found for {target_date}",
                error_type="file_not_found",
                suggested_fix=f"Create data/daily/{target_date}.json with task data"
            )

        return self.push_tasks_smart(daily_tasks.tasks, target_date)

    def pull_tasks(self, target_date: str = None, use_cache: bool = False) -> SyncResult:
        """Pull tasks from Supabase with fallback to local cache"""
        if not target_date:
            target_date = date.today().isoformat()

        try:
            # Try local cache first if requested
            if use_cache:
                local_data = self._load_local_copy(target_date)
                if local_data:
                    return SyncResult(
                        success=True,
                        message=f"📁 Loaded {len(local_data.tasks)} tasks from local cache for {target_date}",
                        data=local_data.model_dump()  # FIXED: Use model_dump()
                    )

            # Pull from Supabase
            response = self.supabase.table('daily_tasks')\
                .select('*')\
                .eq('date', target_date)\
                .execute()

            if response.data:
                # Convert to DailyTasks object for validation
                daily_tasks = DailyTasks(**response.data[0])

                # Save local copy
                self._save_local_copy(daily_tasks)

                return SyncResult(
                    success=True,
                    message=f"📥 Pulled {len(daily_tasks.tasks)} tasks for {target_date}",
                    data=daily_tasks.model_dump()  # FIXED: Use model_dump()
                )
            else:
                # Try local cache as fallback
                local_data = self._load_local_copy(target_date)
                if local_data:
                    return SyncResult(
                        success=True,
                        message=f"📁 Loaded {len(local_data.tasks)} tasks from local cache (Supabase returned no data)",
                        data=local_data.model_dump()  # FIXED: Use model_dump()
                    )

                return SyncResult(
                    success=True,
                    message=f"📭 No tasks found for {target_date}",
                    data=DailyTasks(date=target_date).model_dump()
                )

        except Exception as e:
            # Try local cache as fallback
            local_data = self._load_local_copy(target_date)
            if local_data:
                return SyncResult(
                    success=True,
                    message=f"📁 Loaded {len(local_data.tasks)} tasks from local cache (Supabase error: {str(e)})",
                    data=local_data.model_dump()  # FIXED: Use model_dump()
                )

            return SyncResult(
                success=False,
                message=f"❌ Error pulling tasks for {target_date}",
                error=str(e),
                error_type="database_error",
                suggested_fix="Check connection and try local cache"
            )

def main():
    """Enhanced CLI interface with better error reporting"""
    if len(sys.argv) < 2:
        print("Usage: python sync_improved.py [push|pull|test] [date]")
        print("  push - Push tasks from local file to Supabase")
        print("  pull - Pull tasks from Supabase to local file")
        print("  test - Test Supabase connection")
        return

    command = sys.argv[1]
    target_date = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        sync = ImprovedTaskSync()

        if command == "test":
            result = sync.test_connection()
        elif command == "push":
            result = sync.push_tasks_from_file(target_date)
        elif command == "pull":
            result = sync.pull_tasks(target_date)
        else:
            print(f"❌ Unknown command: {command}")
            return

        # Enhanced result reporting
        print(f"\n{result.message}")

        if not result.success:
            print(f"🔍 Error Type: {result.error_type}")
            print(f"💡 Suggested Fix: {result.suggested_fix}")
            if result.error:
                print(f"📝 Technical Details: {result.error}")

        if result.data and command == "pull":
            tasks_count = result.data.get('summary', {}).get('total_tasks', 0)
            print(f"📊 Tasks Summary: {tasks_count} total tasks")

    except Exception as e:
        print(f"❌ FATAL ERROR: {e}")
        print("🔧 Check that:")
        print("  - backend/.env file exists with SUPABASE_URL and SUPABASE_KEY")
        print("  - You're running from the project root directory")
        print("  - All dependencies are installed: pip install supabase python-dotenv")
        if "--debug" in sys.argv:
            traceback.print_exc()

if __name__ == "__main__":
    main()