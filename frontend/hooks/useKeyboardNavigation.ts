'use client'

import { useEffect, useCallback, useRef, useState } from 'react'

interface KeyboardNavigationOptions {
  items: any[]
  onSelect?: (item: any, index: number) => void
  onActivate?: (item: any, index: number) => void
  onEscape?: () => void
  loop?: boolean
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal' | 'both'
  gridColumns?: number
}

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: (event: KeyboardEvent) => void
  description: string
  group?: string
}

export function useKeyboardNavigation({
  items,
  onSelect,
  onActivate,
  onEscape,
  loop = true,
  disabled = false,
  orientation = 'vertical',
  gridColumns = 1
}: KeyboardNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLElement>(null)

  // Calculate movement based on orientation and grid layout
  const getNextIndex = useCallback((
    currentIndex: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ): number => {
    const totalItems = items.length
    if (totalItems === 0) return -1

    let nextIndex = currentIndex

    if (orientation === 'vertical' || orientation === 'both') {
      if (direction === 'down') {
        if (gridColumns > 1) {
          nextIndex = currentIndex + gridColumns
          if (nextIndex >= totalItems) {
            nextIndex = loop ? currentIndex % gridColumns : currentIndex
          }
        } else {
          nextIndex = currentIndex + 1
          if (nextIndex >= totalItems) {
            nextIndex = loop ? 0 : currentIndex
          }
        }
      } else if (direction === 'up') {
        if (gridColumns > 1) {
          nextIndex = currentIndex - gridColumns
          if (nextIndex < 0) {
            // Find the last item in the same column
            const column = currentIndex % gridColumns
            const lastRowStart = Math.floor((totalItems - 1) / gridColumns) * gridColumns
            nextIndex = loop ? Math.min(lastRowStart + column, totalItems - 1) : currentIndex
          }
        } else {
          nextIndex = currentIndex - 1
          if (nextIndex < 0) {
            nextIndex = loop ? totalItems - 1 : currentIndex
          }
        }
      }
    }

    if (orientation === 'horizontal' || orientation === 'both') {
      if (direction === 'right') {
        if (gridColumns > 1) {
          nextIndex = currentIndex + 1
          // Don't go past the end of the row
          if (nextIndex >= totalItems || Math.floor(nextIndex / gridColumns) !== Math.floor(currentIndex / gridColumns)) {
            nextIndex = loop ? Math.floor(currentIndex / gridColumns) * gridColumns : currentIndex
          }
        } else {
          nextIndex = currentIndex + 1
          if (nextIndex >= totalItems) {
            nextIndex = loop ? 0 : currentIndex
          }
        }
      } else if (direction === 'left') {
        if (gridColumns > 1) {
          nextIndex = currentIndex - 1
          // Don't go before the start of the row
          if (nextIndex < 0 || Math.floor(nextIndex / gridColumns) !== Math.floor(currentIndex / gridColumns)) {
            const rowStart = Math.floor(currentIndex / gridColumns) * gridColumns
            const rowEnd = Math.min(rowStart + gridColumns - 1, totalItems - 1)
            nextIndex = loop ? rowEnd : currentIndex
          }
        } else {
          nextIndex = currentIndex - 1
          if (nextIndex < 0) {
            nextIndex = loop ? totalItems - 1 : currentIndex
          }
        }
      }
    }

    return Math.max(0, Math.min(nextIndex, totalItems - 1))
  }, [items.length, orientation, gridColumns, loop])

  // Navigate to specific index
  const navigateToIndex = useCallback((index: number) => {
    if (disabled || index < 0 || index >= items.length) return

    setSelectedIndex(index)
    setFocusedIndex(index)
    onSelect?.(items[index], index)

    // Focus the element if it exists
    const container = containerRef.current
    if (container) {
      const item = container.children[index] as HTMLElement
      if (item && item.focus) {
        item.focus()
      }
    }
  }, [disabled, items, onSelect])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled || items.length === 0) return

    const currentIndex = Math.max(0, selectedIndex)

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        navigateToIndex(getNextIndex(currentIndex, 'down'))
        break

      case 'ArrowUp':
        event.preventDefault()
        navigateToIndex(getNextIndex(currentIndex, 'up'))
        break

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          navigateToIndex(getNextIndex(currentIndex, 'right'))
        }
        break

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          navigateToIndex(getNextIndex(currentIndex, 'left'))
        }
        break

      case 'Home':
        event.preventDefault()
        navigateToIndex(0)
        break

      case 'End':
        event.preventDefault()
        navigateToIndex(items.length - 1)
        break

      case 'PageDown':
        event.preventDefault()
        const pageDownIndex = Math.min(currentIndex + 10, items.length - 1)
        navigateToIndex(pageDownIndex)
        break

      case 'PageUp':
        event.preventDefault()
        const pageUpIndex = Math.max(currentIndex - 10, 0)
        navigateToIndex(pageUpIndex)
        break

      case 'Enter':
      case ' ':
        event.preventDefault()
        if (currentIndex >= 0 && currentIndex < items.length) {
          onActivate?.(items[currentIndex], currentIndex)
        }
        break

      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
    }
  }, [disabled, items, selectedIndex, orientation, getNextIndex, navigateToIndex, onActivate, onEscape])

  // Set up keyboard listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, disabled])

  // Initialize first item as selected if none selected
  useEffect(() => {
    if (!disabled && items.length > 0 && selectedIndex === -1) {
      setSelectedIndex(0)
    }
  }, [disabled, items.length, selectedIndex])

  return {
    containerRef,
    selectedIndex,
    focusedIndex,
    navigateToIndex,
    setSelectedIndex,
    setFocusedIndex
  }
}

