#!/usr/bin/env python3
"""
Morning Brain Dump Processing Script

This script orchestrates the sub-agent workflow to process morning brain dumps
into structured, prioritized, and scheduled daily tasks.

Workflow:
1. Read brain dump from input file
2. Load user config and objectives
3. Call task-extractor agent
4. Call priority-strategist agent
5. Call task-architect agent
6. Call day-optimizer agent
7. Save results and sync to Supabase

Usage:
    python scripts/process_morning.py [--input brain_dump.txt] [--date 2025-01-29]
"""

import json
import os
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add backend to path for imports
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from models import Task, DailyTasks, Config, Objective
from sync import TaskSync, SyncResult


class SubAgentError(Exception):
    """Exception raised when sub-agent calls fail"""
    pass


class MorningProcessor:
    """Orchestrates the morning brain dump processing workflow"""

    def __init__(self, data_dir: str = "data", config_file: str = "backend/config.json"):
        self.data_dir = Path(data_dir)
        self.config_file = Path(config_file)

        # Ensure directories exist
        self.input_dir = self.data_dir / "input"
        self.processed_dir = self.data_dir / "processed"
        self.input_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

        # Load configuration
        self.config = self._load_config()
        self.sync = TaskSync(str(self.data_dir))

    def _load_config(self) -> Config:
        """Load user configuration and objectives"""
        try:
            if not self.config_file.exists():
                print(f"⚠️  Config file not found: {self.config_file}")
                return Config()  # Use defaults

            with open(self.config_file, 'r', encoding='utf-8') as f:
                config_data = json.load(f)

            return Config(**config_data)
        except Exception as e:
            print(f"⚠️  Error loading config: {e}")
            return Config()  # Use defaults

    def _read_brain_dump(self, input_file: str) -> str:
        """Read brain dump text from input file"""
        input_path = self.input_dir / input_file

        if not input_path.exists():
            raise FileNotFoundError(f"Brain dump file not found: {input_path}")

        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()

            if not content:
                raise ValueError("Brain dump file is empty")

            return content
        except Exception as e:
            raise ValueError(f"Error reading brain dump: {e}")

    def _call_sub_agent(self, agent_name: str, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Call a Claude Code sub-agent

        NOTE: This is a placeholder. In actual implementation, you would use
        Claude Code's Task tool to call the sub-agents.

        For now, this returns mock data for testing purposes.
        """
        print(f"🤖 Calling {agent_name} sub-agent...")

        # In actual implementation, this would be:
        # result = claude_code.call_agent(agent_name, {
        #     "prompt": prompt,
        #     "context": context or {}
        # })

        # Mock responses for testing
        if agent_name == "task-extractor":
            return self._mock_task_extractor_response(prompt)
        elif agent_name == "priority-strategist":
            return self._mock_priority_strategist_response(prompt, context)
        elif agent_name == "task-architect":
            return self._mock_task_architect_response(prompt, context)
        elif agent_name == "day-optimizer":
            return self._mock_day_optimizer_response(prompt, context)
        else:
            raise SubAgentError(f"Unknown sub-agent: {agent_name}")

    def _mock_task_extractor_response(self, brain_dump: str) -> Dict[str, Any]:
        """Mock response from task-extractor agent"""
        # In reality, this would parse the brain dump using Claude
        # For now, create some sample tasks
        return {
            "agent_name": "task-extractor",
            "input_summary": f"Processed brain dump of {len(brain_dump)} characters",
            "output_count": 3,
            "data": [
                {
                    "title": "Finish setting up task management system",
                    "description": "Complete the implementation and testing",
                    "raw_priority": "high",
                    "estimated_minutes": 120,
                    "category_hint": "development",
                    "subtasks": ["Set up database", "Create frontend", "Test workflow"],
                    "notes": ["Critical for productivity"],
                    "extracted_from": "need to finish the task system"
                },
                {
                    "title": "Write project documentation",
                    "description": "Document setup and usage instructions",
                    "raw_priority": "medium",
                    "estimated_minutes": 60,
                    "category_hint": "admin",
                    "subtasks": [],
                    "notes": [],
                    "extracted_from": "write some docs"
                },
                {
                    "title": "Review and optimize workflow",
                    "description": "Analyze current process and improve",
                    "raw_priority": "low",
                    "estimated_minutes": 45,
                    "category_hint": "planning",
                    "subtasks": [],
                    "notes": ["Nice to have"],
                    "extracted_from": "maybe optimize the workflow"
                }
            ]
        }

    def _mock_priority_strategist_response(self, prompt: str, context: Dict) -> Dict[str, Any]:
        """Mock response from priority-strategist agent"""
        return {
            "agent_name": "priority-strategist",
            "input_summary": "Evaluated 3 tasks against user objectives",
            "output_count": 3,
            "data": [
                {
                    "id": "task-1",
                    "title": "Finish setting up task management system",
                    "priority": "P1",
                    "action": "keep",
                    "alignment_score": 95,
                    "urgency_score": 80,
                    "impact_score": 90,
                    "strategic_value": "Critical for achieving productivity objective",
                    "justification": "High alignment with productivity goals and urgent",
                    "objective_links": ["obj-1", "obj-2"],
                    "recommendations": ["Focus on core functionality first"]
                },
                {
                    "id": "task-2",
                    "title": "Write project documentation",
                    "priority": "P2",
                    "action": "keep",
                    "alignment_score": 60,
                    "urgency_score": 30,
                    "impact_score": 50,
                    "strategic_value": "Supports system adoption and learning",
                    "justification": "Moderate alignment, not urgent but valuable",
                    "objective_links": ["obj-1"],
                    "recommendations": ["Keep concise, focus on setup instructions"]
                },
                {
                    "id": "task-3",
                    "title": "Review and optimize workflow",
                    "priority": "P3",
                    "action": "defer",
                    "alignment_score": 40,
                    "urgency_score": 10,
                    "impact_score": 30,
                    "strategic_value": "Future optimization opportunity",
                    "justification": "Low urgency, can be deferred for later",
                    "objective_links": [],
                    "recommendations": ["Schedule for next week"]
                }
            ]
        }

    def _mock_task_architect_response(self, prompt: str, context: Dict) -> Dict[str, Any]:
        """Mock response from task-architect agent"""
        return {
            "agent_name": "task-architect",
            "input_summary": "Structured 2 prioritized tasks with metadata",
            "output_count": 2,
            "data": [
                {
                    "id": "task-1",
                    "title": "Finish setting up task management system",
                    "description": "Complete implementation including database, frontend, and testing",
                    "priority": "P1",
                    "category": "development",
                    "estimated_minutes": 120,
                    "time_block": "morning",
                    "success_criteria": "System deployed and processing brain dumps successfully",
                    "subtasks": [
                        {
                            "title": "Complete backend implementation",
                            "estimated_minutes": 45,
                            "success_criteria": "All Python modules working and tested"
                        },
                        {
                            "title": "Build and deploy frontend",
                            "estimated_minutes": 60,
                            "success_criteria": "UI displaying tasks and syncing with database"
                        },
                        {
                            "title": "Test end-to-end workflow",
                            "estimated_minutes": 15,
                            "success_criteria": "Complete workflow from brain dump to UI working"
                        }
                    ],
                    "context": {
                        "tools_needed": ["VS Code", "Python", "Node.js"],
                        "files_to_reference": ["README.md", "schema.sql"],
                        "dependencies": [],
                        "potential_blockers": ["Supabase setup required"]
                    },
                    "execution_notes": ["Start with backend completion", "Test each component", "Deploy incrementally"]
                },
                {
                    "id": "task-2",
                    "title": "Write project documentation",
                    "description": "Create setup guide and usage instructions",
                    "priority": "P2",
                    "category": "admin",
                    "estimated_minutes": 60,
                    "time_block": "afternoon",
                    "success_criteria": "Documentation allows new user to set up system independently",
                    "subtasks": [],
                    "context": {
                        "tools_needed": ["Text editor"],
                        "files_to_reference": ["All implementation files"],
                        "dependencies": ["System must be working first"],
                        "potential_blockers": []
                    },
                    "execution_notes": ["Focus on setup steps", "Include troubleshooting", "Add screenshots if helpful"]
                }
            ]
        }

    def _mock_day_optimizer_response(self, prompt: str, context: Dict) -> Dict[str, Any]:
        """Mock response from day-optimizer agent"""
        return {
            "agent_name": "day-optimizer",
            "input_summary": "Optimized schedule for 2 tasks across morning and afternoon",
            "output_count": 1,
            "data": {
                "date": date.today().isoformat(),
                "total_estimated_minutes": 180,
                "total_tasks": 2,
                "optimization_notes": "Scheduled complex development work in morning peak energy period",
                "schedule": [
                    {
                        "time_slot": "09:00-11:00",
                        "block_type": "deep_work",
                        "tasks": [
                            {
                                "id": "task-1",
                                "title": "Finish setting up task management system",
                                "estimated_minutes": 120,
                                "priority": "P1"
                            }
                        ],
                        "context_note": "Peak energy period - complex development work",
                        "total_minutes": 120
                    },
                    {
                        "time_slot": "11:00-11:15",
                        "block_type": "break",
                        "tasks": [],
                        "context_note": "Energy restoration break",
                        "total_minutes": 15
                    },
                    {
                        "time_slot": "14:00-15:00",
                        "block_type": "admin_work",
                        "tasks": [
                            {
                                "id": "task-2",
                                "title": "Write project documentation",
                                "estimated_minutes": 60,
                                "priority": "P2"
                            }
                        ],
                        "context_note": "Afternoon energy - admin and documentation",
                        "total_minutes": 60
                    }
                ],
                "warnings": [],
                "suggestions": ["Take breaks between intensive work sessions"]
            }
        }

    def process_brain_dump(self, input_file: str = "brain_dump.txt", target_date: str = None) -> SyncResult:
        """
        Main processing workflow

        Args:
            input_file: Name of brain dump file in input directory
            target_date: Date to schedule tasks for (default: today)

        Returns:
            SyncResult indicating success/failure
        """
        if not target_date:
            target_date = date.today().isoformat()

        try:
            print(f"🧠 Processing brain dump for {target_date}")

            # Step 1: Read brain dump
            print("📖 Reading brain dump...")
            brain_dump = self._read_brain_dump(input_file)
            print(f"✅ Read {len(brain_dump)} characters")

            # Step 2: Extract tasks
            print("🔍 Extracting tasks...")
            extraction_result = self._call_sub_agent("task-extractor", brain_dump)
            raw_tasks = extraction_result["data"]
            print(f"✅ Extracted {len(raw_tasks)} tasks")

            # Step 3: Prioritize tasks
            print("🎯 Prioritizing tasks...")
            priority_context = {
                "objectives": [obj.dict() for obj in self.config.objectives],
                "preferences": self.config.preferences
            }
            priority_result = self._call_sub_agent("priority-strategist",
                                                 json.dumps(raw_tasks),
                                                 priority_context)
            prioritized_tasks = priority_result["data"]
            print(f"✅ Prioritized {len(prioritized_tasks)} tasks")

            # Step 4: Structure tasks
            print("🏗️  Structuring tasks...")
            architect_context = {
                "config": self.config.dict(),
                "date": target_date
            }
            architect_result = self._call_sub_agent("task-architect",
                                                  json.dumps(prioritized_tasks),
                                                  architect_context)
            structured_tasks = architect_result["data"]
            print(f"✅ Structured {len(structured_tasks)} tasks")

            # Step 5: Optimize schedule
            print("⏰ Optimizing schedule...")
            optimizer_context = {
                "preferences": self.config.preferences,
                "work_hours": self.config.work_hours,
                "energy_schedule": self.config.energy_schedule
            }
            optimizer_result = self._call_sub_agent("day-optimizer",
                                                  json.dumps(structured_tasks),
                                                  optimizer_context)
            schedule = optimizer_result["data"]
            print(f"✅ Created optimized schedule")

            # Step 6: Convert to Task objects
            print("📋 Creating task objects...")
            tasks = []
            for task_data in structured_tasks:
                try:
                    task = Task(**task_data)
                    tasks.append(task)
                except Exception as e:
                    print(f"⚠️  Error creating task from {task_data.get('title', 'unknown')}: {e}")

            print(f"✅ Created {len(tasks)} task objects")

            # Step 7: Save processed data
            print("💾 Saving processed data...")
            processed_data = {
                "date": target_date,
                "brain_dump": brain_dump,
                "extraction_result": extraction_result,
                "priority_result": priority_result,
                "architect_result": architect_result,
                "optimizer_result": optimizer_result,
                "final_tasks": [task.dict() for task in tasks],
                "schedule": schedule,
                "processed_at": datetime.now().isoformat()
            }

            processed_file = self.processed_dir / f"morning_processing_{target_date}.json"
            with open(processed_file, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=2, default=str)

            print(f"✅ Saved to {processed_file}")

            # Step 8: Sync to Supabase
            print("☁️  Syncing to Supabase...")
            sync_result = self.sync.push_tasks(tasks, target_date)

            if sync_result.success:
                print(f"✅ {sync_result.message}")
                return SyncResult(
                    success=True,
                    message=f"Successfully processed brain dump: {len(tasks)} tasks created for {target_date}",
                    data={
                        "tasks": [task.dict() for task in tasks],
                        "schedule": schedule,
                        "processed_file": str(processed_file)
                    }
                )
            else:
                print(f"⚠️  Sync warning: {sync_result.message}")
                return SyncResult(
                    success=True,
                    message=f"Tasks processed but sync failed: {sync_result.error}",
                    data={"tasks": [task.dict() for task in tasks]}
                )

        except Exception as e:
            error_msg = f"Error processing brain dump: {e}"
            print(f"❌ {error_msg}")
            return SyncResult(
                success=False,
                message=error_msg,
                error=str(e)
            )


def main():
    """Command-line interface"""
    import argparse

    parser = argparse.ArgumentParser(description='Process morning brain dump into structured tasks')
    parser.add_argument('--input', '-i', default='brain_dump.txt',
                       help='Brain dump input file (default: brain_dump.txt)')
    parser.add_argument('--date', '-d', type=str,
                       help='Target date (YYYY-MM-DD, default: today)')
    parser.add_argument('--config', '-c', default='backend/config.json',
                       help='Config file path (default: backend/config.json)')

    args = parser.parse_args()

    try:
        processor = MorningProcessor(config_file=args.config)
        result = processor.process_brain_dump(args.input, args.date)

        if result.success:
            print(f"\n🎉 {result.message}")
            if result.data and 'tasks' in result.data:
                print(f"📋 Created {len(result.data['tasks'])} tasks")
        else:
            print(f"\n💥 {result.message}")
            sys.exit(1)

    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()