'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/lib/supabase'
import { UpdateTaskInput } from '@/services/taskService'
import { TaskCard } from './TaskCard'

interface DraggableTaskCardProps {
  task: Task
  onStartWorking?: (taskId: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onToggleSubtask?: (taskId: string, subtaskId: string) => void
  onUpdate?: (taskId: string, updates: UpdateTaskInput) => void
  isDragOverlay?: boolean
}

export default function DraggableTaskCard({
  task,
  onStartWorking,
  onEdit,
  onDelete,
  onToggleSubtask,
  onUpdate,
  isDragOverlay = false
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragOverlay ? 'grabbing' : 'grab'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragOverlay ? 'z-50' : ''}
    >
      <TaskCard
        task={task}
        onStartWorking={onStartWorking}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleSubtask={onToggleSubtask}
        onUpdate={onUpdate}
        className={isDragging ? 'shadow-lg scale-105' : ''}
      />
    </div>
  )
}