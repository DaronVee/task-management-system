'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Task, TaskStats, ViewMode, TimeBlock } from '../types/task'
import { TaskCard } from '../components/TaskCard'
import { DashboardStats } from '../components/DashboardStats'
import { DashboardHeader } from '../components/DashboardHeader'
import { AIRecommendationPanel } from '../components/AIRecommendationPanel'
import { TimeBlockSection } from '../components/TimeBlockSection'

// Mock data with proper typing
const mockTasks: Task[] = [
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
    notes: [],
    success_criteria: 'Fully functional affiliate system with automated partner onboarding',
    dependencies: [],
    created_at: '2025-09-29T08:00:00',
    updated_at: '2025-09-29T08:00:00'
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
    category: 'planning',
    progress: 40,
    tags: ['messaging', 'strategy', 'marketing'],
    subtasks: [
      { id: '2a', title: 'Research competitor messaging', completed: true },
      { id: '2b', title: 'Define value propositions', completed: false },
      { id: '2c', title: 'Create messaging framework', completed: false }
    ],
    notes: [],
    success_criteria: 'Complete messaging framework with 5 key positioning angles',
    dependencies: [],
    created_at: '2025-09-29T08:00:00',
    updated_at: '2025-09-29T08:00:00'
  },
  {
    id: '3',
    title: 'Create affiliate resource pack',
    description: 'Develop comprehensive resource pack including swipe copy, email templates, social media assets, and brand guidelines',
    priority: 'P2',
    status: 'completed',
    estimated_minutes: 120,
    actual_minutes: 115,
    time_block: 'afternoon',
    category: 'design',
    progress: 100,
    tags: ['resources', 'design', 'templates'],
    subtasks: [
      { id: '3a', title: 'Create swipe copy templates', completed: true },
      { id: '3b', title: 'Design social media assets', completed: true },
      { id: '3c', title: 'Develop brand guidelines', completed: true }
    ],
    notes: [],
    success_criteria: 'Complete resource pack with all marketing materials',
    dependencies: [],
    created_at: '2025-09-29T08:00:00',
    updated_at: '2025-09-29T08:00:00',
    completed_at: '2025-09-29T14:30:00'
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
    category: 'development',
    progress: 0,
    tags: ['analytics', 'tracking', 'metrics'],
    subtasks: [],
    notes: [],
    success_criteria: 'Fully functional analytics dashboard with real-time metrics',
    dependencies: [],
    created_at: '2025-09-29T08:00:00',
    updated_at: '2025-09-29T08:00:00'
  }
]

