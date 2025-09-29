import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export type Database = {
  public: {
    Tables: {
      daily_tasks: {
        Row: {
          id: string
          date: string
          tasks: Task[]
          summary: TaskSummary
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          tasks: Task[]
          summary?: TaskSummary
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          tasks?: Task[]
          summary?: TaskSummary
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Task types matching Python models
export interface Subtask {
  id: string
  title: string
  completed: boolean
  notes?: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: 'P1' | 'P2' | 'P3'
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  progress: number
  category: 'development' | 'design' | 'admin' | 'learning' | 'personal' | 'meeting' | 'planning'
  estimated_minutes: number
  actual_minutes: number
  time_block?: 'morning' | 'afternoon' | 'evening'
  subtasks: Subtask[]
  notes: string[]
  success_criteria?: string
  dependencies: string[]
  tags: string[]
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface TaskSummary {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  total_estimated_minutes: number
  total_actual_minutes: number
  completion_percentage: number
  categories: Record<string, number>
  priorities: Record<string, number>
}

export interface DailyTasks {
  id: string
  date: string
  tasks: Task[]
  summary: TaskSummary
  created_at: string
  updated_at: string
}