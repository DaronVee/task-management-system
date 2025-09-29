'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Task } from '@/lib/supabase'
import { TaskStats, ViewMode, TimeBlock } from '../types/task'
import { TaskCard } from '../components/TaskCard'
import { DashboardStats } from '../components/DashboardStats'
import { DashboardHeader } from '../components/DashboardHeader'
import { TimeBlockSection } from '../components/TimeBlockSection'
import TaskEditor from '../components/TaskEditor'
import QuickAddTask from '../components/QuickAddTask'
import DroppableTimeBlock from '../components/DroppableTimeBlock'
import DraggableTaskCard from '../components/DraggableTaskCard'
import useTaskCRUD from '../hooks/useTaskCRUD'
import { CreateTaskInput } from '@/services/taskService'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragCancelEvent
} from '@dnd-kit/core'


export default function TaskDashboard() {
  // Real Supabase data instead of mock data
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    refreshTasks
  } = useTaskCRUD()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Use all tasks for display
  const displayTasks = tasks

  // Calculate stats with memoization for performance (use original tasks, not filtered)
  const stats: TaskStats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
    const totalMinutes = tasks.reduce((sum, task) => sum + task.estimated_minutes, 0)

    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      estimatedHours: Math.round(totalMinutes / 60),
      completionPercentage: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
    }
  }, [tasks])


  // Get current time block (memoized)
  const getCurrentTimeBlock = useCallback((): string => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning Focus'
    if (hour < 17) return 'Afternoon Deep Work'
    return 'Evening Review'
  }, [])

  // Get current time block enum (memoized)
  const getCurrentTimeBlockEnum = useCallback((): TimeBlock => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }, [])

  // Get tasks by time block (memoized)
  const getTasksByTimeBlock = useCallback((timeBlock: TimeBlock): Task[] => {
    return tasks.filter(task => task.time_block === timeBlock)
  }, [tasks])

  // Memoize tasks by time block for better performance (use display tasks)
  const tasksByTimeBlock = useMemo(() => ({
    morning: displayTasks.filter(task => task.time_block === 'morning'),
    afternoon: displayTasks.filter(task => task.time_block === 'afternoon'),
    evening: displayTasks.filter(task => task.time_block === 'evening')
  }), [displayTasks])


  const handleStartWorking = useCallback(async (taskId: string) => {
    console.log('Starting work on task:', taskId)
    try {
      await updateTask(taskId, { status: 'in_progress' })
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }, [updateTask])

  const handleCreateTask = useCallback(async (taskData: CreateTaskInput) => {
    try {
      await createTask(taskData)
      setIsTaskEditorOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }, [createTask])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setIsTaskEditorOpen(true)
  }, [])

  const handleUpdateTask = useCallback(async (taskData: CreateTaskInput) => {
    if (!editingTask) return

    try {
      await updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        estimated_minutes: taskData.estimated_minutes,
        time_block: taskData.time_block,
        tags: taskData.tags,
        success_criteria: taskData.success_criteria
      })
      setIsTaskEditorOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [editingTask, updateTask])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }, [deleteTask])

  // Drag and Drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active task
    const activeTask = tasks.find(task => task.id === activeId)
    if (!activeTask) return

    // If dropped on a time block, update the task's time block
    if (over.data.current?.type === 'timeBlock') {
      const newTimeBlock = over.data.current.timeBlock as TimeBlock

      if (activeTask.time_block !== newTimeBlock) {
        try {
          await updateTask(activeId, { time_block: newTimeBlock })
        } catch (error) {
          console.error('Failed to move task to new time block:', error)
        }
      }
    }
  }, [tasks, updateTask])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  // Get the active task for drag overlay
  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null


  const handleRefresh = useCallback(() => {
    console.log('Refreshing dashboard...')
    refreshTasks()
  }, [refreshTasks])

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])



  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tasks</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div style={{
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '90rem',
          margin: '0 auto',
          padding: 'var(--space-6) var(--space-6) var(--space-8)'
        }}>

          {/* Dashboard Header */}
          <DashboardHeader
            stats={stats}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onRefresh={handleRefresh}
            onCreateTask={() => {
              setEditingTask(null)
              setIsTaskEditorOpen(true)
            }}
          />


          {/* Time Blocks with Drag and Drop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <DroppableTimeBlock
              title="Morning Focus"
              icon="🌅"
              timeRange="9:00 AM - 12:00 PM"
              timeBlock="morning"
              tasks={tasksByTimeBlock.morning}
              isCurrent={getCurrentTimeBlockEnum() === 'morning'}
              onStartWorking={handleStartWorking}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={toggleSubtask}
              onUpdateTask={updateTask}
              quickAddComponent={
                <QuickAddTask
                  onAdd={createTask}
                  timeBlock="morning"
                  placeholder="Add a morning task..."
                />
              }
            />

            <DroppableTimeBlock
              title="Afternoon Deep Work"
              icon="☀️"
              timeRange="1:00 PM - 5:00 PM"
              timeBlock="afternoon"
              tasks={tasksByTimeBlock.afternoon}
              isCurrent={getCurrentTimeBlockEnum() === 'afternoon'}
              onStartWorking={handleStartWorking}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={toggleSubtask}
              onUpdateTask={updateTask}
              quickAddComponent={
                <QuickAddTask
                  onAdd={createTask}
                  timeBlock="afternoon"
                  placeholder="Add an afternoon task..."
                />
              }
            />

            <DroppableTimeBlock
              title="Evening Review"
              icon="🌙"
              timeRange="6:00 PM - 8:00 PM"
              timeBlock="evening"
              tasks={tasksByTimeBlock.evening}
              isCurrent={getCurrentTimeBlockEnum() === 'evening'}
              onStartWorking={handleStartWorking}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={toggleSubtask}
              onUpdateTask={updateTask}
              quickAddComponent={
                <QuickAddTask
                  onAdd={createTask}
                  timeBlock="evening"
                  placeholder="Add an evening task..."
                />
              }
            />
          </div>

          {/* Task Editor Modal */}
          <TaskEditor
            isOpen={isTaskEditorOpen}
            onClose={() => {
              setIsTaskEditorOpen(false)
              setEditingTask(null)
            }}
            onSave={editingTask ? handleUpdateTask : handleCreateTask}
            task={editingTask}
            mode={editingTask ? 'edit' : 'create'}
          />


        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <DraggableTaskCard
            task={activeTask}
            isDragOverlay={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}