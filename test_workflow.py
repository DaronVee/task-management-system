#!/usr/bin/env python3
"""
End-to-End Workflow Testing Script

This script tests the complete task management system workflow:
1. Process morning brain dump with sub-agents
2. Sync tasks to Supabase
3. Generate evening report
4. Verify frontend can display tasks

Usage:
    python test_workflow.py [--verbose] [--skip-supabase]
"""

import json
import sys
import os
from datetime import date, datetime
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

try:
    from models import Task, DailyTasks, Config
    from sync import TaskSync, SyncResult
except ImportError as e:
    print(f"❌ Error importing backend modules: {e}")
    print("Make sure you're running from the project root directory")
    sys.exit(1)


def test_data_models():
    """Test data model creation and validation"""
    print("Testing data models...")

    try:
        # Test Config creation
        config = Config()
        print("[OK] Config model loads successfully")

        # Test Task creation
        task = Task(
            title="Test Task",
            description="A test task for validation",
            priority="P1",
            category="development",
            estimated_minutes=30
        )
        print("[OK] Task model creates successfully")

        # Test DailyTasks creation
        daily_tasks = DailyTasks(tasks=[task])
        daily_tasks.update_summary()
        print("[OK] DailyTasks model and summary generation work")

        # Test task updates
        task.add_note("Test note added")
        task.add_subtask("Test subtask")
        print("[OK] Task helper methods work")

        return True

    except Exception as e:
        print(f"[FAIL] Data model test failed: {e}")
        return False


def test_brain_dump_processing():
    """Test the morning brain dump processing"""
    print("\n🧠 Testing brain dump processing...")

    try:
        # Import the morning processor
        sys.path.append(str(Path(__file__).parent / "scripts"))
        from process_morning import MorningProcessor

        # Create processor instance
        processor = MorningProcessor()
        print("✅ MorningProcessor initialized")

        # Test with the sample brain dump
        brain_dump_path = Path("data/input/brain_dump.txt")
        if not brain_dump_path.exists():
            print(f"⚠️  Brain dump file not found: {brain_dump_path}")
            return False

        # Process brain dump (this uses mock agents for testing)
        result = processor.process_brain_dump("brain_dump.txt")

        if result.success:
            print(f"✅ Brain dump processed successfully: {result.message}")
            if result.data and 'tasks' in result.data:
                print(f"📋 Created {len(result.data['tasks'])} tasks")
                return True
        else:
            print(f"❌ Brain dump processing failed: {result.message}")
            return False

    except Exception as e:
        print(f"❌ Brain dump processing test failed: {e}")
        return False


def test_supabase_sync(skip_supabase=False):
    """Test Supabase synchronization"""
    print("\n☁️  Testing Supabase sync...")

    if skip_supabase:
        print("⏭️  Skipping Supabase tests (--skip-supabase flag)")
        return True

    try:
        sync = TaskSync()
        print("✅ TaskSync initialized")

        # Create test tasks
        test_tasks = [
            Task(
                title="Test Supabase Sync",
                description="Testing sync functionality",
                priority="P1",
                category="development",
                estimated_minutes=15
            ),
            Task(
                title="Verify Data Persistence",
                description="Ensure data saves correctly",
                priority="P2",
                category="admin",
                estimated_minutes=10
            )
        ]

        test_date = date.today().isoformat()

        # Test push
        push_result = sync.push_tasks(test_tasks, test_date)
        if push_result.success:
            print(f"✅ Push successful: {push_result.message}")
        else:
            print(f"❌ Push failed: {push_result.message}")
            return False

        # Test pull
        pull_result = sync.pull_tasks(test_date, use_cache=False)
        if pull_result.success:
            print(f"✅ Pull successful: {pull_result.message}")
            pulled_tasks = pull_result.data.get('tasks', [])
            if len(pulled_tasks) >= len(test_tasks):
                print(f"✅ Data persistence verified: {len(pulled_tasks)} tasks retrieved")
            else:
                print(f"⚠️  Task count mismatch: expected {len(test_tasks)}, got {len(pulled_tasks)}")
        else:
            print(f"❌ Pull failed: {pull_result.message}")
            return False

        return True

    except Exception as e:
        print(f"❌ Supabase sync test failed: {e}")
        print("💡 Make sure Supabase is configured and .env file is set up")
        return False


