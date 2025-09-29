import React from 'react'
import { Task } from '../types/task'
import { TaskCard } from './TaskCard'

interface AIRecommendationPanelProps {
  recommendation: Task
  currentTimeBlock: string
  onStartWorking: (taskId: string) => void
  className?: string
}

export const AIRecommendationPanel = React.memo(function AIRecommendationPanel({
  recommendation,
  currentTimeBlock,
  onStartWorking,
  className = ''
}: AIRecommendationPanelProps) {
  return (
    <section
      className={`ai-recommendation-panel ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--brand-primary-50) 0%, var(--neutral-0) 100%)',
        border: '1px solid var(--brand-primary-200)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8)',
        marginBottom: 'var(--space-8)',
        boxShadow: 'var(--shadow-brand)'
      }}
      role="region"
      aria-labelledby="ai-recommendation-heading"
    >
      <header className="flex items-center gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            width: 'var(--space-12)',
            height: 'var(--space-12)',
            background: 'var(--gradient-brand)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}
          aria-hidden="true"
        >
          <span style={{ fontSize: 'var(--text-2xl)' }}>🤖</span>
        </div>
        <div>
          <h2
            id="ai-recommendation-heading"
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)'
            }}
          >
            AI Recommendation
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Based on your current time block:{' '}
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              {currentTimeBlock}
            </span>
          </p>
        </div>
      </header>

      <div role="group" aria-label="Recommended task">
        <TaskCard
          task={recommendation}
          isSuggested={true}
          onStartWorking={onStartWorking}
        />
      </div>
    </section>
  )
})