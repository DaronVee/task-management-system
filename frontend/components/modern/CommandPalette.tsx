'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { MagnifyingGlassIcon, ClockIcon, TagIcon, FlagIcon } from '@heroicons/react/24/outline'
import { Task } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  keywords: string[]
  action: () => void
  group?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  onTaskSelect?: (task: Task) => void
  onQuickAction?: (action: string, taskId?: string) => void
}

const useKeyboardShortcut = (key: string, callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, deps)
}

const CommandItem = ({
  command,
  isSelected,
  onClick
}: {
  command: Command
  isSelected: boolean
  onClick: () => void
}) => (
  <button
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
      "focus:outline-none",
      isSelected
        ? "bg-primary-50 text-primary-900"
        : "text-gray-700 hover:bg-gray-50"
    )}
    onClick={onClick}
  >
    {command.icon && (
      <div className={cn(
        "flex-shrink-0 w-5 h-5",
        isSelected ? "text-primary-600" : "text-gray-400"
      )}>
        {command.icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className={cn(
        "font-medium text-sm",
        isSelected ? "text-primary-900" : "text-gray-900"
      )}>
        {command.title}
      </div>
      {command.description && (
        <div className={cn(
          "text-xs mt-0.5",
          isSelected ? "text-primary-700" : "text-gray-500"
        )}>
          {command.description}
        </div>
      )}
    </div>
  </button>
)

const CommandGroup = ({
  title,
  commands,
  selectedIndex,
  onCommandClick
}: {
  title: string
  commands: Command[]
  selectedIndex: number
  onCommandClick: (command: Command) => void
}) => {
  if (commands.length === 0) return null

  return (
    <div className="px-2">
      <div className="caption px-2 py-2">{title}</div>
      <div className="space-y-1">
        {commands.map((command, index) => (
          <CommandItem
            key={command.id}
            command={command}
            isSelected={selectedIndex === index}
            onClick={() => onCommandClick(command)}
          />
        ))}
      </div>
    </div>
  )
}

export default function CommandPalette({
  isOpen,
  onClose,
  tasks,
  onTaskSelect,
  onQuickAction
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Generate commands based on tasks and query
  const commands = useMemo(() => {
    const taskCommands: Command[] = tasks
      .filter(task => {
        if (!query) return false
        const searchText = `${task.title} ${task.description} ${task.category} ${task.priority}`.toLowerCase()
        return searchText.includes(query.toLowerCase())
      })
      .slice(0, 8) // Limit results
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        description: `${task.priority} • ${task.status.replace('_', ' ')} • ${task.estimated_minutes}m`,
        icon: <FlagIcon className="w-5 h-5" />,
        keywords: [task.title, task.description, task.category, task.priority].filter(Boolean),
        action: () => {
          onTaskSelect?.(task)
          onClose()
        },
        group: 'Tasks'
      }))

    const quickActions: Command[] = [
      {
        id: 'create-task',
        title: 'Create New Task',
        description: 'Add a new task to your list',
        icon: <TagIcon className="w-5 h-5" />,
        keywords: ['create', 'new', 'add', 'task'],
        action: () => {
          onQuickAction?.('create-task')
          onClose()
        },
        group: 'Actions'
      },
      {
        id: 'focus-mode',
        title: 'Enter Focus Mode',
        description: 'Hide distractions and focus on current task',
        icon: <ClockIcon className="w-5 h-5" />,
        keywords: ['focus', 'concentrate', 'distraction'],
        action: () => {
          onQuickAction?.('focus-mode')
          onClose()
        },
        group: 'Actions'
      }
    ]

    // Filter quick actions based on query
    const filteredQuickActions = query
      ? quickActions.filter(action =>
          action.keywords.some(keyword =>
            keyword.toLowerCase().includes(query.toLowerCase())
          ) || action.title.toLowerCase().includes(query.toLowerCase())
        )
      : quickActions

    return {
      tasks: taskCommands,
      actions: filteredQuickActions
    }
  }, [tasks, query, onTaskSelect, onQuickAction, onClose])

  // Flatten commands for keyboard navigation
  const allCommands = useMemo(() => [
    ...commands.actions,
    ...commands.tasks
  ], [commands])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, allCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (allCommands[selectedIndex]) {
            allCommands[selectedIndex].action()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, allCommands])

  // Reset selected index when commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [allCommands.length])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div
          ref={modalRef}
          className="w-full max-w-2xl bg-white rounded-xl shadow-xl ring-1 ring-gray-200 overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-4 border-b border-gray-200">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tasks or type a command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 ml-3 bg-transparent border-0 text-gray-900 placeholder-gray-500 focus:outline-none text-base"
            />
            <div className="flex-shrink-0 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto py-2">
            {allCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">
                  {query ? 'No results found' : 'Type to search tasks or commands'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CommandGroup
                  title="Actions"
                  commands={commands.actions}
                  selectedIndex={selectedIndex < commands.actions.length ? selectedIndex : -1}
                  onCommandClick={(command) => command.action()}
                />

                {commands.tasks.length > 0 && (
                  <CommandGroup
                    title="Tasks"
                    commands={commands.tasks}
                    selectedIndex={selectedIndex >= commands.actions.length ? selectedIndex - commands.actions.length : -1}
                    onCommandClick={(command) => command.action()}
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘K</kbd>
                <span>to open</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}