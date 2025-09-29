'use client'

import { useState, useRef, useEffect } from 'react'
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { CreateTaskInput } from '@/services/taskService'
import { cn } from '@/lib/utils'

interface QuickAddTaskProps {
  onAdd: (task: CreateTaskInput) => Promise<void>
  timeBlock?: 'morning' | 'afternoon' | 'evening'
  className?: string
  placeholder?: string
}

export default function QuickAddTask({
  onAdd,
  timeBlock = 'morning',
  className,
  placeholder = "What needs to be done?"
}: QuickAddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P2')
  const [category, setCategory] = useState<'development' | 'design' | 'admin' | 'learning' | 'personal' | 'meeting' | 'planning'>('personal')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Smart parsing for natural language input
  const parseSmartInput = (input: string): Partial<CreateTaskInput> => {
    let parsedTitle = input
    let parsedPriority: 'P1' | 'P2' | 'P3' = 'P2'
    let parsedCategory: 'development' | 'design' | 'admin' | 'learning' | 'personal' | 'meeting' | 'planning' = 'personal'
    let parsedEstimatedMinutes = 30

    // Extract priority keywords
    const priorityKeywords = {
      'urgent': 'P1',
      'critical': 'P1',
      'asap': 'P1',
      'important': 'P2',
      'normal': 'P2',
      'low': 'P3',
      'nice': 'P3'
    }

    Object.entries(priorityKeywords).forEach(([keyword, priority]) => {
      if (input.toLowerCase().includes(keyword)) {
        parsedPriority = priority as 'P1' | 'P2' | 'P3'
        parsedTitle = parsedTitle.replace(new RegExp(keyword, 'gi'), '').trim()
      }
    })

    // Extract category keywords
    const categoryKeywords = {
      'code': 'development',
      'dev': 'development',
      'build': 'development',
      'design': 'design',
      'ui': 'design',
      'ux': 'design',
      'email': 'admin',
      'admin': 'admin',
      'call': 'meeting',
      'meeting': 'meeting',
      'learn': 'learning',
      'study': 'learning',
      'read': 'learning',
      'plan': 'planning'
    }

    Object.entries(categoryKeywords).forEach(([keyword, category]) => {
      if (input.toLowerCase().includes(keyword)) {
        parsedCategory = category as typeof parsedCategory
      }
    })

    // Extract time estimates
    const timeMatch = input.match(/(\d+)\s*(min|minute|minutes|hour|hours|hr|hrs)/i)
    if (timeMatch) {
      const value = parseInt(timeMatch[1])
      const unit = timeMatch[2].toLowerCase()
      if (unit.startsWith('h')) {
        parsedEstimatedMinutes = value * 60
      } else {
        parsedEstimatedMinutes = value
      }
      parsedTitle = parsedTitle.replace(timeMatch[0], '').trim()
    }

    return {
      title: parsedTitle,
      priority: parsedPriority,
      category: parsedCategory,
      estimated_minutes: parsedEstimatedMinutes
    }
  }

  const handleQuickAdd = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const smartParsed = parseSmartInput(title)

      const taskData: CreateTaskInput = {
        title: smartParsed.title || title,
        priority: smartParsed.priority || priority,
        category: smartParsed.category || category,
        estimated_minutes: smartParsed.estimated_minutes || estimatedMinutes,
        time_block: timeBlock,
        tags: []
      }

      await onAdd(taskData)

      // Reset form
      setTitle('')
      setIsExpanded(false)
      setPriority('P2')
      setCategory('personal')
      setEstimatedMinutes(30)
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuickAdd()
    } else if (e.key === 'Escape') {
      setIsExpanded(false)
      setTitle('')
    }
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      if (title.trim()) {
        // Don't close if there's content
        return
      }
      setIsExpanded(false)
    }
  }

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, title])

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-100 transition-all duration-200 group",
          className
        )}
      >
        <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        <span className="group-hover:text-gray-700">
          {placeholder}
        </span>
        <SparklesIcon className="w-4 h-4 ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white border-2 border-blue-200 rounded-lg shadow-sm",
        className
      )}
    >
      <div className="p-4">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done? (Try: 'urgent fix bug 2hrs' or 'design ui')"
          className="w-full text-lg font-medium placeholder-gray-400 border-none outline-none resize-none"
          disabled={isLoading}
        />

        {title.trim() && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Priority:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'P1' | 'P2' | 'P3')}
                className="px-2 py-1 border border-gray-200 rounded text-xs"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - Important</option>
                <option value="P3">P3 - Nice to have</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'development' | 'design' | 'admin' | 'learning' | 'personal' | 'meeting' | 'planning')}
                className="px-2 py-1 border border-gray-200 rounded text-xs"
              >
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="admin">Admin</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
                <option value="meeting">Meeting</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Time:</span>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
                min="5"
                max="480"
                className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
              />
              <span className="text-gray-400 text-xs">min</span>
            </div>
          </div>
        )}
      </div>

      {title.trim() && (
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <SparklesIcon className="w-4 h-4" />
            <span>Smart parsing detected: {parseSmartInput(title).category}, {parseSmartInput(title).priority}, {parseSmartInput(title).estimated_minutes}min</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsExpanded(false)
                setTitle('')
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isLoading || !title.trim()}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}