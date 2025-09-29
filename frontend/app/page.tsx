'use client'

import { useState, useEffect } from 'react'
import { Subtask } from '../lib/supabase'

// Enhanced mock task data with more realistic details
const mockTasks = [
  {
    id: '1',
    title: 'Build Affiliation System with Affiliation GPT',
    description: 'Develop the technical affiliation system using the Affiliation GPT to create intelligent partner matching and commission tracking',
    priority: 'P1',
    status: 'not_started',
    estimated_minutes: 180,
    actual_minutes: 0,
    time_block: 'morning',
    category: 'development',
    progress: 0,
    tags: ['ai', 'backend', 'partnership'],
    subtasks: [
      { id: '1a', title: 'Design API endpoints', completed: false },
      { id: '1b', title: 'Implement GPT integration', completed: false },
      { id: '1c', title: 'Create partner dashboard', completed: false }
    ],
    success_criteria: 'Fully functional affiliate system with automated partner onboarding'
  },
  {
    id: '2',
    title: 'Create messaging and positioning angles for affiliate program',
    description: 'Develop key messaging strategies, value propositions, and positioning angles that resonate with potential affiliates',
    priority: 'P1',
    status: 'in_progress',
    estimated_minutes: 60,
    actual_minutes: 25,
    time_block: 'morning',
    category: 'marketing',
    progress: 40,
    tags: ['messaging', 'strategy', 'marketing'],
    subtasks: [
      { id: '2a', title: 'Research competitor messaging', completed: true },
      { id: '2b', title: 'Define value propositions', completed: false },
      { id: '2c', title: 'Create messaging framework', completed: false }
    ],
    success_criteria: 'Complete messaging framework with 5 key positioning angles'
  },
  {
    id: '3',
    title: 'Create affiliate resource pack',
    description: 'Develop comprehensive resource pack including swipe copy, email templates, social media assets, and brand guidelines',
    priority: 'P2',
    status: 'completed',
    estimated_minutes: 120,
    actual_minutes: 115,
    time_block: 'afternoon',
    category: 'design',
    progress: 100,
    tags: ['resources', 'design', 'templates'],
    subtasks: [
      { id: '3a', title: 'Create swipe copy templates', completed: true },
      { id: '3b', title: 'Design social media assets', completed: true },
      { id: '3c', title: 'Develop brand guidelines', completed: true }
    ],
    success_criteria: 'Complete resource pack with all marketing materials'
  },
  {
    id: '4',
    title: 'Set up analytics dashboard',
    description: 'Configure comprehensive analytics to track affiliate performance, conversion rates, and ROI metrics',
    priority: 'P2',
    status: 'not_started',
    estimated_minutes: 90,
    actual_minutes: 0,
    time_block: 'afternoon',
    category: 'development',
    progress: 0,
    tags: ['analytics', 'tracking', 'metrics'],
    subtasks: [],
    success_criteria: 'Fully functional analytics dashboard with real-time metrics'
  }
]

