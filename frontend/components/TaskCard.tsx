import { Task } from '../types/task'
import { PriorityBadge } from './ui/PriorityBadge'
import { StatusBadge } from './ui/StatusBadge'
import { ProgressBar } from './ui/ProgressBar'
import { SubtaskIndicator } from './ui/SubtaskIndicator'
import { TagList } from './ui/TagList'

interface TaskCardProps {
  task: Task
  isSuggested?: boolean
  onStartWorking?: (taskId: string) => void
  className?: string
}

export function TaskCard({ task, isSuggested = false, onStartWorking, className = '' }: TaskCardProps) {
  const getTimeBlockIcon = (timeBlock: string) => {
    switch (timeBlock) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌙'
      default: return '⏰'
    }
  }

  const handleStartWorking = () => {
    if (onStartWorking && task.status !== 'completed') {
      onStartWorking(task.id)
    }
  }

  return (
    <div className={`card ${isSuggested ? 'card-suggested' : ''} ${className}`}>
      <div style={{ padding: 'var(--space-6)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span>{getTimeBlockIcon(task.time_block)}</span>
            <span className="font-medium">{task.estimated_minutes}m</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className={`task-title ${task.status === 'completed' ? 'task-title--completed' : ''}`}>
            {task.title}
          </h3>
          <p className="task-description">
            {task.description}
          </p>
        </div>

        {/* Progress */}
        {task.progress > 0 && (
          <div className="mb-4">
            <ProgressBar
              progress={task.progress}
              isCompleted={task.status === 'completed'}
            />
          </div>
        )}

        {/* Subtasks */}
        <SubtaskIndicator subtasks={task.subtasks} className="mb-4" />

        {/* Tags */}
        <TagList tags={task.tags} className="mb-4" />

        {/* Action Button */}
        {isSuggested && task.status !== 'completed' && (
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <button
              className="btn btn-primary w-full"
              onClick={handleStartWorking}
            >
              ⚡ Start Working
            </button>
          </div>
        )}
      </div>
    </div>
  )
}