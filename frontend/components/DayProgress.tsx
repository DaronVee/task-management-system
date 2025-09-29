'use client'

import { Task } from '@/lib/supabase'
import { generateTaskSummary, formatTime } from '@/lib/utils'

interface DayProgressProps {
  tasks: Task[]
}

export default function DayProgress({ tasks }: DayProgressProps) {
  const summary = generateTaskSummary(tasks)

  const priorityStats = [
    {
      priority: 'P1',
      count: summary.priorities.P1 || 0,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      priority: 'P2',
      count: summary.priorities.P2 || 0,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      priority: 'P3',
      count: summary.priorities.P3 || 0,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ]

  const categoryStats = Object.entries(summary.categories).map(([category, count]) => ({
    category,
    count,
    percentage: ((count / summary.total_tasks) * 100).toFixed(0)
  }))

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Progress</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Completion</h4>

          {/* Progress Circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - summary.completion_percentage / 100)}`}
                  className="text-primary-600 transition-all duration-300 ease-in-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">
                  {summary.completion_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{summary.completed_tasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-medium">{summary.in_progress_tasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{summary.total_tasks}</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Priority Breakdown</h4>

          <div className="space-y-3">
            {priorityStats.map(({ priority, count, color, bgColor, textColor }) => (
              <div key={priority} className={`${bgColor} rounded-lg p-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className={`font-medium ${textColor}`}>{priority}</span>
                  </div>
                  <span className={`font-semibold ${textColor}`}>{count}</span>
                </div>

                {count > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color} transition-all duration-300`}
                        style={{
                          width: `${(count / summary.total_tasks) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Time & Categories */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Time & Categories</h4>

          {/* Time Stats */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600">Estimated:</span>
                <span className="font-medium text-blue-700">
                  {formatTime(summary.total_estimated_minutes)}
                </span>
              </div>
              {summary.total_actual_minutes > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-600">Actual:</span>
                  <span className="font-medium text-blue-700">
                    {formatTime(summary.total_actual_minutes)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          {categoryStats.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Categories
              </h5>
              {categoryStats.map(({ category, count, percentage }) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">
                    {category.replace('_', ' ')}:
                  </span>
                  <span className="font-medium">
                    {count} ({percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          {summary.completion_percentage >= 80 && (
            <div className="flex items-center text-green-600">
              <span className="mr-1">🎉</span>
              Great progress! You're on track.
            </div>
          )}

          {summary.in_progress_tasks > summary.completed_tasks && (
            <div className="flex items-center text-yellow-600">
              <span className="mr-1">⚡</span>
              Focus on completing current tasks.
            </div>
          )}

          {summary.blocked_tasks > 0 && (
            <div className="flex items-center text-red-600">
              <span className="mr-1">🚫</span>
              {summary.blocked_tasks} task(s) need attention.
            </div>
          )}

          {summary.total_tasks === 0 && (
            <div className="flex items-center text-gray-600">
              <span className="mr-1">📝</span>
              Ready for new tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}