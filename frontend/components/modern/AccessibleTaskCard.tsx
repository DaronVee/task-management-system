'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Task } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface AccessibleTaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onFocus?: (taskId: string) => void
  onActivate?: (taskId: string) => void
  isSelected?: boolean
  index: number
  totalTasks: number
  className?: string
}

// ARIA live region announcements for screen readers
const useScreenReaderAnnouncements = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  return { announce }
}

// Custom hook for keyboard navigation
const useKeyboardNavigation = (
  onActivate: () => void,
  onToggleExpansion: () => void,
  onStatusChange: (status: string) => void
) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onActivate()
        break
      case 'e':
      case 'E':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onToggleExpansion()
        }
        break
      case '1':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onStatusChange('not_started')
        }
        break
      case '2':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onStatusChange('in_progress')
        }
        break
      case '3':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onStatusChange('completed')
        }
        break
      case '4':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onStatusChange('blocked')
        }
        break
    }
  }, [onActivate, onToggleExpansion, onStatusChange])

  return { handleKeyDown }
}

// Progress bar with proper ARIA attributes
const AccessibleProgressBar = ({
  progress,
  taskTitle,
  size = 'md'
}: {
  progress: number
  taskTitle: string
  size?: 'sm' | 'md' | 'lg'
}) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700" id={`progress-label-${taskTitle}`}>
          Progress
        </span>
        <span className="text-sm text-gray-600" aria-hidden="true">
          {progress}%
        </span>
      </div>
      <div
        className={cn("w-full bg-gray-200 rounded-full overflow-hidden", heights[size])}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={`progress-label-${taskTitle}`}
        aria-describedby={`progress-description-${taskTitle}`}
      >
        <div
          className={cn(
            "bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out",
            heights[size],
            progress === 100 && "from-success-500 to-success-600"
          )}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      <div
        id={`progress-description-${taskTitle}`}
        className="sr-only"
      >
        Task completion: {progress} percent completed
      </div>
    </div>
  )
}

// Status selector with proper ARIA support
const AccessibleStatusSelector = ({
  currentStatus,
  onChange,
  taskId,
  disabled = false
}: {
  currentStatus: string
  onChange: (status: string) => void
  taskId: string
  disabled?: boolean
}) => {
  const statusOptions = [
    { value: 'not_started', label: 'Not Started', icon: '⚪' },
    { value: 'in_progress', label: 'In Progress', icon: '🔵' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'blocked', label: 'Blocked', icon: '🚫' }
  ]

  return (
    <div className="space-y-2">
      <label htmlFor={`status-${taskId}`} className="block text-sm font-medium text-gray-700">
        Task Status
      </label>
      <select
        id={`status-${taskId}`}
        value={currentStatus}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          "text-sm"
        )}
        aria-describedby={`status-description-${taskId}`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
      <div id={`status-description-${taskId}`} className="sr-only">
        Change the status of this task. Current status: {currentStatus.replace('_', ' ')}
      </div>
    </div>
  )
}

// Priority badge with semantic meaning
const AccessiblePriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig = {
    P1: {
      label: 'Critical Priority',
      className: 'bg-red-100 text-red-800 border-red-200',
      description: 'This is a critical priority task that requires immediate attention'
    },
    P2: {
      label: 'High Priority',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'This is a high priority task that should be completed soon'
    },
    P3: {
      label: 'Medium Priority',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'This is a medium priority task'
    },
    P4: {
      label: 'Low Priority',
      className: 'bg-green-100 text-green-800 border-green-200',
      description: 'This is a low priority task that can be completed when time allows'
    }
  }

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.P3

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border",
        config.className
      )}
      role="img"
      aria-label={config.label}
      title={config.description}
    >
      {priority}
    </span>
  )
}

