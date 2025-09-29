#!/usr/bin/env python3
"""
Quick Test Script for Task Management System

Simple verification that the system components work.
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing module imports...")

    try:
        from models import Task, DailyTasks, Config
        print("[OK] Backend models imported successfully")

        from sync import TaskSync, SyncResult
        print("[OK] Backend sync module imported successfully")

        return True
    except ImportError as e:
        print(f"[FAIL] Import error: {e}")
        return False

def test_basic_functionality():
    """Test basic model functionality"""
    print("Testing basic functionality...")

    try:
        from models import Task, DailyTasks, Config

        # Test task creation
        task = Task(
            title="Test Task",
            description="A simple test task",
            priority="P1",
            category="development",
            estimated_minutes=30
        )
        print("[OK] Task creation works")

        # Test daily tasks
        daily_tasks = DailyTasks(tasks=[task])
        daily_tasks.update_summary()
        print("[OK] Daily tasks and summary generation works")

        # Test config
        config = Config()
        print("[OK] Config loading works")

        return True
    except Exception as e:
        print(f"[FAIL] Basic functionality test failed: {e}")
        return False

def test_file_structure():
    """Test that required files exist"""
    print("Testing file structure...")

    required_files = [
        "backend/models.py",
        "backend/sync.py",
        "backend/config.json",
        "backend/schema.sql",
        "frontend/package.json",
        "data/input/brain_dump.txt"
    ]

    all_good = True
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"[OK] {file_path}")
        else:
            print(f"[FAIL] Missing: {file_path}")
            all_good = False

    return all_good

def test_brain_dump():
    """Test brain dump file exists and is readable"""
    print("Testing brain dump file...")

    try:
        brain_dump_path = Path("data/input/brain_dump.txt")
        if brain_dump_path.exists():
            with open(brain_dump_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if len(content) > 10:
                print("[OK] Brain dump file exists and has content")
                return True
            else:
                print("[FAIL] Brain dump file is empty")
                return False
        else:
            print("[FAIL] Brain dump file not found")
            return False
    except Exception as e:
        print(f"[FAIL] Error reading brain dump: {e}")
        return False

def main():
    """Run all tests"""
    print("Task Management System - Quick Test")
    print("=" * 50)

    tests = [
        ("File Structure", test_file_structure),
        ("Module Imports", test_imports),
        ("Basic Functionality", test_basic_functionality),
        ("Brain Dump File", test_brain_dump)
    ]

    results = {}
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        results[test_name] = test_func()

    # Summary
    print("\n" + "=" * 50)
    print("TEST RESULTS SUMMARY")
    print("=" * 50)

    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)

    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")

    for test_name, passed in results.items():
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {test_name}")

    if passed_tests == total_tests:
        print("\nAll tests passed! System is ready for setup.")
        print("\nNext steps:")
        print("1. Set up Supabase database with schema.sql")
        print("2. Create .env files with your credentials")
        print("3. Run: cd frontend && npm run dev")
        print("4. Start using the system!")
    else:
        print(f"\n{total_tests - passed_tests} test(s) failed.")
        print("Please check the errors above.")

    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)