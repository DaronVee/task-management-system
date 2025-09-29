'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/lib/supabase'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface FilterOptions {
  search: string
  priority: string[]
  status: string[]
  category: string[]
  timeBlock: string[]
}

interface FilterBarProps {
  tasks: Task[]
  onFilteredTasksChange: (filteredTasks: Task[]) => void
  className?: string
}

const priorities = [
  { value: 'P1', label: 'P1 - Critical', color: 'bg-red-500' },
  { value: 'P2', label: 'P2 - Important', color: 'bg-orange-500' },
  { value: 'P3', label: 'P3 - Nice to have', color: 'bg-blue-500' }
]

const statuses = [
  { value: 'not_started', label: 'Not Started', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-400' }
]

const categories = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'admin', label: 'Admin' },
  { value: 'learning', label: 'Learning' },
  { value: 'personal', label: 'Personal' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'planning', label: 'Planning' }
]

const timeBlocks = [
  { value: 'morning', label: 'Morning (8-12 AM)' },
  { value: 'afternoon', label: 'Afternoon (1-5 PM)' },
  { value: 'evening', label: 'Evening (6-9 PM)' }
]

export default function FilterBar({ tasks, onFilteredTasksChange, className }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    priority: [],
    status: [],
    category: [],
    timeBlock: []
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Apply filters whenever tasks or filters change
  useEffect(() => {
    const filteredTasks = tasks.filter(task => {
      // Search filter
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim()
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          task.subtasks.some(subtask => subtask.title.toLowerCase().includes(searchTerm))

        if (!matchesSearch) return false
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(task.category)) {
        return false
      }

      // Time block filter
      if (filters.timeBlock.length > 0 && task.time_block && !filters.timeBlock.includes(task.time_block)) {
        return false
      }

      return true
    })

    onFilteredTasksChange(filteredTasks)
    setShowResults(filteredTasks.length !== tasks.length)
  }, [tasks, filters, onFilteredTasksChange])

  const handleFilterChange = (type: keyof FilterOptions, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const toggleArrayFilter = (type: 'priority' | 'status' | 'category' | 'timeBlock', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      priority: [],
      status: [],
      category: [],
      timeBlock: []
    })
    setIsExpanded(false)
  }

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.priority.length > 0 ||
    filters.status.length > 0 ||
    filters.category.length > 0 ||
    filters.timeBlock.length > 0

  const activeFilterCount =
    (filters.search.trim() ? 1 : 0) +
    filters.priority.length +
    filters.status.length +
    filters.category.length +
    filters.timeBlock.length

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg shadow-sm", className)}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, tags..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors",
              isExpanded ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <FunnelIcon className="w-4 h-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="space-y-2">
                {priorities.map(priority => (
                  <label key={priority.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority.value)}
                      onChange={() => toggleArrayFilter('priority', priority.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded", priority.color)} />
                      <span className="text-sm">{priority.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {statuses.map(status => (
                  <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status.value)}
                      onChange={() => toggleArrayFilter('status', status.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded", status.color)} />
                      <span className="text-sm">{status.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category.value)}
                      onChange={() => toggleArrayFilter('category', category.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Block Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Block</label>
              <div className="space-y-2">
                {timeBlocks.map(timeBlock => (
                  <label key={timeBlock.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.timeBlock.includes(timeBlock.value)}
                      onChange={() => toggleArrayFilter('timeBlock', timeBlock.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{timeBlock.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {showResults && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-700">
            Showing {tasks.filter(task => {
              // This mirrors the filtering logic above
              if (filters.search.trim()) {
                const searchTerm = filters.search.toLowerCase().trim()
                const matchesSearch =
                  task.title.toLowerCase().includes(searchTerm) ||
                  task.description.toLowerCase().includes(searchTerm) ||
                  task.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                  task.subtasks.some(subtask => subtask.title.toLowerCase().includes(searchTerm))
                if (!matchesSearch) return false
              }
              if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false
              if (filters.status.length > 0 && !filters.status.includes(task.status)) return false
              if (filters.category.length > 0 && !filters.category.includes(task.category)) return false
              if (filters.timeBlock.length > 0 && task.time_block && !filters.timeBlock.includes(task.time_block)) return false
              return true
            }).length} of {tasks.length} tasks
          </p>
        </div>
      )}
    </div>
  )
}