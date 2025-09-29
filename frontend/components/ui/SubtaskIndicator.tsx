import { Subtask } from '../../types/task'

interface SubtaskIndicatorProps {
  subtasks: Subtask[]
  maxVisible?: number
  className?: string
}

export function SubtaskIndicator({ subtasks, maxVisible = 6, className = '' }: SubtaskIndicatorProps) {
  if (subtasks.length === 0) return null

  const completedCount = subtasks.filter(st => st.completed).length
  const visibleSubtasks = subtasks.slice(0, maxVisible)
  const hasMore = subtasks.length > maxVisible

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <span className="label">Subtasks</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {completedCount}/{subtasks.length}
        </span>
      </div>
      <div className="flex gap-2 items-center">
        {visibleSubtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={`w-3 h-3 rounded-full border-2 ${
              subtask.completed
                ? 'subtask-completed'
                : 'subtask-pending'
            }`}
            title={subtask.title}
            style={{
              background: subtask.completed ? 'var(--success-500)' : 'var(--background-tertiary)',
              borderColor: subtask.completed ? 'var(--success-500)' : 'var(--border-secondary)'
            }}
          />
        ))}
        {hasMore && (
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            +{subtasks.length - maxVisible} more
          </span>
        )}
      </div>
    </div>
  )
}