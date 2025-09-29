import { useState } from 'react'
import { Task } from '../types/task'
import { Task as SupabaseTask } from '@/lib/supabase'
import { UpdateTaskInput } from '@/services/taskService'
import { PriorityBadge } from './ui/PriorityBadge'
import { StatusBadge } from './ui/StatusBadge'
import { ProgressBar } from './ui/ProgressBar'
import { SubtaskIndicator } from './ui/SubtaskIndicator'
import { TagList } from './ui/TagList'
import { PencilIcon, TrashIcon, CheckIcon, PlayIcon, PauseIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: SupabaseTask
  isSuggested?: boolean
  onStartWorking?: (taskId: string) => void
  onEdit?: (task: SupabaseTask) => void
  onDelete?: (taskId: string) => void
  onToggleSubtask?: (taskId: string, subtaskId: string) => void
  onUpdate?: (taskId: string, updates: UpdateTaskInput) => void
  className?: string
}

export function TaskCard({
  task,
  isSuggested = false,
  onStartWorking,
  onEdit,
  onDelete,
  onToggleSubtask,
  onUpdate,
  className = ''
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const getTimeBlockIcon = (timeBlock: string) => {
    switch (timeBlock) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌙'
      default: return '⏰'
    }
  }

  const handleStartWorking = () => {
    if (onStartWorking && task.status !== 'completed') {
      onStartWorking(task.id)
    }
  }

  const handleToggleComplete = async () => {
    if (!onUpdate || isUpdating) return

    setIsUpdating(true)
    try {
      const newStatus = task.status === 'completed' ? 'not_started' : 'completed'
      const newProgress = newStatus === 'completed' ? 100 : 0
      await onUpdate(task.id, { status: newStatus, progress: newProgress })
    } catch (error) {
      console.error('Failed to toggle task completion:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: SupabaseTask['status']) => {
    if (!onUpdate || isUpdating) return

    setIsUpdating(true)
    try {
      await onUpdate(task.id, { status: newStatus })
    } catch (error) {
      console.error('Failed to update task status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubtaskToggle = async (subtaskId: string) => {
    if (!onToggleSubtask) return

    try {
      await onToggleSubtask(task.id, subtaskId)
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  return (
    <div
      className={cn(
        "card",
        isSuggested && "card-suggested",
        task.status === 'completed' && "opacity-75",
        className
      )}
      onMouseLeave={() => setShowActions(false)}
    >
      <div style={{ padding: 'var(--space-6)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>{getTimeBlockIcon(task.time_block || 'morning')}</span>
              <span className="font-medium">{task.estimated_minutes}m</span>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Task actions"
              >
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit?.(task)
                      setShowActions(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={handleToggleComplete}
                    disabled={isUpdating}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {task.status === 'completed' ? (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        Mark Incomplete
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Mark Complete
                      </>
                    )}
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        onDelete?.(task.id)
                      }
                      setShowActions(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className={`task-title ${task.status === 'completed' ? 'task-title--completed' : ''}`}>
            {task.title}
          </h3>
          <p className="task-description">
            {task.description}
          </p>
        </div>

        {/* Progress */}
        {task.progress > 0 && (
          <div className="mb-4">
            <ProgressBar
              progress={task.progress}
              isCompleted={task.status === 'completed'}
            />
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-4">
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => handleSubtaskToggle(subtask.id)}
                    className={cn(
                      "flex-shrink-0 w-4 h-4 rounded border-2 transition-all",
                      subtask.completed
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 hover:border-blue-400"
                    )}
                  >
                    {subtask.completed && <CheckIcon className="w-3 h-3" />}
                  </button>
                  <span className={cn(
                    "transition-all",
                    subtask.completed ? "text-gray-500 line-through" : "text-gray-700"
                  )}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <TagList tags={task.tags} className="mb-4" />

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            {/* Status Quick Change */}
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as SupabaseTask['status'])}
              disabled={isUpdating}
              className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Start Working Button */}
          {(isSuggested || task.status === 'not_started') && (
            <button
              className="btn btn-primary text-sm px-3 py-1"
              onClick={handleStartWorking}
              disabled={task.status === 'completed'}
            >
              {task.status === 'in_progress' ? '⏸️ Continue' : '⚡ Start'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}