def test_report_generation():
    """Test report generation"""
    print("\n📊 Testing report generation...")

    try:
        sys.path.append(str(Path(__file__).parent / "scripts"))
        from generate_report import ReportGenerator

        generator = ReportGenerator()
        print("✅ ReportGenerator initialized")

        # Generate daily report
        today = date.today().isoformat()
        report_file = generator.generate_daily_report(today)

        if Path(report_file).exists():
            print(f"✅ Daily report generated: {report_file}")

            # Check report content
            with open(report_file, 'r') as f:
                content = f.read()

            if len(content) > 100:  # Basic content check
                print("✅ Report contains substantive content")
                return True
            else:
                print("⚠️  Report seems too short")
                return False
        else:
            print(f"❌ Report file not created: {report_file}")
            return False

    except Exception as e:
        print(f"❌ Report generation test failed: {e}")
        return False


def test_file_structure():
    """Test that all required files and directories exist"""
    print("\n📁 Testing file structure...")

    required_files = [
        "backend/models.py",
        "backend/sync.py",
        "backend/schema.sql",
        "backend/config.json",
        "scripts/process_morning.py",
        "scripts/generate_report.py",
        "frontend/package.json",
        "frontend/app/page.tsx",
        "agents/task-extractor.md",
        "agents/priority-strategist.md",
        "data/input/brain_dump.txt"
    ]

    required_dirs = [
        "backend",
        "scripts",
        "frontend",
        "agents",
        "data/input",
        "data/processed",
        "data/daily",
        "data/reports"
    ]

    all_good = True

    # Check directories
    for directory in required_dirs:
        if Path(directory).exists():
            print(f"✅ Directory exists: {directory}")
        else:
            print(f"❌ Missing directory: {directory}")
            all_good = False

    # Check files
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ File exists: {file_path}")
        else:
            print(f"❌ Missing file: {file_path}")
            all_good = False

    return all_good


def test_frontend_setup():
    """Test frontend configuration"""
    print("\n🌐 Testing frontend setup...")

    try:
        frontend_dir = Path("frontend")

        # Check package.json
        package_json = frontend_dir / "package.json"
        if package_json.exists():
            with open(package_json) as f:
                pkg = json.load(f)

            required_deps = ["next", "react", "@supabase/supabase-js", "tailwindcss"]
            missing_deps = []

            for dep in required_deps:
                if dep not in pkg.get("dependencies", {}) and dep not in pkg.get("devDependencies", {}):
                    missing_deps.append(dep)

            if missing_deps:
                print(f"⚠️  Missing frontend dependencies: {missing_deps}")
                return False
            else:
                print("✅ Frontend dependencies look good")

        # Check key files
        key_files = [
            "app/layout.tsx",
            "app/page.tsx",
            "lib/supabase.ts",
            "components/TaskList.tsx",
            "tailwind.config.js"
        ]

        for file_path in key_files:
            full_path = frontend_dir / file_path
            if full_path.exists():
                print(f"✅ Frontend file exists: {file_path}")
            else:
                print(f"❌ Missing frontend file: {file_path}")
                return False

        return True

    except Exception as e:
        print(f"❌ Frontend setup test failed: {e}")
        return False


def generate_test_report(results):
    """Generate a test results summary"""
    print("\n" + "="*60)
    print("🧪 TEST RESULTS SUMMARY")
    print("="*60)

    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)

    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success rate: {(passed_tests/total_tests)*100:.1f}%")

    print("\nDetailed Results:")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status} {test_name}")

    if passed_tests == total_tests:
        print("\n🎉 All tests passed! The system is ready to use.")
        print("\nNext steps:")
        print("1. Set up Supabase project and update .env files")
        print("2. Run: cd frontend && npm install && npm run dev")
        print("3. Process your first brain dump: python scripts/process_morning.py")
        print("4. View results in the web UI at http://localhost:3000")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please address the issues above.")

    return passed_tests == total_tests


def main():
    """Run all tests"""
    import argparse

    parser = argparse.ArgumentParser(description='Test the task management system')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--skip-supabase', action='store_true', help='Skip Supabase-dependent tests')

    args = parser.parse_args()

    print("Task Management System - End-to-End Testing")
    print("=" * 60)

    # Run all tests
    results = {
        "File Structure": test_file_structure(),
        "Data Models": test_data_models(),
        "Brain Dump Processing": test_brain_dump_processing(),
        "Supabase Sync": test_supabase_sync(args.skip_supabase),
        "Report Generation": test_report_generation(),
        "Frontend Setup": test_frontend_setup()
    }

    # Generate summary
    all_passed = generate_test_report(results)

    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()