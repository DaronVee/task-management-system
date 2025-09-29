import React from 'react'
import { TaskStats, ViewMode } from '../types/task'
import { DashboardStats } from './DashboardStats'

interface DashboardHeaderProps {
  stats: TaskStats
  selectedDate: string
  onDateChange: (date: string) => void
  onRefresh: () => void
  onCreateTask?: () => void
  className?: string
}

export const DashboardHeader = React.memo(function DashboardHeader({
  stats,
  selectedDate,
  onDateChange,
  onRefresh,
  onCreateTask,
  className = ''
}: DashboardHeaderProps) {
  return (
    <header className={`card card-elevated dashboard-header ${className}`} style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-8)' }}>
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

        <div className="flex items-center gap-4 header-controls">
          {/* Create Task Button */}
          {onCreateTask && (
            <button
              onClick={onCreateTask}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
              aria-label="Create new task"
            >
              <span style={{ fontSize: 'var(--text-lg)' }}>+</span>
              New Task
            </button>
          )}


          {/* Controls */}
          <div className="flex items-center gap-3">
            <label htmlFor="date-picker" className="sr-only">Select date</label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="input"
              style={{ width: 'auto' }}
              aria-label="Date selection"
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={onRefresh}
              aria-label="Refresh dashboard"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <DashboardStats stats={stats} />
      </div>
    </header>
  )
})