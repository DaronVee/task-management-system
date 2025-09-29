'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task } from '@/lib/supabase'
import { UpdateTaskInput } from '@/services/taskService'
import { TimeBlock } from '../types/task'
import DraggableTaskCard from './DraggableTaskCard'
import { cn } from '@/lib/utils'

interface DroppableTimeBlockProps {
  title: string
  icon: string
  timeRange: string
  timeBlock: TimeBlock
  tasks: Task[]
  isCurrent?: boolean
  onStartWorking: (taskId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onToggleSubtask?: (taskId: string, subtaskId: string) => void
  onUpdateTask?: (taskId: string, updates: UpdateTaskInput) => void
  quickAddComponent?: React.ReactNode
  className?: string
}

const timeBlockGradients = {
  morning: 'linear-gradient(135deg, var(--warning-400), var(--warning-500))',
  afternoon: 'linear-gradient(135deg, var(--brand-primary-400), var(--brand-primary-500))',
  evening: 'linear-gradient(135deg, var(--neutral-600), var(--neutral-700))'
}

export default function DroppableTimeBlock({
  title,
  icon,
  timeRange,
  timeBlock,
  tasks,
  isCurrent = false,
  onStartWorking,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onUpdateTask,
  quickAddComponent,
  className = ''
}: DroppableTimeBlockProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: timeBlock,
    data: {
      type: 'timeBlock',
      timeBlock
    }
  })

  const taskCount = tasks.length
  const taskIds = tasks.map(task => task.id)

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'card transition-all duration-200',
        isOver && 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50',
        className
      )}
      style={{ padding: 'var(--space-8)' }}
      aria-labelledby={`${timeBlock}-heading`}
    >
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

      <div style={{ marginBottom: 'var(--space-6)' }}>
        {quickAddComponent}
      </div>

      {/* Drop Zone Indicator */}
      {isOver && taskCount === 0 && (
        <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 mb-6 bg-blue-50 text-center">
          <div className="text-blue-600 text-lg mb-2">Drop task here</div>
          <div className="text-blue-500 text-sm">Move this task to {title.toLowerCase()}</div>
        </div>
      )}

      {taskCount === 0 && !isOver ? (
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
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            className={cn(
              "task-grid transition-all duration-200",
              isOver && "p-2 border-2 border-dashed border-blue-300 rounded-lg bg-blue-25"
            )}
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
                <DraggableTaskCard
                  task={task}
                  onStartWorking={onStartWorking}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleSubtask={onToggleSubtask}
                  onUpdate={onUpdateTask}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      )}
    </section>
  )
}