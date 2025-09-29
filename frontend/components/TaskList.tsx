'use client'

import { useState } from 'react'
import { Task } from '@/lib/supabase'
import { calculateTaskProgress } from '@/lib/utils'
import TaskCard from '@/components/modern/TaskCard'

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onAddSubtask: (taskId: string, subtaskTitle: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}

export default function TaskList({
  tasks,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask
}: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await onUpdateTask(taskId, updates)
    } catch (error) {
      console.error('Failed to update task:', error)
      // Here you could show a toast notification
    }
  }

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    )

    // Calculate new progress based on subtask completion
    const completedSubtasks = updatedSubtasks.filter(st => st.completed).length
    const newProgress = updatedSubtasks.length > 0
      ? Math.round((completedSubtasks / updatedSubtasks.length) * 100)
      : task.progress

    const updates: Partial<Task> = {
      subtasks: updatedSubtasks,
      progress: newProgress,
      updated_at: new Date().toISOString()
    }

    // Auto-complete if all subtasks done
    if (newProgress === 100) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    }

    onUpdateTask(taskId, updates)
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4 opacity-50">📋</div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          No tasks to display
        </h3>
        <p className="text-neutral-600 text-center max-w-md">
          Your tasks will appear here once they're processed from your brain dump.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6" role="main" aria-label="Task list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={handleTaskUpdate}
          isExpanded={expandedTasks.has(task.id)}
          onToggleExpanded={() => toggleTaskExpansion(task.id)}
          className="transition-all duration-200 ease-out"
        />
      ))}

      {/* Performance indicator for large lists */}
      {tasks.length > 20 && (
        <div className="text-center py-4 text-sm text-neutral-500">
          Showing {tasks.length} tasks
        </div>
      )}
    </div>
  )
}