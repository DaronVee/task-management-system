'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
// @ts-ignore - react-window types issue
import { FixedSizeList as List } from 'react-window'
import { Task } from '@/lib/supabase'
import TaskCard from './TaskCard'
import { cn } from '@/lib/utils'

interface VirtualizedTaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onAddSubtask?: (taskId: string, subtaskTitle: string) => void
  onToggleSubtask?: (taskId: string, subtaskId: string) => void
  itemHeight?: number
  className?: string
  showSearch?: boolean
  showFilters?: boolean
}

interface TaskItemProps {
  index: number
  style: React.CSSProperties
  data: {
    tasks: Task[]
    expandedTasks: Set<string>
    onToggleExpanded: (taskId: string) => void
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void
    onAddSubtask?: (taskId: string, subtaskTitle: string) => void
    onToggleSubtask?: (taskId: string, subtaskId: string) => void
  }
}

const TaskItem = ({ index, style, data }: TaskItemProps) => {
  const {
    tasks,
    expandedTasks,
    onToggleExpanded,
    onUpdateTask,
    onAddSubtask,
    onToggleSubtask
  } = data

  const task = tasks[index]
  if (!task) return null

  const isExpanded = expandedTasks.has(task.id)

  return (
    <div style={style} className="px-4 pb-4">
      <TaskCard
        task={task}
        onUpdate={onUpdateTask}
        isExpanded={isExpanded}
        onToggleExpanded={() => onToggleExpanded(task.id)}
        className="h-full"
      />
    </div>
  )
}

interface FilterChipProps {
  label: string
  count?: number
  isActive: boolean
  onClick: () => void
}

const FilterChip = ({ label, count, isActive, onClick }: FilterChipProps) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
      "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500",
      isActive
        ? "bg-primary-100 text-primary-700 border border-primary-200"
        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
    )}
  >
    <span>{label}</span>
    {count !== undefined && (
      <span className={cn(
        "px-1.5 py-0.5 rounded-full text-xs",
        isActive ? "bg-primary-200 text-primary-800" : "bg-gray-100 text-gray-500"
      )}>
        {count}
      </span>
    )}
  </button>
)

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBar = ({ value, onChange, placeholder = "Search tasks..." }: SearchBarProps) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
        "bg-white text-gray-900 placeholder-gray-500"
      )}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
)

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function VirtualizedTaskList({
  tasks,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  itemHeight = 200,
  className,
  showSearch = true,
  showFilters = true
}: VirtualizedTaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['all']))
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const listRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce search for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      )
    }

    // Apply status/priority filters
    if (!activeFilters.has('all')) {
      filtered = filtered.filter(task => {
        if (activeFilters.has('p1') && task.priority === 'P1') return true
        if (activeFilters.has('p2') && task.priority === 'P2') return true
        if (activeFilters.has('p3') && task.priority === 'P3') return true
        if (activeFilters.has('completed') && task.status === 'completed') return true
        if (activeFilters.has('in_progress') && task.status === 'in_progress') return true
        if (activeFilters.has('blocked') && task.status === 'blocked') return true
        return false
      })
    }

    return filtered
  }, [tasks, debouncedSearchQuery, activeFilters])

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts = {
      all: tasks.length,
      p1: tasks.filter(t => t.priority === 'P1').length,
      p2: tasks.filter(t => t.priority === 'P2').length,
      p3: tasks.filter(t => t.priority === 'P3').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    }
    return counts
  }, [tasks])

  // Toggle filter
  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)

      if (filter === 'all') {
        return new Set(['all'])
      }

      newFilters.delete('all')

      if (newFilters.has(filter)) {
        newFilters.delete(filter)
      } else {
        newFilters.add(filter)
      }

      if (newFilters.size === 0) {
        newFilters.add('all')
      }

      return newFilters
    })
  }, [])

  // Toggle task expansion
  const toggleTaskExpansion = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId)
      } else {
        newExpanded.add(taskId)
      }
      return newExpanded
    })
  }, [])

  // Optimistic update wrapper
  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    // Optimistically update local state if needed
    await onUpdateTask(taskId, updates)
  }, [onUpdateTask])

  // Calculate dynamic item height based on expansion
  const getItemHeight = useCallback((index: number) => {
    const task = filteredTasks[index]
    if (!task) return itemHeight

    const isExpanded = expandedTasks.has(task.id)
    const baseHeight = 200
    const expandedHeight = 400 + (task.subtasks.length * 40)

    return isExpanded ? expandedHeight : baseHeight
  }, [filteredTasks, expandedTasks, itemHeight])

  // Auto-scroll to focused task
  const scrollToTask = useCallback((taskId: string) => {
    const index = filteredTasks.findIndex(task => task.id === taskId)
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToItem(index, 'center')
    }
  }, [filteredTasks])

  // Prepare data for virtual list
  const listData = useMemo(() => ({
    tasks: filteredTasks,
    expandedTasks,
    onToggleExpanded: toggleTaskExpansion,
    onUpdateTask: handleUpdateTask,
    onAddSubtask,
    onToggleSubtask
  }), [filteredTasks, expandedTasks, toggleTaskExpansion, handleUpdateTask, onAddSubtask, onToggleSubtask])

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="heading-3 mb-2">No tasks yet</h3>
        <p className="body-base text-gray-500">
          Your tasks will appear here once you process your brain dump.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)} ref={containerRef}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, description, or category..."
            />
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All"
                count={filterCounts.all}
                isActive={activeFilters.has('all')}
                onClick={() => toggleFilter('all')}
              />
              <FilterChip
                label="P1"
                count={filterCounts.p1}
                isActive={activeFilters.has('p1')}
                onClick={() => toggleFilter('p1')}
              />
              <FilterChip
                label="P2"
                count={filterCounts.p2}
                isActive={activeFilters.has('p2')}
                onClick={() => toggleFilter('p2')}
              />
              <FilterChip
                label="P3"
                count={filterCounts.p3}
                isActive={activeFilters.has('p3')}
                onClick={() => toggleFilter('p3')}
              />
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <FilterChip
                label="In Progress"
                count={filterCounts.in_progress}
                isActive={activeFilters.has('in_progress')}
                onClick={() => toggleFilter('in_progress')}
              />
              <FilterChip
                label="Completed"
                count={filterCounts.completed}
                isActive={activeFilters.has('completed')}
                onClick={() => toggleFilter('completed')}
              />
              <FilterChip
                label="Blocked"
                count={filterCounts.blocked}
                isActive={activeFilters.has('blocked')}
                onClick={() => toggleFilter('blocked')}
              />
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="body-small text-gray-500">
          {filteredTasks.length === tasks.length
            ? `${tasks.length} task${tasks.length === 1 ? '' : 's'}`
            : `${filteredTasks.length} of ${tasks.length} task${tasks.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      {/* Virtual List */}
      {filteredTasks.length > 0 ? (
        <div className="h-[600px] border border-gray-200 rounded-lg bg-gray-50">
          <List
            ref={listRef}
            height={600}
            itemCount={filteredTasks.length}
            itemSize={getItemHeight}
            itemData={listData}
            overscanCount={5}
          >
            {TaskItem}
          </List>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="heading-4 mb-2">No tasks found</h3>
          <p className="body-base text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setActiveFilters(new Set(['all']))
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}