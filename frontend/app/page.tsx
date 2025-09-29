'use client'

import { useState, useEffect } from 'react'
import { Subtask } from '../lib/supabase'

// Enhanced mock task data with more realistic details
const mockTasks = [
  {
    id: '1',
    title: 'Build Affiliation System with Affiliation GPT',
    description: 'Develop the technical affiliation system using the Affiliation GPT to create intelligent partner matching and commission tracking',
    priority: 'P1',
    status: 'not_started',
    estimated_minutes: 180,
    actual_minutes: 0,
    time_block: 'morning',
    category: 'development',
    progress: 0,
    tags: ['ai', 'backend', 'partnership'],
    subtasks: [
      { id: '1a', title: 'Design API endpoints', completed: false },
      { id: '1b', title: 'Implement GPT integration', completed: false },
      { id: '1c', title: 'Create partner dashboard', completed: false }
    ],
    success_criteria: 'Fully functional affiliate system with automated partner onboarding'
  },
  {
    id: '2',
    title: 'Create messaging and positioning angles for affiliate program',
    description: 'Develop key messaging strategies, value propositions, and positioning angles that resonate with potential affiliates',
    priority: 'P1',
    status: 'in_progress',
    estimated_minutes: 60,
    actual_minutes: 25,
    time_block: 'morning',
    category: 'marketing',
    progress: 40,
    tags: ['messaging', 'strategy', 'marketing'],
    subtasks: [
      { id: '2a', title: 'Research competitor messaging', completed: true },
      { id: '2b', title: 'Define value propositions', completed: false },
      { id: '2c', title: 'Create messaging framework', completed: false }
    ],
    success_criteria: 'Complete messaging framework with 5 key positioning angles'
  },
  {
    id: '3',
    title: 'Create affiliate resource pack',
    description: 'Develop comprehensive resource pack including swipe copy, email templates, social media assets, and brand guidelines',
    priority: 'P2',
    status: 'completed',
    estimated_minutes: 120,
    actual_minutes: 95,
    time_block: 'afternoon',
    category: 'design',
    progress: 100,
    tags: ['resources', 'design', 'templates'],
    subtasks: [
      { id: '3a', title: 'Create email templates', completed: true },
      { id: '3b', title: 'Design social media assets', completed: true },
      { id: '3c', title: 'Write brand guidelines', completed: true }
    ],
    success_criteria: 'Complete resource pack with 10+ templates and assets'
  },
  {
    id: '4',
    title: 'Set up analytics dashboard',
    description: 'Configure comprehensive analytics to track affiliate performance, conversion rates, and ROI metrics',
    priority: 'P2',
    status: 'not_started',
    estimated_minutes: 90,
    actual_minutes: 0,
    time_block: 'afternoon',
    category: 'analytics',
    progress: 0,
    tags: ['analytics', 'tracking', 'metrics'],
    subtasks: [],
    success_criteria: 'Real-time dashboard showing all key affiliate metrics'
  }
]

// Time block configuration
const timeBlocks = [
  { id: 'morning', name: 'Morning Focus', time: '9:00 AM - 12:00 PM', color: 'var(--warning-500)', icon: '🌅' },
  { id: 'afternoon', name: 'Afternoon Deep Work', time: '1:00 PM - 5:00 PM', color: 'var(--brand-primary-500)', icon: '☀️' },
  { id: 'evening', name: 'Evening Review', time: '6:00 PM - 8:00 PM', color: 'var(--success-500)', icon: '🌙' }
]

