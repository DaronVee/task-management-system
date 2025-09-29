import { Task } from '../../types/task'

interface PriorityBadgeProps {
  priority: Task['priority']
  className?: string
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  return (
    <span className={`priority-badge priority-${priority.toLowerCase()} ${className}`}>
      {priority}
    </span>
  )
}