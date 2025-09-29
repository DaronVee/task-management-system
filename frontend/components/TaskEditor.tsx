'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@/lib/supabase'
import { CreateTaskInput } from '@/services/taskService'
import { cn } from '@/lib/utils'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['P1', 'P2', 'P3']),
  category: z.enum(['development', 'design', 'admin', 'learning', 'personal', 'meeting', 'planning']),
  estimated_minutes: z.number().min(5).max(480),
  time_block: z.enum(['morning', 'afternoon', 'evening']),
  tags: z.array(z.string()).optional(),
  success_criteria: z.string().max(500, 'Success criteria too long').optional()
})

type TaskFormData = z.infer<typeof taskSchema>

interface SubtaskInput {
  id?: string
  title: string
  completed?: boolean
}

interface TaskEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: CreateTaskInput) => Promise<void>
  task?: Task | null
  mode: 'create' | 'edit'
}

const priorities = [
  { value: 'P1', label: 'P1 - Critical', color: 'bg-red-500' },
  { value: 'P2', label: 'P2 - Important', color: 'bg-orange-500' },
  { value: 'P3', label: 'P3 - Nice to have', color: 'bg-blue-500' }
]

const categories = [
  'development',
  'design',
  'admin',
  'learning',
  'personal',
  'meeting',
  'planning'
]

const timeBlocks = [
  { value: 'morning', label: 'Morning (8-12 AM)' },
  { value: 'afternoon', label: 'Afternoon (1-5 PM)' },
  { value: 'evening', label: 'Evening (6-9 PM)' }
]

export default function TaskEditor({ isOpen, onClose, onSave, task, mode }: TaskEditorProps) {
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'P2',
      category: 'personal',
      estimated_minutes: 30,
      time_block: 'morning',
      tags: []
    }
  })

  // Initialize form when task changes
  useEffect(() => {
    if (task && mode === 'edit') {
      setValue('title', task.title)
      setValue('description', task.description)
      setValue('priority', task.priority)
      setValue('category', task.category)
      setValue('estimated_minutes', task.estimated_minutes)
      setValue('time_block', task.time_block || 'morning')
      setValue('tags', task.tags)
      setValue('success_criteria', task.success_criteria || '')
      setSubtasks(task.subtasks.map(st => ({
        id: st.id,
        title: st.title,
        completed: st.completed
      })))
    } else {
      reset()
      setSubtasks([])
    }
  }, [task, mode, setValue, reset])

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks(prev => [...prev, {
        title: newSubtaskTitle.trim(),
        completed: false
      }])
      setNewSubtaskTitle('')
    }
  }

  const removeSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index))
  }

  const updateSubtask = (index: number, title: string) => {
    setSubtasks(prev => prev.map((subtask, i) =>
      i === index ? { ...subtask, title } : subtask
    ))
  }

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true)
    try {
      const taskData: CreateTaskInput = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        estimated_minutes: data.estimated_minutes,
        time_block: data.time_block,
        tags: data.tags || [],
        subtasks: subtasks.map(st => ({
          title: st.title,
          completed: st.completed || false
        }))
      }

      await onSave(taskData)
      onClose()
      reset()
      setSubtasks([])
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    reset()
    setSubtasks([])
    setNewSubtaskTitle('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.title && "border-red-500"
              )}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add more details..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Time and Time Block */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                {...register('estimated_minutes', { valueAsNumber: true })}
                min="5"
                max="480"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.estimated_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.estimated_minutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Block
              </label>
              <select
                {...register('time_block')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeBlocks.map(block => (
                  <option key={block.value} value={block.value}>
                    {block.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Criteria
            </label>
            <textarea
              {...register('success_criteria')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How will you know this task is complete?"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtasks
            </label>

            <div className="space-y-2 mb-3">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => updateSubtask(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Subtask title"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a subtask..."
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}