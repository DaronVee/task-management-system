'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Task } from '@/lib/supabase'

interface OptimisticUpdate {
  id: string
  taskId: string
  updates: Partial<Task>
  timestamp: number
  retryCount: number
}

interface UseOptimisticTasksProps {
  tasks: Task[]
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  maxRetries?: number
  retryDelay?: number
}

interface UseOptimisticTasksReturn {
  optimisticTasks: Task[]
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  isUpdating: (taskId: string) => boolean
  hasFailedUpdates: boolean
  retryFailedUpdates: () => void
  clearFailedUpdates: () => void
}

export default function useOptimisticTasks({
  tasks,
  onUpdate,
  maxRetries = 3,
  retryDelay = 1000
}: UseOptimisticTasksProps): UseOptimisticTasksReturn {
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate>>(new Map())
  const [failedUpdates, setFailedUpdates] = useState<Map<string, OptimisticUpdate>>(new Map())
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Apply optimistic updates to tasks
  const optimisticTasks = tasks.map(task => {
    const pendingUpdate = pendingUpdates.get(task.id)
    if (pendingUpdate) {
      return {
        ...task,
        ...pendingUpdate.updates,
        updated_at: new Date().toISOString()
      }
    }
    return task
  })

  // Check if a task is currently being updated
  const isUpdating = useCallback((taskId: string): boolean => {
    return pendingUpdates.has(taskId)
  }, [pendingUpdates])

  // Retry a failed update
  const retryUpdate = useCallback(async (update: OptimisticUpdate) => {
    if (update.retryCount >= maxRetries) {
      return false
    }

    try {
      await onUpdate(update.taskId, update.updates)

      // Remove from failed updates on success
      setFailedUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(update.id)
        return newMap
      })

      return true
    } catch (error) {
      console.error(`Retry ${update.retryCount + 1} failed for task ${update.taskId}:`, error)

      const updatedUpdate = {
        ...update,
        retryCount: update.retryCount + 1
      }

      if (updatedUpdate.retryCount < maxRetries) {
        // Schedule next retry
        const timeoutId = setTimeout(() => {
          retryUpdate(updatedUpdate)
        }, retryDelay * Math.pow(2, updatedUpdate.retryCount)) // Exponential backoff

        retryTimeouts.current.set(update.id, timeoutId)

        // Update failed updates map
        setFailedUpdates(prev => {
          const newMap = new Map(prev)
          newMap.set(update.id, updatedUpdate)
          return newMap
        })
      }

      return false
    }
  }, [onUpdate, maxRetries, retryDelay])

  // Main update function with optimistic updates
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updateId = `${taskId}-${Date.now()}`
    const optimisticUpdate: OptimisticUpdate = {
      id: updateId,
      taskId,
      updates,
      timestamp: Date.now(),
      retryCount: 0
    }

    // Add to pending updates (triggers optimistic UI update)
    setPendingUpdates(prev => new Map(prev).set(taskId, optimisticUpdate))

    try {
      // Attempt the actual update
      await onUpdate(taskId, updates)

      // Remove from pending on success
      setPendingUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })

    } catch (error) {
      console.error(`Failed to update task ${taskId}:`, error)

      // Move from pending to failed
      setPendingUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })

      setFailedUpdates(prev => new Map(prev).set(updateId, optimisticUpdate))

      // Schedule retry
      const timeoutId = setTimeout(() => {
        retryUpdate(optimisticUpdate)
      }, retryDelay)

      retryTimeouts.current.set(updateId, timeoutId)

      // Don't throw - let the optimistic update remain visible
      // The user will see a failure indicator but the UI stays responsive
    }
  }, [onUpdate, retryDelay, retryUpdate])

  // Retry all failed updates
  const retryFailedUpdates = useCallback(() => {
    failedUpdates.forEach(update => {
      // Clear existing timeout
      const existingTimeout = retryTimeouts.current.get(update.id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        retryTimeouts.current.delete(update.id)
      }

      // Reset retry count and retry immediately
      const resetUpdate = { ...update, retryCount: 0 }
      retryUpdate(resetUpdate)
    })
  }, [failedUpdates, retryUpdate])

  // Clear all failed updates (user dismisses errors)
  const clearFailedUpdates = useCallback(() => {
    // Clear all retry timeouts
    failedUpdates.forEach(update => {
      const timeout = retryTimeouts.current.get(update.id)
      if (timeout) {
        clearTimeout(timeout)
        retryTimeouts.current.delete(update.id)
      }
    })

    setFailedUpdates(new Map())
  }, [failedUpdates])

  return {
    optimisticTasks,
    updateTask,
    isUpdating,
    hasFailedUpdates: failedUpdates.size > 0,
    retryFailedUpdates,
    clearFailedUpdates
  }
}