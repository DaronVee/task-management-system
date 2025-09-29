import { Task } from '../../types/task'

interface StatusBadgeProps {
  status: Task['status']
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const displayStatus = status.replace('_', ' ')

  return (
    <span className={`status-badge status-${status.replace('_', '-')} ${className}`}>
      {displayStatus}
    </span>
  )
}