'use client'

import { useState } from 'react'
import { Task, TaskStats, ViewMode, TimeBlock } from '../types/task'
import { TaskCard } from '../components/TaskCard'
import { DashboardStats } from '../components/DashboardStats'

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

  // Calculate stats
  const stats: TaskStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    inProgressTasks: tasks.filter(task => task.status === 'in_progress').length,
    estimatedHours: Math.round(tasks.reduce((sum, task) => sum + task.estimated_minutes, 0) / 60),
    completionPercentage: Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100)
  }

  // Get current time block
  const getCurrentTimeBlock = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning Focus'
    if (hour < 17) return 'Afternoon Deep Work'
    return 'Evening Review'
  }

  // Get tasks by time block
  const getTasksByTimeBlock = (timeBlock: TimeBlock): Task[] => {
    return tasks.filter(task => task.time_block === timeBlock)
  }

  // Get current recommendation
  const currentRecommendation = tasks.find(task =>
    task.status === 'not_started' && task.priority === 'P1'
  )

  const handleStartWorking = (taskId: string) => {
    console.log('Starting work on task:', taskId)
    // TODO: Implement task start logic
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--neutral-50) 0%, var(--brand-primary-50) 30%, var(--neutral-100) 100%)'
    }}>
      <div style={{
        maxWidth: '90rem',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-6) var(--space-8)'
      }}>

        {/* Dashboard Header */}
        <div className="card card-elevated" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-8)' }}>
          <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="flex items-center gap-4">
                <h1 style={{
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  background: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Today's Mission
                </h1>
                {focusMode && (
                  <div className="flex items-center gap-2" style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'linear-gradient(135deg, var(--brand-primary-100), var(--brand-primary-200))',
                    color: 'var(--brand-primary-700)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--brand-primary-300)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    <div style={{
                      width: 'var(--space-2)',
                      height: 'var(--space-2)',
                      borderRadius: '50%',
                      background: 'var(--brand-primary-500)',
                      animation: 'priority-pulse 2s ease-in-out infinite'
                    }} />
                    Focus Mode Active
                  </div>
                )}
              </div>
              <p style={{
                fontSize: 'var(--text-xl)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)'
              }}>
                <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                  {stats.completedTasks}
                </span> of{' '}
                <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                  {stats.totalTasks}
                </span> tasks completed •{' '}
                <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--success-600)' }}>
                  {stats.completionPercentage}%
                </span> complete
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Switcher */}
              <div style={{
                display: 'flex',
                background: 'var(--background-tertiary)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-1)',
                border: '1px solid var(--border-primary)'
              }}>
                {(['swim', 'list', 'kanban'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      textTransform: 'capitalize',
                      minWidth: 'auto'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                  style={{ width: 'auto' }}
                />
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`btn btn-sm ${focusMode ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Focus Mode
                </button>
                <button className="btn btn-secondary btn-sm">
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <DashboardStats stats={stats} />
        </div>

        {/* AI Recommendation Panel */}
        {currentRecommendation && (
          <div style={{
            background: 'linear-gradient(135deg, var(--brand-primary-50) 0%, var(--neutral-0) 100%)',
            border: '1px solid var(--brand-primary-200)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            boxShadow: 'var(--shadow-brand)'
          }}>
            <div className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: 'var(--space-12)',
                height: 'var(--space-12)',
                background: 'var(--gradient-brand)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <span style={{ fontSize: 'var(--text-2xl)' }}>🤖</span>
              </div>
              <div>
                <h2 style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  AI Recommendation
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Based on your current time block:{' '}
                  <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                    {getCurrentTimeBlock()}
                  </span>
                </p>
              </div>
            </div>
            <TaskCard
              task={currentRecommendation}
              isSuggested={true}
              onStartWorking={handleStartWorking}
            />
          </div>
        )}

        {/* Time Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Morning Focus */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center gap-4">
                <div style={{
                  width: 'var(--space-10)',
                  height: 'var(--space-10)',
                  background: 'linear-gradient(135deg, var(--warning-400), var(--warning-500))',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 'var(--text-2xl)' }}>🌅</span>
                </div>
                <div>
                  <h2 style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)'
                  }}>
                    Morning Focus
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    9:00 AM - 12:00 PM • {getTasksByTimeBlock('morning').length} tasks
                  </p>
                </div>
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                Current
              </div>
            </div>
            <div style={{
              display: 'grid',
              gap: 'var(--space-6)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
            }}>
              {getTasksByTimeBlock('morning').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStartWorking={handleStartWorking}
                />
              ))}
            </div>
          </div>

          {/* Afternoon Deep Work */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center gap-4">
                <div style={{
                  width: 'var(--space-10)',
                  height: 'var(--space-10)',
                  background: 'linear-gradient(135deg, var(--brand-primary-400), var(--brand-primary-500))',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 'var(--text-2xl)' }}>☀️</span>
                </div>
                <div>
                  <h2 style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)'
                  }}>
                    Afternoon Deep Work
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    1:00 PM - 5:00 PM • {getTasksByTimeBlock('afternoon').length} tasks
                  </p>
                </div>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gap: 'var(--space-6)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
            }}>
              {getTasksByTimeBlock('afternoon').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStartWorking={handleStartWorking}
                />
              ))}
            </div>
          </div>

          {/* Evening Review */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center gap-4">
                <div style={{
                  width: 'var(--space-10)',
                  height: 'var(--space-10)',
                  background: 'linear-gradient(135deg, var(--neutral-600), var(--neutral-700))',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 'var(--text-2xl)' }}>🌙</span>
                </div>
                <div>
                  <h2 style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)'
                  }}>
                    Evening Review
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    6:00 PM - 8:00 PM • {getTasksByTimeBlock('evening').length} tasks
                  </p>
                </div>
              </div>
            </div>
            {getTasksByTimeBlock('evening').length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-12) 0',
                color: 'var(--text-tertiary)'
              }}>
                <span style={{
                  fontSize: 'var(--text-4xl)',
                  marginBottom: 'var(--space-4)',
                  display: 'block'
                }}>
                  🌙
                </span>
                <p style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--space-2)'
                }}>
                  No tasks scheduled for evening review
                </p>
                <p style={{ fontSize: 'var(--text-sm)' }}>
                  Perfect time for reflection and planning tomorrow
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: 'var(--space-6)',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
              }}>
                {getTasksByTimeBlock('evening').map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStartWorking={handleStartWorking}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}