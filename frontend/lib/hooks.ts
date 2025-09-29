import { useEffect, useCallback, useState } from 'react'

// Keyboard shortcuts hook for better workflow efficiency
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Build the shortcut key combination
    const keys: string[] = []

    if (event.ctrlKey || event.metaKey) keys.push('mod')
    if (event.shiftKey) keys.push('shift')
    if (event.altKey) keys.push('alt')
    keys.push(event.key.toLowerCase())

    const combination = keys.join('+')

    // Execute matching shortcut
    if (shortcuts[combination]) {
      event.preventDefault()
      shortcuts[combination]()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Optimistic updates hook for immediate UI feedback
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFunction: (data: T) => Promise<T>
) {
  const [data, setData] = useState(initialData)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateOptimistically = useCallback(async (newData: T) => {
    const previousData = data
    setData(newData) // Immediate update
    setIsUpdating(true)
    setError(null)

    try {
      const result = await updateFunction(newData)
      setData(result)
    } catch (err) {
      setData(previousData) // Revert on error
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsUpdating(false)
    }
  }, [data, updateFunction])

  return { data, isUpdating, error, update: updateOptimistically }
}