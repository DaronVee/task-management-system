"""
Task Management System - Supabase Sync Layer

Simple sync layer for pushing/pulling tasks to/from Supabase.
Handles real-time subscriptions and local file caching.
"""

import os
import json
import asyncio
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

from models import Task, DailyTasks, DaySummary

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')


@dataclass
class SyncResult:
    """Result of a sync operation"""
    success: bool
    message: str
    data: Optional[Dict] = None
    error: Optional[str] = None


class TaskSync:
    """Main sync class for Supabase operations"""

    def __init__(self, data_dir: str = "data"):
        """Initialize sync client"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')

        if not self.supabase_url or not self.supabase_key:
            raise ValueError(
                "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY in .env file"
            )

        try:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        except Exception as e:
            raise ConnectionError(f"Failed to connect to Supabase: {e}")

        # Set up local data directories
        self.data_dir = Path(data_dir)
        self.daily_dir = self.data_dir / "daily"
        self.processed_dir = self.data_dir / "processed"
        self.reports_dir = self.data_dir / "reports"

        # Ensure directories exist
        for directory in [self.daily_dir, self.processed_dir, self.reports_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        self.active_subscriptions = []

    def _save_local_copy(self, daily_tasks: DailyTasks) -> None:
        """Save a local copy of daily tasks"""
        file_path = self.daily_dir / f"{daily_tasks.date}.json"
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(daily_tasks.model_dump(), f, indent=2, default=str)
        except Exception as e:
            print(f"Warning: Failed to save local copy: {e}")

    def _load_local_copy(self, target_date: str) -> Optional[DailyTasks]:
        """Load tasks from local cache"""
        file_path = self.daily_dir / f"{target_date}.json"
        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return DailyTasks(**data)
        except Exception as e:
            print(f"Warning: Failed to load local copy: {e}")
        return None

    def push_tasks(self, tasks: List[Task], target_date: str = None) -> SyncResult:
        """
        Push tasks to Supabase

        Args:
            tasks: List of Task objects to push
            target_date: Date string (YYYY-MM-DD). Defaults to today.

        Returns:
            SyncResult with success/failure information
        """
        if not target_date:
            target_date = date.today().isoformat()

        try:
            # Create DailyTasks object
            daily_tasks = DailyTasks(date=target_date, tasks=tasks)
            daily_tasks.update_summary()

            # Prepare data for Supabase
            task_data = {
                'date': target_date,
                'tasks': [task.model_dump() for task in tasks],
                'summary': daily_tasks.summary.model_dump()
            }

            # Save local copy first
            self._save_local_copy(daily_tasks)

            # Push to Supabase using upsert (insert or update)
            response = self.supabase.table('daily_tasks').upsert(task_data).execute()

            if response.data:
                return SyncResult(
                    success=True,
                    message=f"Successfully pushed {len(tasks)} tasks for {target_date}",
                    data=response.data[0] if response.data else None
                )
            else:
                return SyncResult(
                    success=False,
                    message=f"Failed to push tasks for {target_date}",
                    error="No data returned from Supabase"
                )

        except Exception as e:
            return SyncResult(
                success=False,
                message=f"Error pushing tasks for {target_date}",
                error=str(e)
            )

    def pull_tasks(self, target_date: str = None, use_cache: bool = True) -> SyncResult:
        """
        Pull tasks from Supabase

        Args:
            target_date: Date string (YYYY-MM-DD). Defaults to today.
            use_cache: Whether to try local cache first

        Returns:
            SyncResult with tasks data
        """
        if not target_date:
            target_date = date.today().isoformat()

        try:
            # Try local cache first if requested
            if use_cache:
                local_data = self._load_local_copy(target_date)
                if local_data:
                    return SyncResult(
                        success=True,
                        message=f"Loaded {len(local_data.tasks)} tasks from local cache for {target_date}",
                        data=local_data.model_dump()
                    )

            # Pull from Supabase
            response = self.supabase.table('daily_tasks')\
                .select('*')\
                .eq('date', target_date)\
                .single()\
                .execute()

            if response.data:
                # Create DailyTasks object for validation
                daily_tasks = DailyTasks(
                    date=response.data['date'],
                    tasks=[Task(**task) for task in response.data['tasks']],
                    summary=DaySummary(**response.data.get('summary', {}))
                )

                # Update local cache
                self._save_local_copy(daily_tasks)

                return SyncResult(
                    success=True,
                    message=f"Pulled {len(daily_tasks.tasks)} tasks for {target_date}",
                    data=daily_tasks.model_dump()
                )
            else:
                return SyncResult(
                    success=False,
                    message=f"No tasks found for {target_date}",
                    data={'date': target_date, 'tasks': [], 'summary': {}}
                )

        except Exception as e:
            # Try local cache as fallback
            if not use_cache:
                local_data = self._load_local_copy(target_date)
                if local_data:
                    return SyncResult(
                        success=True,
                        message=f"Loaded {len(local_data.tasks)} tasks from local cache (Supabase unavailable)",
                        data=local_data.model_dump()
                    )

            return SyncResult(
                success=False,
                message=f"Error pulling tasks for {target_date}",
                error=str(e)
            )

    def update_task(self, task_id: str, updates: Dict[str, Any], target_date: str = None) -> SyncResult:
        """
        Update a specific task

        Args:
            task_id: ID of the task to update
            updates: Dictionary of fields to update
            target_date: Date of the task list. Defaults to today.

        Returns:
            SyncResult with update information
        """
        if not target_date:
            target_date = date.today().isoformat()

        try:
            # Pull current tasks
            result = self.pull_tasks(target_date)
            if not result.success:
                return result

            daily_tasks = DailyTasks(**result.data)

            # Find and update the task
            task_found = False
            for task in daily_tasks.tasks:
                if task.id == task_id:
                    # Apply updates
                    for key, value in updates.items():
                        if hasattr(task, key):
                            setattr(task, key, value)
                    task.updated_at = datetime.now().isoformat()
                    task_found = True
                    break

            if not task_found:
                return SyncResult(
                    success=False,
                    message=f"Task {task_id} not found in {target_date}",
                    error="Task not found"
                )

            # Push updated tasks
            return self.push_tasks(daily_tasks.tasks, target_date)

        except Exception as e:
            return SyncResult(
                success=False,
                message=f"Error updating task {task_id}",
                error=str(e)
            )

    def subscribe_to_changes(self, callback: Callable[[Dict], None], target_date: str = None) -> str:
        """
        Subscribe to real-time changes for a specific date

        NOTE: Realtime is not available in all Supabase plans.
        This method will gracefully degrade to polling if realtime is unavailable.

        Args:
            callback: Function to call when changes occur
            target_date: Date to monitor. Defaults to today.

        Returns:
            Subscription ID for later unsubscribing
        """
        if not target_date:
            target_date = date.today().isoformat()

        def handle_change(payload):
            """Handle real-time change events"""
            try:
                if payload.get('new', {}).get('date') == target_date:
                    # Update local cache
                    data = payload['new']
                    daily_tasks = DailyTasks(
                        date=data['date'],
                        tasks=[Task(**task) for task in data['tasks']],
                        summary=DaySummary(**data.get('summary', {}))
                    )
                    self._save_local_copy(daily_tasks)

                    # Call user callback
                    callback(payload)
            except Exception as e:
                print(f"Error handling real-time change: {e}")

        try:
            # Try to set up realtime subscription
            channel = self.supabase.channel(f'task_changes_{target_date}')\
                .on('postgres_changes',
                    {'event': '*', 'schema': 'public', 'table': 'daily_tasks'},
                    handle_change)\
                .subscribe()

            subscription_id = f"sub_{len(self.active_subscriptions)}"
            self.active_subscriptions.append((subscription_id, channel))

            print(f"✅ Realtime subscription created for {target_date}")
            return subscription_id

        except Exception as e:
            print(f"⚠️  Realtime not available: {e}")
            print("💡 Tip: Use polling or manual refresh in frontend instead")
            return ""

    def unsubscribe(self, subscription_id: str) -> bool:
        """Unsubscribe from real-time changes"""
        try:
            for i, (sub_id, channel) in enumerate(self.active_subscriptions):
                if sub_id == subscription_id:
                    self.supabase.remove_channel(channel)
                    del self.active_subscriptions[i]
                    return True
            return False
        except Exception as e:
            print(f"Error unsubscribing: {e}")
            return False

    def cleanup(self) -> None:
        """Clean up all active subscriptions"""
        for _, channel in self.active_subscriptions:
            try:
                self.supabase.remove_channel(channel)
            except Exception as e:
                print(f"Error cleaning up subscription: {e}")
        self.active_subscriptions.clear()

    def get_task_history(self, days: int = 7) -> List[Dict]:
        """Get task history for the last N days"""
        history = []
        current_date = date.today()

        for i in range(days):
            target_date = (current_date - datetime.timedelta(days=i)).isoformat()
            result = self.pull_tasks(target_date, use_cache=True)
            if result.success and result.data:
                history.append(result.data)

        return history


# CLI Interface
def main():
    """Command-line interface for sync operations"""
    import sys
    import argparse

    parser = argparse.ArgumentParser(description='Task Management Sync CLI')
    parser.add_argument('command', choices=['push', 'pull', 'watch', 'update', 'history'],
                       help='Command to execute')
    parser.add_argument('--date', '-d', type=str,
                       help='Date in YYYY-MM-DD format (default: today)')
    parser.add_argument('--task-id', type=str,
                       help='Task ID for update operations')
    parser.add_argument('--file', '-f', type=str,
                       help='JSON file path for push operations')
    parser.add_argument('--days', type=int, default=7,
                       help='Number of days for history (default: 7)')

    args = parser.parse_args()

    try:
        sync = TaskSync()
        target_date = args.date or date.today().isoformat()

        if args.command == 'push':
            # Push tasks from file
            file_path = args.file or 'data/processed/tasks.json'
            if not os.path.exists(file_path):
                print(f"Error: File {file_path} not found")
                sys.exit(1)

            with open(file_path, 'r') as f:
                task_data = json.load(f)

            if isinstance(task_data, list):
                tasks = [Task(**t) for t in task_data]
            else:
                # Assume it's a DailyTasks object
                daily_tasks = DailyTasks(**task_data)
                tasks = daily_tasks.tasks

            result = sync.push_tasks(tasks, target_date)
            print(f"[OK] {result.message}" if result.success else f"[FAIL] {result.message}")

        elif args.command == 'pull':
            # Pull tasks for date
            result = sync.pull_tasks(target_date, use_cache=False)
            if result.success:
                print(f"[OK] {result.message}")
                print(json.dumps(result.data, indent=2, default=str))
            else:
                print(f"[FAIL] {result.message}")

        elif args.command == 'watch':
            # Watch for real-time changes
            def on_change(payload):
                event = payload.get('eventType', 'unknown')
                new_data = payload.get('new', {})
                date_changed = new_data.get('date', 'unknown')
                print(f"Tasks updated for {date_changed} (event: {event})")

            subscription_id = sync.subscribe_to_changes(on_change, target_date)
            if subscription_id:
                print(f"Watching for changes on {target_date}... Press Ctrl+C to stop")
                try:
                    while True:
                        import time
                        time.sleep(1)
                except KeyboardInterrupt:
                    sync.unsubscribe(subscription_id)
                    print("\nStopped watching")
            else:
                print("[FAIL] Failed to start watching")

        elif args.command == 'history':
            # Get task history
            history = sync.get_task_history(args.days)
            print(f"Task history for last {args.days} days:")
            for day_data in history:
                summary = day_data.get('summary', {})
                total = summary.get('total_tasks', 0)
                completed = summary.get('completed_tasks', 0)
                date_str = day_data.get('date', 'unknown')
                print(f"  {date_str}: {completed}/{total} tasks completed")

        else:
            print(f"[FAIL] Unknown command: {args.command}")
            sys.exit(1)

    except Exception as e:
        print(f"[FAIL] Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()