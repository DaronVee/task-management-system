"""
Task Management System Data Models

Pydantic models for type safety and validation of task data.
These models match the JSON structure stored in Supabase.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


class Priority(str, Enum):
    """Task priority levels"""
    P1 = "P1"  # Critical/Urgent - must be done today
    P2 = "P2"  # Important - should be done this week
    P3 = "P3"  # Nice to have - can be deferred


class TaskStatus(str, Enum):
    """Task completion status"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class TimeBlock(str, Enum):
    """Time blocks for scheduling tasks"""
    MORNING = "morning"      # 8-12 AM - Deep work, high energy
    AFTERNOON = "afternoon"  # 1-5 PM - Meetings, collaboration
    EVENING = "evening"      # 6-9 PM - Admin, light tasks


class Category(str, Enum):
    """Task categories for organization"""
    DEVELOPMENT = "development"
    DESIGN = "design"
    ADMIN = "admin"
    LEARNING = "learning"
    PERSONAL = "personal"
    MEETING = "meeting"
    PLANNING = "planning"


class Subtask(BaseModel):
    """Individual subtask within a larger task"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    completed: bool = False
    notes: Optional[str] = None


class Task(BaseModel):
    """Main task object with all metadata"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)
    priority: Priority = Priority.P2
    status: TaskStatus = TaskStatus.NOT_STARTED
    progress: int = Field(default=0, ge=0, le=100)
    category: Category = Category.ADMIN

    # Time tracking
    estimated_minutes: int = Field(default=30, ge=5, le=480)  # 5 min to 8 hours
    actual_minutes: int = Field(default=0, ge=0)
    time_block: Optional[TimeBlock] = None

    # Task breakdown
    subtasks: List[Subtask] = Field(default_factory=list)
    notes: List[str] = Field(default_factory=list)

    # Success criteria and context
    success_criteria: Optional[str] = None
    dependencies: List[str] = Field(default_factory=list)  # IDs of blocking tasks
    tags: List[str] = Field(default_factory=list)

    # Metadata
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None

    @validator('progress')
    def validate_progress(cls, v, values):
        """Ensure progress aligns with status"""
        status = values.get('status')
        if status == TaskStatus.COMPLETED and v != 100:
            return 100
        elif status == TaskStatus.NOT_STARTED and v > 0:
            return 0
        return v

    @validator('completed_at')
    def set_completed_at(cls, v, values):
        """Auto-set completion time when status is completed"""
        status = values.get('status')
        if status == TaskStatus.COMPLETED and not v:
            return datetime.now().isoformat()
        elif status != TaskStatus.COMPLETED:
            return None
        return v

    def add_note(self, note: str) -> None:
        """Add a timestamped note to the task"""
        timestamp = datetime.now().strftime("%H:%M")
        self.notes.append(f"[{timestamp}] {note}")
        self.updated_at = datetime.now().isoformat()

    def mark_completed(self) -> None:
        """Mark task as completed with timestamp"""
        self.status = TaskStatus.COMPLETED
        self.progress = 100
        self.completed_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()

    def add_subtask(self, title: str) -> str:
        """Add a new subtask and return its ID"""
        subtask = Subtask(title=title)
        self.subtasks.append(subtask)
        self.updated_at = datetime.now().isoformat()
        return subtask.id

    def complete_subtask(self, subtask_id: str) -> bool:
        """Mark a subtask as completed"""
        for subtask in self.subtasks:
            if subtask.id == subtask_id:
                subtask.completed = True
                self.updated_at = datetime.now().isoformat()
                self._update_progress_from_subtasks()
                return True
        return False

    def _update_progress_from_subtasks(self) -> None:
        """Auto-calculate progress based on completed subtasks"""
        if not self.subtasks:
            return

        completed = sum(1 for st in self.subtasks if st.completed)
        total = len(self.subtasks)
        self.progress = int((completed / total) * 100)

        # Auto-complete task if all subtasks done
        if completed == total and self.status != TaskStatus.COMPLETED:
            self.mark_completed()


