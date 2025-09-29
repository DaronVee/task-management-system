#!/usr/bin/env python3
"""
Evening Report Generation Script

This script generates insightful daily, weekly, and monthly reports by analyzing
task completion data and patterns using Claude Code sub-agents.

Usage:
    python scripts/generate_report.py [--type daily|weekly|monthly] [--date 2025-01-29]
"""

import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add backend to path for imports
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from models import Task, DailyTasks, DaySummary
from sync import TaskSync, SyncResult


class ReportGenerator:
    """Generates productivity reports using sub-agents"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.reports_dir = self.data_dir / "reports"
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.sync = TaskSync(str(self.data_dir))

    def _call_sub_agent(self, agent_name: str, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Call a Claude Code sub-agent

        NOTE: This is a placeholder. In actual implementation, you would use
        Claude Code's Task tool to call the sub-agents.
        """
        print(f"🤖 Calling {agent_name} sub-agent...")

        # Mock responses for testing
        if agent_name == "progress-analyst":
            return self._mock_progress_analyst_response(context)
        elif agent_name == "report-composer":
            return self._mock_report_composer_response(context)
        else:
            raise ValueError(f"Unknown sub-agent: {agent_name}")

    def _mock_progress_analyst_response(self, context: Dict) -> Dict[str, Any]:
        """Mock response from progress-analyst agent"""
        return {
            "agent_name": "progress-analyst",
            "analysis_period": context.get("period", "Today"),
            "data": {
                "overall_metrics": {
                    "total_tasks": 8,
                    "completed_tasks": 6,
                    "completion_rate": 75.0,
                    "avg_daily_tasks": 8.0,
                    "time_estimation_accuracy": 82.5
                },
                "patterns": {
                    "strongest_performance": {
                        "metric": "Morning deep work completion",
                        "score": 90,
                        "insight": "Development tasks scheduled 9-11 AM had 90% completion rate"
                    },
                    "biggest_challenge": {
                        "metric": "Afternoon context switching",
                        "score": 60,
                        "insight": "Mixed task types after 2 PM had lower completion rate"
                    }
                },
                "recommendations": [
                    {
                        "type": "scheduling",
                        "priority": "high",
                        "action": "Continue batching development work in morning slots",
                        "rationale": "Morning development completion rate is excellent",
                        "expected_impact": "Maintain high productivity in complex tasks"
                    },
                    {
                        "type": "workflow",
                        "priority": "medium",
                        "action": "Group admin tasks into single afternoon block",
                        "rationale": "Reduce context switching penalty",
                        "expected_impact": "10% improvement in afternoon completion"
                    }
                ],
                "trends": [
                    {
                        "metric": "P1 completion rate",
                        "direction": "stable",
                        "change": "+2% from yesterday",
                        "context": "Consistent prioritization working well"
                    }
                ],
                "alerts": [
                    {
                        "type": "info",
                        "message": "Time estimates were accurate today",
                        "suggestion": "Current estimation patterns are working well"
                    }
                ]
            }
        }

    def _mock_report_composer_response(self, context: Dict) -> Dict[str, Any]:
        """Mock response from report-composer agent"""
        report_type = context.get("type", "daily")
        target_date = context.get("date", date.today().isoformat())

        if report_type == "daily":
            report_content = f"""# Daily Productivity Report - {target_date}

## 🎯 Today's Wins
- **6 tasks completed** out of 8 planned (75% completion rate)
- **Task Management System Setup** - Successfully completed core implementation
- **Morning Focus Time** - 2 hours of uninterrupted development work

## 📊 Performance Snapshot
- **Focus time**: 2.5 hours of deep work completed
- **Energy alignment**: 90% of complex tasks done during peak energy
- **Estimation accuracy**: 82% average accuracy vs planned time

## 🔍 Key Insight
Morning development sessions (9-11 AM) continue to show excellent completion rates. The focused time blocks are working well for complex technical work.

## 🚀 Tomorrow's Setup
- **Priority focus**: Complete frontend implementation and deploy
- **Energy plan**: Schedule remaining development work for morning peak energy
- **Quick prep**: Review frontend requirements before starting tomorrow

---
*Generated at 6:00 PM | Next report: Tomorrow at 6 PM*"""

        elif report_type == "weekly":
            report_content = f"""# Weekly Productivity Report - Week of {target_date}

## 📈 Week at a Glance
- **35 tasks completed** out of 42 planned (83% completion rate)
- **18 hours** of productive work logged
- **Task Management System** - Major milestone achieved with core system complete

## 🎯 Objective Progress
- **Build Task Management System**: 80% complete - Core system working, frontend in progress
- **Improve Daily Productivity**: 85% complete - Excellent morning focus patterns established
- **Learn AI Workflows**: 70% complete - Sub-agent system successfully implemented

## 📊 Performance Patterns
### ✅ What Worked Well
- **Morning development blocks**: 90% completion rate for complex tasks
- **Priority alignment**: P1 tasks consistently completed first

### ⚠️ Improvement Areas
- **Afternoon energy management**: 65% completion rate, room for optimization
- **Task estimation**: Slightly over-estimating admin tasks

## 🔍 Deep Insights
### Time Management
- **Peak productivity**: 9-11 AM shows highest completion rates
- **Energy alignment**: Complex tasks well-matched to morning energy
- **Context switching**: Minimal penalty when batching similar tasks

### Task Patterns
- **Category performance**: Development (90%), Admin (75%), Personal (60%)
- **Estimation accuracy**: 82% overall, improving each day
- **Priority effectiveness**: P1 completion at 95%

## 🚀 Next Week's Focus
### Process Improvements
1. **Batch afternoon admin**: Group similar tasks to reduce context switching
2. **Protect morning focus**: Continue reserving 9-11 AM for complex work

### Scheduling Optimizations
- **Morning focus**: Maintain successful development time blocks
- **Afternoon efficiency**: Experiment with themed afternoon blocks
- **Task batching**: Group by category and energy requirement

---
*Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Covers: Week of {target_date}*"""

        else:  # monthly
            report_content = f"""# Monthly Productivity Report - {datetime.now().strftime('%B %Y')}

## 🎯 Executive Summary
Excellent month with successful implementation of the task management system and establishment of highly effective morning focus routines. Completion rates consistently above 80% with strong alignment to strategic objectives.

## 📊 Monthly Metrics
| Metric | This Month | Last Month | Change |
|--------|------------|------------|---------|
| Completion Rate | 81% | 72% | +9% |
| Total Tasks | 156 | 142 | +14 |
| Deep Work Hours | 72 | 58 | +14 |
| Objective Progress | 78% | 45% | +33% |

## 🏆 Major Achievements
1. **Task Management System**: Successfully built and deployed complete productivity system
2. **Morning Routine Optimization**: Established consistent 9-11 AM focus blocks with 90% completion
3. **Sub-Agent Integration**: Implemented AI-powered task processing and prioritization

## 🎯 Objective Progress Review
- **Build Task Management System**: 95% complete - System operational and improving productivity
- **Improve Daily Productivity**: 85% complete - Strong patterns established, refinements ongoing
- **Learn AI Workflows**: 80% complete - Successfully integrated sub-agents into daily workflow

## 📈 Productivity Evolution
### System Improvements
- **Sub-agent workflow**: Reduced morning planning time by 70%
- **Energy alignment**: Improved complex task completion by 25%

### Pattern Recognition
- **Strongest performance area**: Morning development work (90% completion)
- **Biggest growth area**: Afternoon task batching (improved from 60% to 75%)
- **Persistent challenge**: Personal task completion (65% vs 85% for work tasks)

## 🔍 Strategic Insights
### Time Management Mastery
Month showed significant improvement in matching task complexity to energy levels, with morning focus blocks becoming highly productive and consistent.

### Energy Optimization
Successfully identified and leveraged peak energy periods, resulting in dramatically improved completion rates for complex development work.

### Task Execution Excellence
Established reliable patterns for task breakdown, estimation, and scheduling that consistently deliver results.

## 🚀 Next Month's Strategic Focus
### Priority Objectives
1. **Refine Personal Task Management**: Improve completion rate for personal tasks to match work performance
2. **Advanced Sub-Agent Features**: Add coaching agent for stuck tasks and enhanced reporting

### System Optimizations
- **Process improvements**: Further optimize afternoon work patterns
- **Tool enhancements**: Add calendar integration and mobile access
- **Habit formation**: Solidify evening review and morning planning routines

---
*Comprehensive analysis complete | Next monthly report: {(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')}*"""

        return {
            "agent_name": "report-composer",
            "report_type": report_type,
            "data": {
                "content": report_content,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "report_date": target_date,
                    "word_count": len(report_content.split()),
                    "sections": report_content.count("##")
                }
            }
        }

    def _get_task_data(self, target_date: str, days_back: int = 1) -> List[Dict]:
        """Get task data for analysis"""
        task_data = []
        current_date = datetime.fromisoformat(target_date).date()

        for i in range(days_back):
            check_date = (current_date - timedelta(days=i)).isoformat()
            result = self.sync.pull_tasks(check_date, use_cache=True)

            if result.success and result.data:
                task_data.append(result.data)

        return task_data

    def generate_daily_report(self, target_date: str = None) -> str:
        """Generate daily productivity report"""
        if not target_date:
            target_date = date.today().isoformat()

        print(f"📊 Generating daily report for {target_date}")

        # Get task data
        task_data = self._get_task_data(target_date, days_back=1)

        # Analyze with progress-analyst
        analyst_context = {
            "period": "Today",
            "task_data": task_data,
            "type": "daily"
        }
        analysis = self._call_sub_agent("progress-analyst", "analyze_daily_progress", analyst_context)

        # Generate report with report-composer
        composer_context = {
            "type": "daily",
            "date": target_date,
            "analysis": analysis["data"],
            "task_data": task_data
        }
        report = self._call_sub_agent("report-composer", "compose_daily_report", composer_context)

        # Save report
        report_file = self.reports_dir / f"daily_report_{target_date}.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report["data"]["content"])

        print(f"✅ Daily report saved to {report_file}")
        return str(report_file)

    def generate_weekly_report(self, target_date: str = None) -> str:
        """Generate weekly productivity report"""
        if not target_date:
            target_date = date.today().isoformat()

        print(f"📊 Generating weekly report for week ending {target_date}")

        # Get task data for the week
        task_data = self._get_task_data(target_date, days_back=7)

        # Analyze with progress-analyst
        analyst_context = {
            "period": "Last 7 days",
            "task_data": task_data,
            "type": "weekly"
        }
        analysis = self._call_sub_agent("progress-analyst", "analyze_weekly_progress", analyst_context)

        # Generate report with report-composer
        composer_context = {
            "type": "weekly",
            "date": target_date,
            "analysis": analysis["data"],
            "task_data": task_data
        }
        report = self._call_sub_agent("report-composer", "compose_weekly_report", composer_context)

        # Save report
        report_file = self.reports_dir / f"weekly_report_{target_date}.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report["data"]["content"])

        print(f"✅ Weekly report saved to {report_file}")
        return str(report_file)

    def generate_monthly_report(self, target_date: str = None) -> str:
        """Generate monthly productivity report"""
        if not target_date:
            target_date = date.today().isoformat()

        print(f"📊 Generating monthly report for month ending {target_date}")

        # Get task data for the month
        task_data = self._get_task_data(target_date, days_back=30)

        # Analyze with progress-analyst
        analyst_context = {
            "period": "Last 30 days",
            "task_data": task_data,
            "type": "monthly"
        }
        analysis = self._call_sub_agent("progress-analyst", "analyze_monthly_progress", analyst_context)

        # Generate report with report-composer
        composer_context = {
            "type": "monthly",
            "date": target_date,
            "analysis": analysis["data"],
            "task_data": task_data
        }
        report = self._call_sub_agent("report-composer", "compose_monthly_report", composer_context)

        # Save report
        month_year = datetime.fromisoformat(target_date).strftime("%Y-%m")
        report_file = self.reports_dir / f"monthly_report_{month_year}.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report["data"]["content"])

        print(f"✅ Monthly report saved to {report_file}")
        return str(report_file)


def main():
    """Command-line interface"""
    import argparse

    parser = argparse.ArgumentParser(description='Generate productivity reports')
    parser.add_argument('--type', '-t', choices=['daily', 'weekly', 'monthly'],
                       default='daily', help='Type of report to generate')
    parser.add_argument('--date', '-d', type=str,
                       help='Target date (YYYY-MM-DD, default: today)')

    args = parser.parse_args()

    try:
        generator = ReportGenerator()
        target_date = args.date or date.today().isoformat()

        if args.type == 'daily':
            report_file = generator.generate_daily_report(target_date)
        elif args.type == 'weekly':
            report_file = generator.generate_weekly_report(target_date)
        elif args.type == 'monthly':
            report_file = generator.generate_monthly_report(target_date)

        print(f"\n🎉 {args.type.title()} report generated: {report_file}")

    except Exception as e:
        print(f"\n💥 Error generating report: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()