export default function TaskDashboard() {
  const [tasks] = useState<Task[]>(mockTasks)
  const [viewMode, setViewMode] = useState<ViewMode>('swim')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [focusMode, setFocusMode] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // Calculate stats with memoization for performance
  const stats: TaskStats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
    const totalMinutes = tasks.reduce((sum, task) => sum + task.estimated_minutes, 0)

    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      estimatedHours: Math.round(totalMinutes / 60),
      completionPercentage: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
    }
  }, [tasks])

  // Get current time block (memoized)
  const getCurrentTimeBlock = useCallback((): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning Focus'
    if (hour < 17) return 'Afternoon Deep Work'
    return 'Evening Review'
  }, [])

  // Get current time block enum (memoized)
  const getCurrentTimeBlockEnum = useCallback((): TimeBlock => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }, [])

  // Get tasks by time block (memoized)
  const getTasksByTimeBlock = useCallback((timeBlock: TimeBlock): Task[] => {
    return tasks.filter(task => task.time_block === timeBlock)
  }, [tasks])

  // Memoize tasks by time block for better performance
  const tasksByTimeBlock = useMemo(() => ({
    morning: tasks.filter(task => task.time_block === 'morning'),
    afternoon: tasks.filter(task => task.time_block === 'afternoon'),
    evening: tasks.filter(task => task.time_block === 'evening')
  }), [tasks])

  // Get current recommendation (memoized)
  const currentRecommendation = useMemo(() =>
    tasks.find(task => task.status === 'not_started' && task.priority === 'P1'),
    [tasks]
  )

  const handleStartWorking = useCallback((taskId: string) => {
    console.log('Starting work on task:', taskId)
    // TODO: Implement task start logic
  }, [])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  const handleRefresh = useCallback(() => {
    console.log('Refreshing dashboard...')
    // TODO: Implement refresh logic
  }, [])

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleFocusModeToggle = useCallback(() => {
    setFocusMode(!focusMode)
  }, [focusMode])

  // Keyboard navigation and shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check for modifier keys (Ctrl/Cmd)
    const isModified = event.ctrlKey || event.metaKey

    // Handle keyboard shortcuts
    if (isModified) {
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault()
          handleRefresh()
          break
        case 'f':
          event.preventDefault()
          handleFocusModeToggle()
          break
        case '1':
          event.preventDefault()
          setViewMode('swim')
          break
        case '2':
          event.preventDefault()
          setViewMode('list')
          break
        case '3':
          event.preventDefault()
          setViewMode('kanban')
          break
        case '?':
        case '/':
          event.preventDefault()
          setShowKeyboardShortcuts(!showKeyboardShortcuts)
          break
      }
    }

    // Handle escape key
    if (event.key === 'Escape') {
      setShowKeyboardShortcuts(false)
    }
  }, [showKeyboardShortcuts, focusMode, handleRefresh, handleFocusModeToggle])

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div style={{
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-6) var(--space-8)'
      }}>

        {/* Dashboard Header */}
        <DashboardHeader
          stats={stats}
          viewMode={viewMode}
          selectedDate={selectedDate}
          focusMode={focusMode}
          onViewModeChange={handleViewModeChange}
          onDateChange={handleDateChange}
          onFocusModeToggle={handleFocusModeToggle}
          onRefresh={handleRefresh}
        />

        {/* AI Recommendation Panel */}
        {currentRecommendation && (
          <AIRecommendationPanel
            recommendation={currentRecommendation}
            currentTimeBlock={getCurrentTimeBlock()}
            onStartWorking={handleStartWorking}
          />
        )}

        {/* Time Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <TimeBlockSection
            title="Morning Focus"
            icon="🌅"
            timeRange="9:00 AM - 12:00 PM"
            timeBlock="morning"
            tasks={tasksByTimeBlock.morning}
            isCurrent={getCurrentTimeBlockEnum() === 'morning'}
            onStartWorking={handleStartWorking}
          />

          <TimeBlockSection
            title="Afternoon Deep Work"
            icon="☀️"
            timeRange="1:00 PM - 5:00 PM"
            timeBlock="afternoon"
            tasks={tasksByTimeBlock.afternoon}
            isCurrent={getCurrentTimeBlockEnum() === 'afternoon'}
            onStartWorking={handleStartWorking}
          />

          <TimeBlockSection
            title="Evening Review"
            icon="🌙"
            timeRange="6:00 PM - 8:00 PM"
            timeBlock="evening"
            tasks={tasksByTimeBlock.evening}
            isCurrent={getCurrentTimeBlockEnum() === 'evening'}
            onStartWorking={handleStartWorking}
          />
        </div>

        {/* Keyboard Shortcuts Help Modal */}
        {showKeyboardShortcuts && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-modal-backdrop"
            style={{
              background: 'var(--background-overlay)'
            }}
            onClick={() => setShowKeyboardShortcuts(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div
              className="card animate-modal-slide"
              style={{
                maxWidth: '32rem',
                margin: 'var(--space-4)',
                padding: 'var(--space-8)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
                <h2
                  id="shortcuts-title"
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="btn btn-ghost"
                  style={{
                    minWidth: 'auto',
                    padding: 'var(--space-2)'
                  }}
                  aria-label="Close shortcuts help"
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Refresh Dashboard</span>
                  <kbd className="kbd">⌘ + R</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Toggle Focus Mode</span>
                  <kbd className="kbd">⌘ + F</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Switch to Swim View</span>
                  <kbd className="kbd">⌘ + 1</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Switch to List View</span>
                  <kbd className="kbd">⌘ + 2</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Switch to Kanban View</span>
                  <kbd className="kbd">⌘ + 3</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Show/Hide Shortcuts</span>
                  <kbd className="kbd">⌘ + ?</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Close Modal</span>
                  <kbd className="kbd">Esc</kbd>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  background: 'var(--background-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)'
                }}
              >
                💡 Tip: Use Tab to navigate between interactive elements and Enter/Space to activate them.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}