// Global keyboard shortcut hook
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey
        const altMatches = !!shortcut.altKey === event.altKey
        const metaMatches = !!shortcut.metaKey === event.metaKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault()
          shortcut.action(event)
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled])

  // Return help text for shortcuts
  const getShortcutHelp = useCallback(() => {
    const groups = shortcutsRef.current.reduce((acc, shortcut) => {
      const group = shortcut.group || 'General'
      if (!acc[group]) acc[group] = []
      acc[group].push(shortcut)
      return acc
    }, {} as Record<string, KeyboardShortcut[]>)

    return groups
  }, [])

  return { getShortcutHelp }
}

// Hook for focus management
export function useFocusManagement() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([])
  const trapRef = useRef<HTMLElement>(null)

  // Save current focus and set new focus
  const setFocus = useCallback((element: HTMLElement | null) => {
    if (!element) return

    const currentlyFocused = document.activeElement as HTMLElement
    if (currentlyFocused && currentlyFocused !== element) {
      setFocusHistory(prev => [...prev, currentlyFocused])
    }

    element.focus()
  }, [])

  // Restore previous focus
  const restoreFocus = useCallback(() => {
    setFocusHistory(prev => {
      const lastFocused = prev[prev.length - 1]
      if (lastFocused && lastFocused.focus) {
        lastFocused.focus()
      }
      return prev.slice(0, -1)
    })
  }, [])

  // Trap focus within container
  const trapFocus = useCallback((event: KeyboardEvent) => {
    const container = trapRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  }, [])

  // Set up focus trap
  useEffect(() => {
    const container = trapRef.current
    if (!container) return

    container.addEventListener('keydown', trapFocus)
    return () => container.removeEventListener('keydown', trapFocus)
  }, [trapFocus])

  return {
    trapRef,
    setFocus,
    restoreFocus,
    focusHistory
  }
}

// Hook for skip links
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLElement>(null)

  const addSkipLink = useCallback((
    href: string,
    text: string,
    position: 'top' | 'bottom' = 'top'
  ) => {
    const skipLink = document.createElement('a')
    skipLink.href = href
    skipLink.textContent = text
    skipLink.className = `
      sr-only focus:not-sr-only focus:absolute focus:${position}-2 focus:left-2 focus:z-50
      focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md
      focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    `

    const container = skipLinksRef.current || document.body
    if (position === 'top') {
      container.insertBefore(skipLink, container.firstChild)
    } else {
      container.appendChild(skipLink)
    }

    return skipLink
  }, [])

  return {
    skipLinksRef,
    addSkipLink
  }
}