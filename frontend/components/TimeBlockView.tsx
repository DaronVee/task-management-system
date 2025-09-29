'use client'

import { Task } from '@/lib/supabase'
import { getTasksForTimeBlock, getPriorityColor, formatTime, calculateTaskProgress } from '@/lib/utils'

interface TimeBlockViewProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

interface TimeBlock {
  id: 'morning' | 'afternoon' | 'evening'
  name: string
  icon: string
  time: string
  description: string
  bgColor: string
  borderColor: string
}

export default function TimeBlockView({ tasks, onUpdateTask }: TimeBlockViewProps) {
  const timeBlocks: TimeBlock[] = [
    {
      id: 'morning',
      name: 'Morning',
      icon: '🌅',
      time: '9:00 - 12:00',
      description: 'Deep work & complex tasks',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'afternoon',
      name: 'Afternoon',
      icon: '☀️',
      time: '13:00 - 17:00',
      description: 'Meetings & collaboration',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'evening',
      name: 'Evening',
      icon: '🌙',
      time: '18:00 - 21:00',
      description: 'Admin & planning',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const unscheduledTasks = tasks.filter(task => !task.time_block && task.status !== 'completed')

  const handleStatusToggle = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed'
    const updates: Partial<Task> = {
      status: newStatus as Task['status'],
      progress: newStatus === 'completed' ? 100 : 50,
      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
    }
    onUpdateTask(taskId, updates)
  }

  const renderTask = (task: Task) => {
    const progress = calculateTaskProgress(task)
    const isCompleted = task.status === 'completed'

    return (
      <div
        key={task.id}
        className={`p-3 bg-white rounded-lg border shadow-sm transition-all hover:shadow-md ${
          isCompleted ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(task.estimated_minutes)}
              </span>
            </div>

            <h4
              className={`text-sm font-medium mb-1 ${
                isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Subtasks Count */}
            {task.subtasks.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
              </div>
            )}
          </div>

          {/* Status Toggle */}
          <button
            onClick={() => handleStatusToggle(task.id, task.status)}
            className={`ml-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-primary-500'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && <span className="text-xs">✓</span>}
          </button>
        </div>
      </div>
    )
  }

  const renderTimeBlock = (timeBlock: TimeBlock) => {
    const blockTasks = getTasksForTimeBlock(tasks, timeBlock.id)
    const totalEstimated = blockTasks.reduce((sum, task) => sum + task.estimated_minutes, 0)
    const completedTasks = blockTasks.filter(task => task.status === 'completed').length

    return (
      <div
        key={timeBlock.id}
        className={`${timeBlock.bgColor} ${timeBlock.borderColor} border rounded-lg p-4`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{timeBlock.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{timeBlock.name}</h3>
              <p className="text-sm text-gray-600">{timeBlock.time}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {completedTasks}/{blockTasks.length} tasks
            </div>
            <div className="text-xs text-gray-600">
              {formatTime(totalEstimated)}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{timeBlock.description}</p>

        {/* Tasks */}
        <div className="space-y-3">
          {blockTasks.length > 0 ? (
            blockTasks.map(renderTask)
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm">No tasks scheduled for this time block</p>
            </div>
          )}
        </div>

        {/* Block Summary */}
        {blockTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Block Progress:</span>
              <span className="font-medium">
                {blockTasks.length > 0 ? Math.round((completedTasks / blockTasks.length) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${blockTasks.length > 0 ? (completedTasks / blockTasks.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {timeBlocks.map(renderTimeBlock)}
      </div>

      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📌</span>
              <div>
                <h3 className="font-semibold text-gray-900">Unscheduled</h3>
                <p className="text-sm text-gray-600">Tasks without time blocks</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {unscheduledTasks.length} task{unscheduledTasks.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unscheduledTasks.map(renderTask)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks scheduled
          </h3>
          <p className="text-gray-500">
            Tasks will appear here organized by time blocks.
          </p>
        </div>
      )}
    </div>
  )
}