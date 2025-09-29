import { supabase } from '@/lib/supabase'
import { Task, DailyTasks, Subtask } from '@/lib/supabase'
import { format } from 'date-fns'

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: 'P1' | 'P2' | 'P3'
  category?: string
  estimated_minutes?: number
  time_block?: 'morning' | 'afternoon' | 'evening'
  tags?: string[]
  subtasks?: Omit<Subtask, 'id'>[]
  success_criteria?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: 'P1' | 'P2' | 'P3'
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  progress?: number
  category?: string
  estimated_minutes?: number
  actual_minutes?: number
  time_block?: 'morning' | 'afternoon' | 'evening'
  tags?: string[]
  notes?: string[]
  success_criteria?: string
}

class TaskService {
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSubtaskId(): string {
    return `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async getTodayTasks(): Promise<Task[]> {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('daily_tasks')
      .select('tasks')
      .eq('date', today)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return empty array
        return []
      }
      throw new Error(`Failed to fetch tasks: ${error.message}`)
    }

    return data?.tasks || []
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const now = new Date().toISOString()

    const newTask: Task = {
      id: this.generateId(),
      title: input.title,
      description: input.description || '',
      priority: input.priority || 'P2',
      status: 'not_started',
      progress: 0,
      category: input.category || 'personal',
      estimated_minutes: input.estimated_minutes || 30,
      actual_minutes: 0,
      time_block: input.time_block || 'morning',
      subtasks: input.subtasks?.map(subtask => ({
        id: this.generateSubtaskId(),
        title: subtask.title,
        completed: false,
        notes: subtask.notes
      })) || [],
      notes: [],
      success_criteria: input.success_criteria || '',
      dependencies: [],
      tags: input.tags || [],
      created_at: now,
      updated_at: now
    }

    // Get existing tasks
    const existingTasks = await this.getTodayTasks()
    const updatedTasks = [...existingTasks, newTask]

    // Update or insert daily tasks record
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        date: today,
        tasks: updatedTasks,
        updated_at: now
      })

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`)
    }

    return newTask
  }

  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const now = new Date().toISOString()

    // Get existing tasks
    const existingTasks = await this.getTodayTasks()
    const taskIndex = existingTasks.findIndex(task => task.id === taskId)

    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    // Update the task
    const updatedTask: Task = {
      ...existingTasks[taskIndex],
      ...updates,
      updated_at: now,
      ...(updates.status === 'completed' && !existingTasks[taskIndex].completed_at ? { completed_at: now } : {})
    }

    const updatedTasks = [...existingTasks]
    updatedTasks[taskIndex] = updatedTask

    // Save to database
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        date: today,
        tasks: updatedTasks,
        updated_at: now
      })

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`)
    }

    return updatedTask
  }

  async deleteTask(taskId: string): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const now = new Date().toISOString()

    // Get existing tasks
    const existingTasks = await this.getTodayTasks()
    const updatedTasks = existingTasks.filter(task => task.id !== taskId)

    // Save to database
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        date: today,
        tasks: updatedTasks,
        updated_at: now
      })

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  }

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const now = new Date().toISOString()

    // Get existing tasks
    const existingTasks = await this.getTodayTasks()
    const taskIndex = existingTasks.findIndex(task => task.id === taskId)

    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    const task = existingTasks[taskIndex]
    const subtaskIndex = task.subtasks.findIndex(subtask => subtask.id === subtaskId)

    if (subtaskIndex === -1) {
      throw new Error('Subtask not found')
    }

    // Toggle subtask completion
    const updatedSubtasks = [...task.subtasks]
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: !updatedSubtasks[subtaskIndex].completed
    }

    // Calculate new progress based on completed subtasks
    const completedSubtasks = updatedSubtasks.filter(st => st.completed).length
    const newProgress = updatedSubtasks.length > 0
      ? Math.round((completedSubtasks / updatedSubtasks.length) * 100)
      : task.progress

    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
      progress: newProgress,
      updated_at: now
    }

    const updatedTasks = [...existingTasks]
    updatedTasks[taskIndex] = updatedTask

    // Save to database
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        date: today,
        tasks: updatedTasks,
        updated_at: now
      })

    if (error) {
      throw new Error(`Failed to toggle subtask: ${error.message}`)
    }

    return updatedTask
  }

  async addSubtask(taskId: string, title: string): Promise<Task> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const now = new Date().toISOString()

    // Get existing tasks
    const existingTasks = await this.getTodayTasks()
    const taskIndex = existingTasks.findIndex(task => task.id === taskId)

    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    const task = existingTasks[taskIndex]
    const newSubtask: Subtask = {
      id: this.generateSubtaskId(),
      title,
      completed: false
    }

    const updatedTask: Task = {
      ...task,
      subtasks: [...task.subtasks, newSubtask],
      updated_at: now
    }

    const updatedTasks = [...existingTasks]
    updatedTasks[taskIndex] = updatedTask

    // Save to database
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        date: today,
        tasks: updatedTasks,
        updated_at: now
      })

    if (error) {
      throw new Error(`Failed to add subtask: ${error.message}`)
    }

    return updatedTask
  }

  async bulkUpdateTasks(taskIds: string[], updates: UpdateTaskInput): Promise<Task[]> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const now = new Date().toISOString()

    // Get existing tasks
    const existingTasks = await this.getTodayTasks()
    const updatedTasks = existingTasks.map(task => {
      if (taskIds.includes(task.id)) {
        return {
          ...task,
          ...updates,
          updated_at: now,
          ...(updates.status === 'completed' && !task.completed_at ? { completed_at: now } : {})
        }
      }
      return task
    })

    // Save to database
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        date: today,
        tasks: updatedTasks,
        updated_at: now
      })

    if (error) {
      throw new Error(`Failed to bulk update tasks: ${error.message}`)
    }

    return updatedTasks.filter(task => taskIds.includes(task.id))
  }

  // Subscribe to real-time updates
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    const today = format(new Date(), 'yyyy-MM-dd')

    const subscription = supabase
      .channel('daily_tasks_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_tasks',
          filter: `date=eq.${today}`
        },
        (payload) => {
          if (payload.new && 'tasks' in payload.new) {
            callback(payload.new.tasks as Task[])
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}

export const taskService = new TaskService()