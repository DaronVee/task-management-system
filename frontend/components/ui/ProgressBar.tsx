interface ProgressBarProps {
  progress: number
  isCompleted?: boolean
  className?: string
}

export function ProgressBar({ progress, isCompleted = false, className = '' }: ProgressBarProps) {
  return (
    <div className={`progress-container ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="label">Progress</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {progress}%
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${isCompleted ? 'progress-fill--completed' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}