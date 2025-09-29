#!/usr/bin/env python3
"""
Task Management System Setup Script

Simple setup script to help users get started quickly.
Installs dependencies and sets up configuration files.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path


def run_command(command, description=""):
    """Run a shell command and handle errors"""
    print(f"🔄 {description or command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(f"✅ {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stderr:
            print(f"   {e.stderr.strip()}")
        return False


def check_python():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True


def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")

    # Try to install core dependencies first
    core_deps = ["supabase", "python-dotenv", "pydantic"]
    for dep in core_deps:
        if not run_command(f"pip install {dep}", f"Installing {dep}"):
            print(f"⚠️  Failed to install {dep}, continuing...")

    # Try to install from requirements.txt
    if Path("backend/requirements.txt").exists():
        run_command("pip install -r backend/requirements.txt", "Installing all dependencies")


def setup_environment():
    """Set up environment configuration"""
    print("\n⚙️  Setting up environment configuration...")

    env_example = Path("backend/.env.example")
    env_file = Path("backend/.env")

    if env_example.exists() and not env_file.exists():
        shutil.copy(env_example, env_file)
        print("✅ Created .env file from template")
        print("📝 Please edit backend/.env with your Supabase credentials")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("⚠️  No .env template found")


def create_sample_input():
    """Create sample brain dump for testing"""
    print("\n📄 Creating sample input files...")

    sample_brain_dump = """Today I need to:
- Finish setting up the task management system
- Test the sub-agent workflow with this brain dump
- Create a simple UI for viewing tasks
- Write documentation for the setup process
- Plan tomorrow's development priorities

Also thinking about:
- Maybe add a timer feature for pomodoro technique
- Could use some better visualization of task progress
- Need to optimize the Claude Code sub-agent prompts

Quick tasks:
- Reply to that email about the project
- Review the PR that came in yesterday
- Update my LinkedIn profile
"""

    input_file = Path("data/input/brain_dump.txt")
    input_file.parent.mkdir(parents=True, exist_ok=True)

    with open(input_file, 'w') as f:
        f.write(sample_brain_dump)

    print("✅ Created sample brain dump at data/input/brain_dump.txt")


def print_next_steps():
    """Print next steps for the user"""
    print("\n🎉 Setup complete! Next steps:")
    print("\n1. 📋 Set up Supabase:")
    print("   - Create a new project at https://supabase.com")
    print("   - Run the SQL schema from backend/schema.sql")
    print("   - Update backend/.env with your credentials")

    print("\n2. 🧠 Configure Claude Code sub-agents:")
    print("   - Check the agents/ folder for sub-agent prompts")
    print("   - Set up sub-agents in Claude Code")

    print("\n3. 🧪 Test the workflow:")
    print("   - python backend/sync.py pull  # Test Supabase connection")
    print("   - Edit data/input/brain_dump.txt with your tasks")
    print("   - Run the morning processing script")

    print("\n4. 🌐 Set up the frontend:")
    print("   - cd frontend")
    print("   - npm install")
    print("   - npm run dev")

    print("\n📚 Documentation:")
    print("   - backend/README.md - Backend setup details")
    print("   - backend/config.json - Customize your objectives")


def main():
    """Main setup process"""
    print("🚀 Task Management System Setup")
    print("================================")

    if not check_python():
        sys.exit(1)

    # Change to project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)

    # Run setup steps
    install_dependencies()
    setup_environment()
    create_sample_input()

    print_next_steps()


if __name__ == "__main__":
    main()