class DaySummary(BaseModel):
    """Summary statistics for a day's tasks"""
    total_tasks: int = 0
    completed_tasks: int = 0
    in_progress_tasks: int = 0
    blocked_tasks: int = 0
    total_estimated_minutes: int = 0
    total_actual_minutes: int = 0
    completion_percentage: float = 0.0
    categories: Dict[str, int] = Field(default_factory=dict)
    priorities: Dict[str, int] = Field(default_factory=dict)

    @classmethod
    def from_tasks(cls, tasks: List[Task]) -> 'DaySummary':
        """Generate summary from a list of tasks"""
        if not tasks:
            return cls()

        # Count by status
        completed = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
        in_progress = len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS])
        blocked = len([t for t in tasks if t.status == TaskStatus.BLOCKED])

        # Time totals
        estimated = sum(t.estimated_minutes for t in tasks)
        actual = sum(t.actual_minutes for t in tasks)

        # Completion percentage
        completion = (completed / len(tasks)) * 100 if tasks else 0

        # Category breakdown
        categories = {}
        for task in tasks:
            cat = task.category.value
            categories[cat] = categories.get(cat, 0) + 1

        # Priority breakdown
        priorities = {}
        for task in tasks:
            pri = task.priority.value
            priorities[pri] = priorities.get(pri, 0) + 1

        return cls(
            total_tasks=len(tasks),
            completed_tasks=completed,
            in_progress_tasks=in_progress,
            blocked_tasks=blocked,
            total_estimated_minutes=estimated,
            total_actual_minutes=actual,
            completion_percentage=round(completion, 1),
            categories=categories,
            priorities=priorities
        )


class DailyTasks(BaseModel):
    """Complete daily task data for storage in Supabase"""
    date: str = Field(default_factory=lambda: date.today().isoformat())
    tasks: List[Task] = Field(default_factory=list)
    summary: DaySummary = Field(default_factory=DaySummary)

    @validator('date')
    def validate_date_format(cls, v):
        """Ensure date is in YYYY-MM-DD format"""
        try:
            date.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    def add_task(self, task: Task) -> None:
        """Add a task and update summary"""
        self.tasks.append(task)
        self.update_summary()

    def remove_task(self, task_id: str) -> bool:
        """Remove a task by ID and update summary"""
        original_length = len(self.tasks)
        self.tasks = [t for t in self.tasks if t.id != task_id]
        if len(self.tasks) < original_length:
            self.update_summary()
            return True
        return False

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def update_summary(self) -> None:
        """Recalculate summary from current tasks"""
        self.summary = DaySummary.from_tasks(self.tasks)

    def get_tasks_by_priority(self, priority: Priority) -> List[Task]:
        """Get all tasks with specific priority"""
        return [t for t in self.tasks if t.priority == priority]

    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """Get all tasks with specific status"""
        return [t for t in self.tasks if t.status == status]

    def get_tasks_by_time_block(self, time_block: TimeBlock) -> List[Task]:
        """Get all tasks scheduled for specific time block"""
        return [t for t in self.tasks if t.time_block == time_block]


class Objective(BaseModel):
    """User objectives for priority alignment"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    weight: float = Field(default=1.0, ge=0.1, le=10.0)  # Higher = more important
    active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class Config(BaseModel):
    """System configuration and user preferences"""
    objectives: List[Objective] = Field(default_factory=list)
    work_hours: Dict[str, str] = Field(default_factory=lambda: {
        "start": "09:00",
        "end": "17:00"
    })
    energy_schedule: Dict[str, str] = Field(default_factory=lambda: {
        "peak": "morning",
        "low": "afternoon"
    })
    default_estimates: Dict[str, int] = Field(default_factory=lambda: {
        "small": 15,
        "medium": 30,
        "large": 60,
        "xlarge": 120
    })
    preferences: Dict[str, Any] = Field(default_factory=dict)


# Type aliases for convenience
TaskList = List[Task]
ObjectiveList = List[Objective]