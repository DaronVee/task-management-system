import React from 'react'
import { TaskStats, ViewMode } from '../types/task'
import { DashboardStats } from './DashboardStats'

interface DashboardHeaderProps {
  stats: TaskStats
  viewMode: ViewMode
  selectedDate: string
  focusMode: boolean
  onViewModeChange: (mode: ViewMode) => void
  onDateChange: (date: string) => void
  onFocusModeToggle: () => void
  onRefresh: () => void
  className?: string
}

export const DashboardHeader = React.memo(function DashboardHeader({
  stats,
  viewMode,
  selectedDate,
  focusMode,
  onViewModeChange,
  onDateChange,
  onFocusModeToggle,
  onRefresh,
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
            {focusMode && (
              <div className="flex items-center gap-2" style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'linear-gradient(135deg, var(--brand-primary-100), var(--brand-primary-200))',
                color: 'var(--brand-primary-700)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--brand-primary-300)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
              role="status"
              aria-live="polite"
              >
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

        <div className="flex items-center gap-4 header-controls">
          {/* View Mode Switcher */}
          <div className="view-mode-switcher" style={{
            display: 'flex',
            background: 'var(--background-tertiary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-1)',
            border: '1px solid var(--border-primary)'
          }}
          role="radiogroup"
          aria-label="View mode selection"
          >
            {(['swim', 'list', 'kanban'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  textTransform: 'capitalize',
                  minWidth: 'auto'
                }}
                role="radio"
                aria-checked={viewMode === mode}
                aria-label={`${mode} view`}
              >
                {mode}
              </button>
            ))}
          </div>

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
              onClick={onFocusModeToggle}
              className={`btn btn-sm ${focusMode ? 'btn-primary' : 'btn-secondary'}`}
              aria-label={focusMode ? 'Disable focus mode' : 'Enable focus mode'}
              aria-pressed={focusMode}
            >
              Focus Mode
            </button>
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