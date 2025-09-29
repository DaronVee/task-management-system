import React from 'react'
import { Task, TimeBlock } from '../types/task'
import { TaskCard } from './TaskCard'

interface TimeBlockSectionProps {
  title: string
  icon: string
  timeRange: string
  timeBlock: TimeBlock
  tasks: Task[]
  isCurrent?: boolean
  onStartWorking: (taskId: string) => void
  className?: string
}

const timeBlockGradients = {
  morning: 'linear-gradient(135deg, var(--warning-400), var(--warning-500))',
  afternoon: 'linear-gradient(135deg, var(--brand-primary-400), var(--brand-primary-500))',
  evening: 'linear-gradient(135deg, var(--neutral-600), var(--neutral-700))'
}

export const TimeBlockSection = React.memo(function TimeBlockSection({
  title,
  icon,
  timeRange,
  timeBlock,
  tasks,
  isCurrent = false,
  onStartWorking,
  className = ''
}: TimeBlockSectionProps) {
  const taskCount = tasks.length

  return (
    <section className={`card ${className}`} style={{ padding: 'var(--space-8)' }} aria-labelledby={`${timeBlock}-heading`}>
      <header className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="flex items-center gap-4">
          <div
            className="time-block-icon"
            style={{
              width: 'var(--space-10)',
              height: 'var(--space-10)',
              background: timeBlockGradients[timeBlock],
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-hidden="true"
          >
            <span style={{ fontSize: 'var(--text-2xl)' }}>{icon}</span>
          </div>
          <div>
            <h2
              id={`${timeBlock}-heading`}
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)'
              }}
            >
              {title}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {timeRange} • {taskCount} task{taskCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isCurrent && (
          <div
            className="current-indicator"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              fontWeight: 'var(--font-weight-medium)'
            }}
            aria-label="Current time block"
          >
            Current
          </div>
        )}
      </header>

      {taskCount === 0 ? (
        <div
          className="empty-state"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) 0',
            color: 'var(--text-tertiary)'
          }}
          role="status"
          aria-live="polite"
        >
          <span style={{
            fontSize: 'var(--text-4xl)',
            marginBottom: 'var(--space-4)',
            display: 'block'
          }}>
            {icon}
          </span>
          <p style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            marginBottom: 'var(--space-2)'
          }}>
            No tasks scheduled for {title.toLowerCase()}
          </p>
          <p style={{ fontSize: 'var(--text-sm)' }}>
            {timeBlock === 'evening'
              ? 'Perfect time for reflection and planning tomorrow'
              : 'Add tasks to get started with your productivity'
            }
          </p>
        </div>
      ) : (
        <div
          className="task-grid"
          style={{
            display: 'grid',
            gap: 'var(--space-6)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))'
          }}
          role="list"
          aria-label={`${title} tasks`}
        >
          {tasks.map(task => (
            <div key={task.id} role="listitem">
              <TaskCard
                task={task}
                onStartWorking={onStartWorking}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
})