export default function AccessibleTaskCard({
  task,
  onUpdate,
  onFocus,
  onActivate,
  isSelected = false,
  index,
  totalTasks,
  className
}: AccessibleTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { announce } = useScreenReaderAnnouncements()

  // Handle status change with accessibility announcements
  const handleStatusChange = useCallback(async (newStatus: string) => {
    setIsUpdating(true)

    const updates: Partial<Task> = { status: newStatus as Task['status'] }

    if (newStatus === 'completed') {
      updates.progress = 100
      updates.completed_at = new Date().toISOString()
    } else if (newStatus === 'not_started') {
      updates.progress = 0
    }

    try {
      await onUpdate(task.id, updates)
      announce(`Task status changed to ${newStatus.replace('_', ' ')}`, 'polite')

      if (newStatus === 'completed') {
        announce(`Congratulations! Task "${task.title}" has been completed!`, 'assertive')
      }
    } catch (error) {
      announce('Failed to update task status. Please try again.', 'assertive')
    } finally {
      setIsUpdating(false)
    }
  }, [task.id, task.title, onUpdate, announce])

  // Handle progress change with announcements
  const handleProgressChange = useCallback(async (newProgress: number) => {
    setIsUpdating(true)

    const updates: Partial<Task> = { progress: newProgress }

    if (newProgress === 100) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    } else if (newProgress > 0 && task.status === 'not_started') {
      updates.status = 'in_progress'
    }

    try {
      await onUpdate(task.id, updates)
      announce(`Progress updated to ${newProgress} percent`, 'polite')
    } catch (error) {
      announce('Failed to update progress. Please try again.', 'assertive')
    } finally {
      setIsUpdating(false)
    }
  }, [task.id, task.status, onUpdate, announce])

  // Toggle expansion with announcement
  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => {
      const newExpanded = !prev
      announce(
        newExpanded ? 'Task details expanded' : 'Task details collapsed',
        'polite'
      )
      return newExpanded
    })
  }, [announce])

  // Keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation(
    () => onActivate?.(task.id),
    toggleExpansion,
    handleStatusChange
  )

  // Focus management
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.focus()
    }
  }, [isSelected])

  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const totalSubtasks = task.subtasks.length

  // Calculate accessible task description
  const taskDescription = [
    `Priority ${task.priority}`,
    `Status: ${task.status.replace('_', ' ')}`,
    `Progress: ${task.progress} percent`,
    task.estimated_minutes && `Estimated time: ${task.estimated_minutes} minutes`,
    totalSubtasks > 0 && `${completedSubtasks} of ${totalSubtasks} subtasks completed`
  ].filter(Boolean).join(', ')

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200 shadow-sm",
        "transition-all duration-200 ease-out focus-within:ring-2 focus-within:ring-primary-500",
        "hover:shadow-md hover:border-gray-300",
        task.status === 'completed' && "opacity-75",
        task.status === 'blocked' && "border-l-4 border-l-red-500",
        task.priority === 'P1' && "border-l-4 border-l-red-500",
        isSelected && "ring-2 ring-primary-500 ring-offset-2",
        isUpdating && "pointer-events-none opacity-50",
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`Task ${index + 1} of ${totalTasks}: ${task.title}`}
      aria-describedby={`task-description-${task.id}`}
      aria-expanded={isExpanded}
      onKeyDown={handleKeyDown}
      onClick={() => onActivate?.(task.id)}
      onFocus={() => onFocus?.(task.id)}
    >
      {/* Skip link for keyboard users */}
      <a
        href={`#task-actions-${task.id}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-10 focus:px-2 focus:py-1 focus:bg-primary-600 focus:text-white focus:rounded"
      >
        Skip to task actions
      </a>

      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AccessiblePriorityBadge priority={task.priority} />
            {task.time_block && (
              <div
                className="flex items-center gap-1 text-xs text-gray-500"
                role="img"
                aria-label={`Scheduled for ${task.time_block}`}
              >
                🕒 {task.time_block}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpansion()
            }}
            className={cn(
              "flex-shrink-0 p-2 rounded-md text-gray-400 hover:text-gray-600",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
              "transition-all duration-200",
              isExpanded && "rotate-180"
            )}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse task details" : "Expand task details"}
            aria-controls={`task-details-${task.id}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Task Title and Description */}
        <div className="mb-4">
          <h3
            className={cn(
              "text-lg font-semibold mb-2 text-gray-900",
              task.status === 'completed' && "line-through text-gray-500"
            )}
            id={`task-title-${task.id}`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className="text-sm text-gray-600"
              id={`task-content-${task.id}`}
            >
              {task.description}
            </p>
          )}

          {/* Hidden description for screen readers */}
          <div id={`task-description-${task.id}`} className="sr-only">
            {taskDescription}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <AccessibleProgressBar
            progress={task.progress}
            taskTitle={task.title}
          />
        </div>

        {/* Quick Actions */}
        <div id={`task-actions-${task.id}`} className="flex items-center justify-between">
          <AccessibleStatusSelector
            currentStatus={task.status}
            onChange={handleStatusChange}
            taskId={task.id}
            disabled={isUpdating}
          />

          <div className="text-sm text-gray-500" aria-label="Estimated duration">
            🕒 {task.estimated_minutes}m
          </div>
        </div>

        {/* Subtasks Summary */}
        {totalSubtasks > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Subtasks</span>
              <span
                className="text-gray-600"
                aria-label={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
              >
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`
                }}
                role="progressbar"
                aria-valuenow={completedSubtasks}
                aria-valuemin={0}
                aria-valuemax={totalSubtasks}
                aria-label="Subtask completion progress"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          id={`task-details-${task.id}`}
          className="border-t border-gray-200 p-6 pt-4"
          role="region"
          aria-labelledby={`task-title-${task.id}`}
        >
          <h4 className="sr-only">Task Details</h4>

          {/* Additional task information would go here */}
          <div className="space-y-4">
            {task.success_criteria && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Success Criteria</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {task.success_criteria}
                </p>
              </div>
            )}

            {task.tags.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Tags</h5>
                <div className="flex flex-wrap gap-2" role="list">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      role="listitem"
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status indicator for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isUpdating ? 'Updating task...' : ''}
      </div>
    </article>
  )
}