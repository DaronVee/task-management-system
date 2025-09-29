'use client'

import { useState, useEffect } from 'react'
import { Bars3Icon, MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import CommandPalette from './CommandPalette'
import { Task } from '@/lib/supabase'

interface ModernLayoutProps {
  children: React.ReactNode
  tasks?: Task[]
  onTaskSelect?: (task: Task) => void
  onQuickAction?: (action: string, taskId?: string) => void
}

interface HeaderProps {
  onOpenCommandPalette: () => void
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

const Header = ({ onOpenCommandPalette, onToggleSidebar, isSidebarOpen }: HeaderProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className={cn(
              "p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              "lg:hidden"
            )}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <CommandLineIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="heading-3 !mb-0">Task Management</h1>
              <p className="text-xs text-gray-500 -mt-1">AI-Powered Productivity</p>
            </div>
          </div>
        </div>

        {/* Center - Command Palette Trigger */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={onOpenCommandPalette}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg",
              "bg-gray-50 border border-gray-200 text-left",
              "hover:bg-gray-100 hover:border-gray-300",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            )}
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-500 flex-1">
              Search tasks or commands...
            </span>
            {mounted && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">
                  ⌘K
                </kbd>
              </div>
            )}
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Synced</span>
          </div>
        </div>
      </div>
    </header>
  )
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigationItems = [
    { name: 'Today', href: '/', icon: '📅', active: true },
    { name: 'Upcoming', href: '/upcoming', icon: '📆' },
    { name: 'Projects', href: '/projects', icon: '📁' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' }
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200",
          "transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          "lg:static lg:h-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
            <span className="heading-4">Menu</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                  item.active
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Last sync: Just now</div>
              <div>3 tasks completed today</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function ModernLayout({
  children,
  tasks = [],
  onTaskSelect,
  onQuickAction
}: ModernLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        onTaskSelect={onTaskSelect}
        onQuickAction={onQuickAction}
      />
    </div>
  )
}