export default function TaskDashboard() {
  const [tasks] = useState(mockTasks)
  const [viewMode, setViewMode] = useState('swim')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [focusMode, setFocusMode] = useState(false)

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
  const estimatedHours = Math.round(tasks.reduce((sum, task) => sum + task.estimated_minutes, 0) / 60)
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100)

  // Get current time block based on hour
  const getCurrentTimeBlock = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning Focus'
    if (hour < 17) return 'Afternoon Deep Work'
    return 'Evening Review'
  }

  // Get tasks by time block
  const getTasksByTimeBlock = (timeBlock: string) => {
    return tasks.filter(task => {
      if (timeBlock === 'morning') return task.time_block === 'morning'
      if (timeBlock === 'afternoon') return task.time_block === 'afternoon'
      if (timeBlock === 'evening') return task.time_block === 'evening'
      return false
    })
  }

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-200'
      case 'P2': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Time block icon
  const getTimeBlockIcon = (timeBlock: string) => {
    switch (timeBlock) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌙'
      default: return '⏰'
    }
  }

  // Render enhanced task card
  const renderTaskCard = (task: any, isSuggested = false) => (
    <div key={task.id} className={`bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 ${isSuggested ? 'ring-2 ring-purple-200 border-purple-200' : 'border-slate-200'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{getTimeBlockIcon(task.time_block)}</span>
            <span className="font-medium">{task.estimated_minutes}m</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className={`text-xl font-semibold text-slate-900 mb-2 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
            {task.title}
          </h3>
          <p className="text-slate-600 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Progress */}
        {task.progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm font-semibold text-slate-900">{task.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Subtasks</span>
              <span className="text-sm font-semibold text-slate-500">
                {task.subtasks.filter((st: Subtask) => st.completed).length}/{task.subtasks.length}
              </span>
            </div>
            <div className="flex gap-2">
              {task.subtasks.slice(0, 6).map((subtask: Subtask, index: number) => (
                <div
                  key={subtask.id}
                  className={`w-3 h-3 rounded-full border-2 ${
                    subtask.completed
                      ? 'bg-green-500 border-green-500'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                  title={subtask.title}
                />
              ))}
              {task.subtasks.length > 6 && (
                <span className="text-xs text-slate-400 ml-1">
                  +{task.subtasks.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {isSuggested && task.status !== 'completed' && (
          <div className="pt-4 border-t border-slate-100">
            <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02]">
              ⚡ Start Working
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // Get current recommendation
  const currentRecommendation = tasks.find(task =>
    task.status === 'not_started' && task.priority === 'P1'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Dashboard Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Today's Mission
                </h1>
                {focusMode && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full border border-purple-200">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-sm font-semibold">Focus Mode Active</span>
                  </div>
                )}
              </div>
              <p className="text-xl text-slate-600">
                <span className="font-semibold text-slate-800">{completedTasks}</span> of <span className="font-semibold text-slate-800">{totalTasks}</span> tasks completed • <span className="font-semibold text-emerald-600">{completionPercentage}%</span> complete
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Switcher */}
              <div className="flex bg-slate-100/80 rounded-xl p-1 border border-slate-200/50">
                {['swim', 'list', 'kanban'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      viewMode === mode
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-white/80 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    focusMode
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                      : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                >
                  Focus Mode
                </button>
                <button className="px-4 py-2 bg-white/80 text-slate-700 rounded-lg text-sm font-semibold hover:bg-white border border-slate-200 transition-colors">
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">{completedTasks}</div>
              <div className="text-sm font-semibold text-green-600">Tasks Completed</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-700 mb-2">{inProgressTasks}</div>
              <div className="text-sm font-semibold text-blue-600">In Progress</div>
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-slate-700 mb-2">{estimatedHours}<span className="text-xl">h</span></div>
              <div className="text-sm font-semibold text-slate-600">Time Estimated</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-700 mb-2">{completionPercentage}<span className="text-xl">%</span></div>
              <div className="text-sm font-semibold text-orange-600">Progress Made</div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Panel */}
        {currentRecommendation && (
          <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">AI Recommendation</h2>
                <p className="text-slate-600">
                  Based on your current time block: <span className="font-semibold text-slate-800">{getCurrentTimeBlock()}</span>
                </p>
              </div>
            </div>
            {renderTaskCard(currentRecommendation, true)}
          </div>
        )}

        {/* Time Blocks */}
        <div className="space-y-8">
          {/* Morning Focus */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🌅</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Morning Focus</h2>
                  <p className="text-slate-600">9:00 AM - 12:00 PM • {getTasksByTimeBlock('morning').length} tasks</p>
                </div>
              </div>
              <div className="text-sm text-slate-500">Current</div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {getTasksByTimeBlock('morning').map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Afternoon Deep Work */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">☀️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Afternoon Deep Work</h2>
                  <p className="text-slate-600">1:00 PM - 5:00 PM • {getTasksByTimeBlock('afternoon').length} tasks</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {getTasksByTimeBlock('afternoon').map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Evening Review */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🌙</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Evening Review</h2>
                  <p className="text-slate-600">6:00 PM - 8:00 PM • {getTasksByTimeBlock('evening').length} tasks</p>
                </div>
              </div>
            </div>
            {getTasksByTimeBlock('evening').length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <span className="text-4xl mb-4 block">🌙</span>
                <p className="text-lg font-medium">No tasks scheduled for evening review</p>
                <p className="text-sm mt-2">Perfect time for reflection and planning tomorrow</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {getTasksByTimeBlock('evening').map(task => renderTaskCard(task))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}