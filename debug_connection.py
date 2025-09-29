#!/usr/bin/env python3
"""
Debug Supabase connection issues
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

def debug_connection():
    """Debug the Supabase connection step by step"""
    print("Debugging Supabase connection...")

    try:
        # Step 1: Check environment variables
        print("\n1. Checking environment variables...")
        from dotenv import load_dotenv
        load_dotenv('backend/.env')

        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')

        if url and key:
            print(f"[OK] SUPABASE_URL: {url[:30]}...")
            print(f"[OK] SUPABASE_KEY: {key[:30]}...")
        else:
            print(f"[FAIL] Missing environment variables")
            print(f"URL: {url}")
            print(f"KEY: {key}")
            return False

        # Step 2: Test Supabase client creation
        print("\n2. Creating Supabase client...")
        from supabase import create_client
        supabase = create_client(url, key)
        print("[OK] Supabase client created")

        # Step 3: Test basic table access
        print("\n3. Testing table access...")
        from datetime import date
        today = date.today().isoformat()

        # Try a simple query
        response = supabase.table('daily_tasks').select('date').limit(1).execute()
        print(f"[OK] Table query successful")
        print(f"[INFO] Response: {response}")

        # Step 4: Try specific date query
        print(f"\n4. Testing date-specific query for {today}...")
        response = supabase.table('daily_tasks').select('*').eq('date', today).execute()
        print(f"[OK] Date query successful")
        print(f"[INFO] Found {len(response.data)} records for {today}")

        return True

    except Exception as e:
        import traceback
        print(f"[FAIL] Error: {e}")
        print("Full traceback:")
        traceback.print_exc()
        return False

def check_schema():
    """Check if database schema is properly set up"""
    print("\n5. Checking database schema...")

    try:
        from dotenv import load_dotenv
        load_dotenv('backend/.env')

        from supabase import create_client
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')

        supabase = create_client(url, key)

        # Try to describe the table structure
        # Note: This might not work depending on permissions
        try:
            response = supabase.table('daily_tasks').select('*').limit(0).execute()
            print("[OK] daily_tasks table exists and is accessible")
            return True
        except Exception as e:
            print(f"[FAIL] Table access issue: {e}")
            print("[INFO] This might mean the schema wasn't created or permissions issue")
            return False

    except Exception as e:
        print(f"[FAIL] Schema check failed: {e}")
        return False

if __name__ == "__main__":
    print("Supabase Connection Debug")
    print("=" * 50)

    connection_ok = debug_connection()

    if connection_ok:
        schema_ok = check_schema()

        if schema_ok:
            print("\n" + "=" * 50)
            print("[SUCCESS] Connection and schema are working!")
            print("\nYour database is ready. The 'no tasks found' message is normal")
            print("for a new database. You can now:")
            print("1. Start the frontend: cd frontend && npm run dev")
            print("2. Process your brain dump to add tasks")
        else:
            print("\n" + "=" * 50)
            print("[PARTIAL] Connection works but schema might be missing")
            print("Make sure you ran the SQL schema in Supabase SQL Editor")
    else:
        print("\n" + "=" * 50)
        print("[FAILED] Connection issues found")
        print("Check your backend/.env file and Supabase credentials")