// Get current time context
const getCurrentTimeBlock = () => {
  const hour = new Date().getHours()
  if (hour >= 9 && hour < 12) return 'morning'
  if (hour >= 13 && hour < 17) return 'afternoon'
  if (hour >= 18 && hour < 20) return 'evening'
  return 'morning' // default
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState('2025-09-29')
  const [tasks] = useState(mockTasks)
  const [currentTimeBlock, setCurrentTimeBlock] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [viewMode, setViewMode] = useState<'swim-lanes' | 'list' | 'kanban'>('swim-lanes')

  useEffect(() => {
    setCurrentTimeBlock(getCurrentTimeBlock())
    // Update current time block every minute
    const interval = setInterval(() => {
      setCurrentTimeBlock(getCurrentTimeBlock())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate statistics
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalEstimated = tasks.reduce((sum, task) => sum + task.estimated_minutes, 0)
  const totalActual = tasks.reduce((sum, task) => sum + task.actual_minutes, 0)

  // Get current task suggestion
  const getCurrentTaskSuggestion = () => {
    const currentBlockTasks = tasks.filter(t => t.time_block === currentTimeBlock && t.status !== 'completed')
    const p1Tasks = currentBlockTasks.filter(t => t.priority === 'P1')
    if (p1Tasks.length > 0) return p1Tasks[0]
    if (currentBlockTasks.length > 0) return currentBlockTasks[0]
    return null
  }

  const suggestedTask = getCurrentTaskSuggestion()

  // Get tasks by time block for swim lanes view
  const getTasksByTimeBlock = () => {
    return timeBlocks.map(block => ({
      ...block,
      tasks: tasks.filter(task => task.time_block === block.id)
    }))
  }

  const TaskCard = ({ task, isCurrentBlock = false, isSuggested = false }: {
    task: any,
    isCurrentBlock?: boolean,
    isSuggested?: boolean
  }) => (
    <div
      className={`card hover-lift ${isSuggested ? 'card-elevated' : ''} ${task.status === 'completed' ? 'opacity-75' : ''}`}
      style={{
        borderLeft: task.priority === 'P1' ? '4px solid var(--critical-500)' :
                  task.priority === 'P2' ? '4px solid var(--warning-500)' :
                  '4px solid var(--brand-primary-500)',
        ...(isSuggested && {
          boxShadow: 'var(--shadow-brand)',
          transform: 'scale(1.02)'
        })
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <span className={`status-badge status-${task.status.replace('_', '-')}`}>
              {task.status.replace('_', ' ')}
            </span>
            {isSuggested && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{
                background: 'var(--brand-primary-100)',
                color: 'var(--brand-primary-700)'
              }}>
                ⚡ Suggested
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span>{timeBlocks.find(b => b.id === task.time_block)?.icon}</span>
            <span>{task.estimated_minutes}m</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className={`task-title mb-2 ${task.status === 'completed' ? 'task-title--completed' : ''}`}>
            {task.title}
          </h3>
          <p className="task-description">
            {task.description}
          </p>
        </div>

        {/* Progress */}
        {task.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <span className="text-xs font-medium">{task.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${task.status === 'completed' ? 'progress-fill--completed' : ''}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtasks Preview */}
        {task.subtasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Subtasks</span>
              <span>{task.subtasks.filter((st: Subtask) => st.completed).length}/{task.subtasks.length}</span>
            </div>
            <div className="flex gap-1">
              {task.subtasks.slice(0, 5).map((subtask: Subtask, index: number) => (
                <div
                  key={subtask.id}
                  className="w-3 h-3 rounded-full border"
                  style={{
                    background: subtask.completed ? 'var(--success-500)' : 'var(--background-tertiary)',
                    borderColor: subtask.completed ? 'var(--success-500)' : 'var(--border-secondary)'
                  }}
                  title={subtask.title}
                />
              ))}
              {task.subtasks.length > 5 && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  +{task.subtasks.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-md"
                style={{
                  background: 'var(--background-tertiary)',
                  color: 'var(--text-secondary)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {isSuggested && task.status !== 'completed' && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <button className="btn btn-primary btn-sm w-full">
              Start Working
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Smart Dashboard Header */}
      <div className="relative">
        {/* Focus Mode Overlay */}
        {focusMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl pointer-events-none" />
        )}

        <div className="card card-elevated p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Today's Mission
                </h1>
                {focusMode && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{
                    background: 'var(--brand-primary-100)',
                    color: 'var(--brand-primary-700)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-primary-500)' }} />
                    <span className="text-sm font-medium">Focus Mode</span>
                  </div>
                )}
              </div>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                {completedTasks} of {totalTasks} tasks completed • {completionPercentage}% complete
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg p-1" style={{ background: 'var(--background-tertiary)' }}>
                {(['swim-lanes', 'list', 'kanban'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      viewMode === mode
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    {mode === 'swim-lanes' ? 'Swim Lanes' : mode === 'list' ? 'List' : 'Kanban'}
                  </button>
                ))}
              </div>

              {/* Date Picker */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />

              {/* Focus Mode Toggle */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`btn ${focusMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {focusMode ? 'Exit Focus' : 'Focus Mode'}
              </button>

              <button className="btn btn-secondary">
                Refresh
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--success-600)' }}>
                {completedTasks}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--brand-primary-600)' }}>
                {inProgressTasks}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--warning-600)' }}>
                {Math.round(totalEstimated / 60)}h
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Estimated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {completionPercentage}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Progress</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar" style={{ height: 'var(--space-3)' }}>
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Card */}
      {suggestedTask && !focusMode && (
        <div className="animate-slide-down">
          <div className="mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <span className="text-white text-sm">🤖</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                AI Recommendation
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Based on your current time block ({timeBlocks.find(b => b.id === currentTimeBlock)?.name})
              </p>
            </div>
          </div>
          <TaskCard task={suggestedTask} isCurrentBlock={true} isSuggested={true} />
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'swim-lanes' && (
        <div className="space-y-8">
          {getTasksByTimeBlock().map((timeBlock) => {
            const isCurrentBlock = timeBlock.id === currentTimeBlock
            return (
              <div key={timeBlock.id} className="animate-fade-in">
                {/* Time Block Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: timeBlock.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {timeBlock.icon} {timeBlock.name}
                      </h2>
                      {isCurrentBlock && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{
                          background: 'var(--success-100)',
                          color: 'var(--success-700)'
                        }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {timeBlock.time} • {timeBlock.tasks.length} tasks
                    </p>
                  </div>
                </div>

                {/* Tasks Grid */}
                {timeBlock.tasks.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {timeBlock.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isCurrentBlock={isCurrentBlock}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center">
                    <div className="text-4xl mb-4 opacity-50">{timeBlock.icon}</div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      No tasks scheduled for {timeBlock.name.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isCurrentBlock={task.time_block === currentTimeBlock}
            />
          ))}
        </div>
      )}

      {/* Kanban View Placeholder */}
      {viewMode === 'kanban' && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4 opacity-50">🚧</div>
          <h3 className="text-xl font-semibold mb-2">Kanban View</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Coming soon! This view will show tasks organized by status columns.
          </p>
        </div>
      )}
    </div>
  )
}