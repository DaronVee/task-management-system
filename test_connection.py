#!/usr/bin/env python3
"""
Test Supabase connection without expecting data
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

def test_supabase_connection():
    """Test basic Supabase connection"""
    print("Testing Supabase connection...")

    try:
        from sync import TaskSync

        # Test connection
        sync = TaskSync()
        print("[OK] Supabase client created successfully")

        # Test database access (should work even with empty database)
        from datetime import date
        today = date.today().isoformat()

        result = sync.pull_tasks(today, use_cache=False)

        if result.success:
            task_count = len(result.data.get('tasks', [])) if result.data else 0
            print(f"[OK] Database connection successful")
            print(f"[INFO] Found {task_count} tasks for {today} (expected 0 for new database)")
            return True
        else:
            # Check if it's just "no data found" vs connection error
            if "No tasks found" in result.message:
                print("[OK] Database connection successful (no data found, which is expected)")
                return True
            else:
                print(f"[FAIL] Database error: {result.message}")
                return False

    except Exception as e:
        print(f"[FAIL] Connection failed: {e}")
        print("[INFO] Make sure your backend/.env file has correct Supabase credentials")
        return False

def test_frontend_env():
    """Check if frontend environment file exists"""
    print("Checking frontend environment setup...")

    env_file = Path("frontend/.env.local")
    if env_file.exists():
        print("[OK] frontend/.env.local exists")

        # Check if it has the required variables (without showing secrets)
        with open(env_file, 'r') as f:
            content = f.read()

        has_url = 'NEXT_PUBLIC_SUPABASE_URL' in content
        has_key = 'NEXT_PUBLIC_SUPABASE_ANON_KEY' in content

        if has_url and has_key:
            print("[OK] Required environment variables are present")
            return True
        else:
            print("[FAIL] Missing required environment variables")
            print("Need: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
            return False
    else:
        print("[FAIL] frontend/.env.local not found")
        return False

def main():
    """Run connection tests"""
    print("Supabase Connection Test")
    print("=" * 40)

    tests = [
        ("Frontend Environment", test_frontend_env),
        ("Supabase Connection", test_supabase_connection)
    ]

    results = {}
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        results[test_name] = test_func()

    # Summary
    print("\n" + "=" * 40)
    print("CONNECTION TEST RESULTS")
    print("=" * 40)

    all_passed = all(results.values())

    for test_name, passed in results.items():
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {test_name}")

    if all_passed:
        print("\n[SUCCESS] Database connection is working!")
        print("\nNext steps:")
        print("1. Start frontend: cd frontend && npm run dev")
        print("2. Open http://localhost:3000")
        print("3. You should see an empty task list (database is new)")
        print("4. Process your brain dump to add tasks")
    else:
        print("\n[ISSUES] Some tests failed. Check your .env files.")
        print("\nTroubleshooting:")
        print("- Verify Supabase credentials in backend/.env")
        print("- Verify frontend/.env.local has NEXT_PUBLIC_ variables")
        print("- Ensure you ran the database schema in Supabase")

if __name__ == "__main__":
    main()