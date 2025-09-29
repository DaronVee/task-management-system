import { TaskStats } from '../types/task'

interface DashboardStatsProps {
  stats: TaskStats
  className?: string
}

export function DashboardStats({ stats, className = '' }: DashboardStatsProps) {
  return (
    <div className={`grid grid-cols-4 gap-6 ${className}`}>
      <div className="stat-card stat-card--success">
        <div className="stat-value">{stats.completedTasks}</div>
        <div className="stat-label">Tasks Completed</div>
      </div>

      <div className="stat-card stat-card--primary">
        <div className="stat-value">{stats.inProgressTasks}</div>
        <div className="stat-label">In Progress</div>
      </div>

      <div className="stat-card stat-card--neutral">
        <div className="stat-value">
          {stats.estimatedHours}<span className="stat-unit">h</span>
        </div>
        <div className="stat-label">Time Estimated</div>
      </div>

      <div className="stat-card stat-card--warning">
        <div className="stat-value">
          {stats.completionPercentage}<span className="stat-unit">%</span>
        </div>
        <div className="stat-label">Progress Made</div>
      </div>
    </div>
  )
}