// Proper TypeScript interfaces for the task management system

export interface Subtask {
  id: string
  title: string
  completed: boolean
  notes?: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: 'P1' | 'P2' | 'P3'
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  progress: number
  category: 'development' | 'design' | 'admin' | 'learning' | 'personal' | 'meeting' | 'planning'
  estimated_minutes: number
  actual_minutes: number
  time_block: 'morning' | 'afternoon' | 'evening'
  subtasks: Subtask[]
  notes: string[]
  success_criteria?: string
  dependencies: string[]
  tags: string[]
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface TaskStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  estimatedHours: number
  completionPercentage: number
}

export type ViewMode = 'swim' | 'list' | 'kanban'
export type TimeBlock = 'morning' | 'afternoon' | 'evening'