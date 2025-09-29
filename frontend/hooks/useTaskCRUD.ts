'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task } from '@/lib/supabase'
import { taskService, CreateTaskInput, UpdateTaskInput } from '@/services/taskService'

interface UseTaskCRUDReturn {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  createTask: (task: CreateTaskInput) => Promise<void>
  updateTask: (taskId: string, updates: UpdateTaskInput) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>
  addSubtask: (taskId: string, title: string) => Promise<void>
  bulkUpdateTasks: (taskIds: string[], updates: UpdateTaskInput) => Promise<void>
  refreshTasks: () => Promise<void>
}

export default function useTaskCRUD(): UseTaskCRUDReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks on mount
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const loadedTasks = await taskService.getTodayTasks()
      setTasks(loadedTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
      console.error('Failed to load tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    loadTasks()

    const unsubscribe = taskService.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks)
    })

    return unsubscribe
  }, [loadTasks])

  // Create task
  const createTask = useCallback(async (taskInput: CreateTaskInput) => {
    try {
      setError(null)
      const newTask = await taskService.createTask(taskInput)

      // Optimistically update local state
      setTasks(prev => [...prev, newTask])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      throw err
    }
  }, [])

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskInput) => {
    try {
      setError(null)
      const updatedTask = await taskService.updateTask(taskId, updates)

      // Optimistically update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }, [])

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setError(null)
      await taskService.deleteTask(taskId)

      // Optimistically update local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      throw err
    }
  }, [])

  // Toggle subtask
  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    try {
      setError(null)
      const updatedTask = await taskService.toggleSubtask(taskId, subtaskId)

      // Optimistically update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle subtask')
      throw err
    }
  }, [])

  // Add subtask
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    try {
      setError(null)
      const updatedTask = await taskService.addSubtask(taskId, title)

      // Optimistically update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subtask')
      throw err
    }
  }, [])

  // Bulk update tasks
  const bulkUpdateTasks = useCallback(async (taskIds: string[], updates: UpdateTaskInput) => {
    try {
      setError(null)
      const updatedTasks = await taskService.bulkUpdateTasks(taskIds, updates)

      // Optimistically update local state
      setTasks(prev => prev.map(task => {
        const updatedTask = updatedTasks.find(ut => ut.id === task.id)
        return updatedTask || task
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update tasks')
      throw err
    }
  }, [])

  // Refresh tasks manually
  const refreshTasks = useCallback(async () => {
    await loadTasks()
  }, [loadTasks])

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    bulkUpdateTasks,
    refreshTasks
  }
}