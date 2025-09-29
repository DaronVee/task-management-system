import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'TaskFlow Pro - AI-Powered Task Management',
  description: 'Transform your productivity with intelligent task management powered by Claude Code sub-agents. Organize, prioritize, and achieve your goals with unprecedented clarity.',
  keywords: ['task management', 'productivity', 'AI', 'Claude', 'organization', 'planning'],
  authors: [{ name: 'TaskFlow Pro' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen app-background">
          {/* Modern Gradient Header */}
          <header className="relative overflow-hidden" style={{ height: '200px' }}>
            {/* Gradient Background */}
            <div className="absolute inset-0" style={{ background: 'var(--gradient-header)' }}></div>

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center" style={{ height: '200px' }}>
              <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="flex items-center justify-between w-full">
                  {/* Brand */}
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--gradient-surface)' }}>
                      <div className="w-full h-full rounded-xl flex items-center justify-center text-2xl font-bold" style={{ color: 'var(--brand-primary-600)' }}>
                        T
                      </div>
                    </div>

                    {/* Brand Text */}
                    <div>
                      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-inverse)' }}>
                        TaskFlow <span className="font-normal opacity-80">Pro</span>
                      </h1>
                      <p className="text-sm opacity-80" style={{ color: 'var(--text-inverse)' }}>
                        AI-Powered Task Management
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      className="btn btn-ghost text-white border-white/20 hover:bg-white/10"
                      aria-label="Keyboard shortcuts"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                      </svg>
                      <span className="hidden sm:inline">⌘K</span>
                    </button>

                    <button
                      className="btn btn-ghost text-white border-white/20 hover:bg-white/10"
                      aria-label="Settings"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    <button className="btn btn-primary bg-white/20 border-white/30 text-white hover:bg-white/30">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Task
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-6 flex items-center gap-6 text-sm" style={{ color: 'var(--text-inverse)' }}>
                  <div className="flex items-center gap-2 opacity-80">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success-400)' }}></div>
                    <span>System Online</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI Agents Active</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Focus Mode</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom border gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}></div>
          </header>

          {/* Main Content */}
          <main className="relative z-0">
            <div className="max-w-7xl mx-auto p-6">
              <div className="animate-slide-up">
                {children}
              </div>
            </div>
          </main>

        </div>
      </body>
    </html>
  )
}