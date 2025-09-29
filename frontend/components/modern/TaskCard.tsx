'use client'

import { useState, useRef, useEffect } from 'react'
import { Task } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, ClockIcon, CheckIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onStartTimer?: (taskId: string) => void
  onPauseTimer?: (taskId: string) => void
  isExpanded?: boolean
  onToggleExpanded?: () => void
  isDragPreview?: boolean
  className?: string
}

interface SubtaskItemProps {
  subtask: { id: string; title: string; completed: boolean }
  onToggle: () => void
}

const SubtaskItem = ({ subtask, onToggle }: SubtaskItemProps) => (
  <div className="group flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
    <button
      onClick={onToggle}
      className={cn(
        "flex-shrink-0 w-4 h-4 rounded border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
        subtask.completed
          ? "bg-success-500 border-success-500 text-white"
          : "border-gray-300 hover:border-primary-400 group-hover:border-primary-500"
      )}
      aria-label={`Mark subtask "${subtask.title}" as ${subtask.completed ? 'incomplete' : 'complete'}`}
    >
      {subtask.completed && (
        <CheckIcon className="w-3 h-3 stroke-[3]" />
      )}
    </button>

    <span
      className={cn(
        "text-sm transition-all duration-200",
        subtask.completed
          ? "text-gray-500 line-through"
          : "text-gray-700 group-hover:text-gray-900"
      )}
    >
      {subtask.title}
    </span>
  </div>
)

const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    P1: "bg-priority-critical text-white",
    P2: "bg-priority-high text-white",
    P3: "bg-priority-medium text-gray-900",
    P4: "bg-priority-low text-gray-900"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
        "ring-1 ring-inset",
        variants[priority as keyof typeof variants] || variants.P3
      )}
      aria-label={`Priority ${priority}`}
    >
      {priority}
    </span>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    not_started: "bg-gray-100 text-gray-700 ring-gray-600/20",
    in_progress: "bg-blue-50 text-blue-700 ring-blue-600/20",
    completed: "bg-green-50 text-green-700 ring-green-600/20",
    blocked: "bg-red-50 text-red-700 ring-red-600/20",
    cancelled: "bg-gray-100 text-gray-500 ring-gray-600/20"
  }

  const icons = {
    not_started: null,
    in_progress: <PlayIcon className="w-3 h-3" />,
    completed: <CheckIcon className="w-3 h-3" />,
    blocked: <PauseIcon className="w-3 h-3" />,
    cancelled: null
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset",
        variants[status as keyof typeof variants] || variants.not_started
      )}
      aria-label={`Status: ${status.replace('_', ' ')}`}
    >
      {icons[status as keyof typeof icons]}
      {status.replace('_', ' ')}
    </span>
  )
}

const ProgressBar = ({
  progress,
  size = 'md',
  showLabel = true
}: {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">{progress}%</span>
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out",
            heights[size],
            progress === 100 && "from-success-500 to-success-600"
          )}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Task progress: ${progress}%`}
        />
      </div>
    </div>
  )
}

export default function TaskCard({
  task,
  onUpdate,
  onStartTimer,
  onPauseTimer,
  isExpanded = false,
  onToggleExpanded,
  isDragPreview = false,
  className
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleStatusChange = async (newStatus: Task['status']) => {
    setIsUpdating(true)

    const updates: Partial<Task> = { status: newStatus }

    if (newStatus === 'completed') {
      updates.progress = 100
      updates.completed_at = new Date().toISOString()
    } else if (newStatus === 'not_started') {
      updates.progress = 0
    }

    await onUpdate(task.id, updates)
    setIsUpdating(false)
  }

  const handleProgressChange = async (newProgress: number) => {
    setIsUpdating(true)

    const updates: Partial<Task> = { progress: newProgress }

    if (newProgress === 100) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    } else if (newProgress > 0 && task.status === 'not_started') {
      updates.status = 'in_progress'
    }

    await onUpdate(task.id, updates)
    setIsUpdating(false)
  }

  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const totalSubtasks = task.subtasks.length
  const hasSubtasks = totalSubtasks > 0

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200 shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:border-gray-300",
        "focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2",
        task.status === 'completed' && "opacity-75",
        task.status === 'blocked' && "border-l-4 border-l-red-500",
        task.priority === 'P1' && "border-l-4 border-l-red-500",
        isUpdating && "pointer-events-none opacity-50",
        isDragPreview && "rotate-2 scale-105 shadow-xl",
        className
      )}
      role="article"
      aria-labelledby={`task-title-${task.id}`}
      aria-describedby={`task-description-${task.id}`}
    >
      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.time_block && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon className="w-3 h-3" />
                {task.time_block}
              </div>
            )}
          </div>

          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className={cn(
                "flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500",
                isExpanded && "rotate-180"
              )}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse task details" : "Expand task details"}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3
            id={`task-title-${task.id}`}
            className={cn(
              "task-title mb-2 cursor-pointer",
              task.status === 'completed' && "task-title--completed"
            )}
            onClick={onToggleExpanded}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              id={`task-description-${task.id}`}
              className="task-description"
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressBar progress={task.progress} />
        </div>

        {/* Subtasks Preview */}
        {hasSubtasks && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtasks</span>
              <span className="font-medium text-gray-700">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
            {!isExpanded && totalSubtasks > 0 && (
              <div className="mt-2 flex -space-x-1">
                {task.subtasks.slice(0, 3).map((subtask, index) => (
                  <div
                    key={subtask.id}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs",
                      subtask.completed
                        ? "bg-success-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    )}
                    title={subtask.title}
                  >
                    {subtask.completed ? '✓' : index + 1}
                  </div>
                ))}
                {totalSubtasks > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-gray-600 flex items-center justify-center text-xs">
                    +{totalSubtasks - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
              className={cn(
                "text-xs bg-transparent border-0 focus:ring-2 focus:ring-primary-500 rounded-md",
                "cursor-pointer appearance-none pr-6"
              )}
              disabled={isUpdating}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>{task.estimated_minutes}m</span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 pt-4 space-y-6">
          {/* Detailed Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={task.progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isUpdating}
                />
              </div>

              {task.success_criteria && (
                <div>
                  <label className="label mb-2 block">Success Criteria</label>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {task.success_criteria}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">Time Tracking</label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated:</span>
                    <span className="font-medium">{task.estimated_minutes}m</span>
                  </div>
                  {task.actual_minutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual:</span>
                      <span className="font-medium">{task.actual_minutes}m</span>
                    </div>
                  )}
                </div>
              </div>

              {task.tags.length > 0 && (
                <div>
                  <label className="label mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
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

          {/* Subtasks */}
          {hasSubtasks && (
            <div>
              <label className="label mb-3 block">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </label>
              <div className="space-y-1">
                {task.subtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => {
                      // Handle subtask toggle
                      const updatedSubtasks = task.subtasks.map(st =>
                        st.id === subtask.id ? { ...st, completed: !st.completed } : st
                      )
                      const newProgress = Math.round((updatedSubtasks.filter(st => st.completed).length / updatedSubtasks.length) * 100)
                      onUpdate(task.id, {
                        subtasks: updatedSubtasks,
                        progress: newProgress
                      })
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}