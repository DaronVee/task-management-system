import { type ClassValue, clsx } from 'clsx'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { Task, TaskSummary } from './supabase'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isThisWeek(d)) return format(d, 'EEEE')
  return format(d, 'MMM d, yyyy')
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'P1':
      return 'border-red-500 bg-red-50 text-red-700'
    case 'P2':
      return 'border-yellow-500 bg-yellow-50 text-yellow-700'
    case 'P3':
      return 'border-green-500 bg-green-50 text-green-700'
    default:
      return 'border-gray-500 bg-gray-50 text-gray-700'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'blocked':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'not_started':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'development':
      return '💻'
    case 'design':
      return '🎨'
    case 'admin':
      return '📄'
    case 'learning':
      return '📚'
    case 'personal':
      return '🏠'
    case 'meeting':
      return '👥'
    case 'planning':
      return '📋'
    default:
      return '📌'
  }
}

export function getTimeBlockIcon(timeBlock?: string): string {
  switch (timeBlock) {
    case 'morning':
      return '🌅'
    case 'afternoon':
      return '☀️'
    case 'evening':
      return '🌙'
    default:
      return '⏰'
  }
}

export function calculateTaskProgress(task: Task): number {
  if (task.status === 'completed') return 100
  if (task.status === 'not_started') return 0

  // If there are subtasks, calculate based on completion
  if (task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length
    return Math.round((completedSubtasks / task.subtasks.length) * 100)
  }

  // Otherwise use the explicit progress value
  return task.progress
}

export function generateTaskSummary(tasks: Task[]): TaskSummary {
  const summary: TaskSummary = {
    total_tasks: tasks.length,
    completed_tasks: 0,
    in_progress_tasks: 0,
    blocked_tasks: 0,
    total_estimated_minutes: 0,
    total_actual_minutes: 0,
    completion_percentage: 0,
    categories: {},
    priorities: {}
  }

  tasks.forEach(task => {
    // Count by status
    switch (task.status) {
      case 'completed':
        summary.completed_tasks++
        break
      case 'in_progress':
        summary.in_progress_tasks++
        break
      case 'blocked':
        summary.blocked_tasks++
        break
    }

    // Sum time
    summary.total_estimated_minutes += task.estimated_minutes
    summary.total_actual_minutes += task.actual_minutes

    // Count categories
    summary.categories[task.category] = (summary.categories[task.category] || 0) + 1

    // Count priorities
    summary.priorities[task.priority] = (summary.priorities[task.priority] || 0) + 1
  })

  // Calculate completion percentage
  if (tasks.length > 0) {
    summary.completion_percentage = Math.round((summary.completed_tasks / tasks.length) * 100)
  }

  return summary
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { 'P1': 0, 'P2': 1, 'P3': 2 }
  return [...tasks].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then by status (incomplete tasks first)
    const statusOrder = { 'in_progress': 0, 'not_started': 1, 'blocked': 2, 'completed': 3, 'cancelled': 4 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // Finally by creation time (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function filterTasksByStatus(tasks: Task[], status: string[]): Task[] {
  return tasks.filter(task => status.includes(task.status))
}

export function filterTasksByPriority(tasks: Task[], priorities: string[]): Task[] {
  return tasks.filter(task => priorities.includes(task.priority))
}

export function filterTasksByTimeBlock(tasks: Task[], timeBlock: string): Task[] {
  return tasks.filter(task => task.time_block === timeBlock)
}

export function getTasksForTimeBlock(tasks: Task[], timeBlock: 'morning' | 'afternoon' | 'evening'): Task[] {
  return tasks.filter(task => task.time_block === timeBlock && task.status !== 'completed')
}

export function getUpcomingTasks(tasks: Task[], limit: number = 5): Task[] {
  return sortTasksByPriority(
    filterTasksByStatus(tasks, ['not_started', 'in_progress', 'blocked'])
  ).slice(0, limit)
}

export function validateTaskUpdate(updates: Partial<Task>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (updates.progress !== undefined) {
    if (updates.progress < 0 || updates.progress > 100) {
      errors.push('Progress must be between 0 and 100')
    }
  }

  if (updates.estimated_minutes !== undefined) {
    if (updates.estimated_minutes < 1) {
      errors.push('Estimated time must be at least 1 minute')
    }
  }

  if (updates.title !== undefined) {
    if (!updates.title.trim()) {
      errors.push('Task title cannot be empty')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}