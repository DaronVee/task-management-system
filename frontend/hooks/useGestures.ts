'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  duration: number
}

interface PinchGesture {
  scale: number
  center: { x: number; y: number }
}

interface UseGesturesOptions {
  onSwipe?: (gesture: SwipeGesture) => void
  onPinch?: (gesture: PinchGesture) => void
  onTap?: (event: PointerEvent) => void
  onDoubleTap?: (event: PointerEvent) => void
  onLongPress?: (event: PointerEvent) => void
  swipeThreshold?: number
  pinchThreshold?: number
  doubleTapDelay?: number
  longPressDelay?: number
  disabled?: boolean
}

interface TouchPoint {
  id: number
  x: number
  y: number
  timestamp: number
}

interface GestureState {
  isActive: boolean
  startPoints: TouchPoint[]
  currentPoints: TouchPoint[]
  startTime: number
  lastTapTime: number
  tapCount: number
  longPressTimer?: NodeJS.Timeout
}

export default function useGestures(options: UseGesturesOptions = {}) {
  const {
    onSwipe,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    doubleTapDelay = 300,
    longPressDelay = 500,
    disabled = false
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const gestureState = useRef<GestureState>({
    isActive: false,
    startPoints: [],
    currentPoints: [],
    startTime: 0,
    lastTapTime: 0,
    tapCount: 0
  })

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }, [])

  // Calculate angle between two points
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
  }, [])

  // Get direction from angle
  const getDirection = useCallback((angle: number): SwipeGesture['direction'] => {
    const absAngle = Math.abs(angle)
    if (absAngle <= 45 || absAngle >= 135) {
      return angle > 0 ? 'right' : 'left'
    } else {
      return angle > 0 ? 'down' : 'up'
    }
  }, [])

  // Convert pointer event to touch point
  const pointerToTouchPoint = useCallback((event: PointerEvent, id: number = 0): TouchPoint => ({
    id,
    x: event.clientX,
    y: event.clientY,
    timestamp: Date.now()
  }), [])

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = undefined
    }
  }, [])

  // Handle pointer down
  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (disabled) return

    event.preventDefault()

    const touchPoint = pointerToTouchPoint(event)
    const now = Date.now()

    // Check for double tap
    if (now - gestureState.current.lastTapTime < doubleTapDelay) {
      gestureState.current.tapCount++
    } else {
      gestureState.current.tapCount = 1
    }

    gestureState.current.isActive = true
    gestureState.current.startPoints = [touchPoint]
    gestureState.current.currentPoints = [touchPoint]
    gestureState.current.startTime = now
    gestureState.current.lastTapTime = now

    // Set up long press timer
    gestureState.current.longPressTimer = setTimeout(() => {
      if (gestureState.current.isActive && onLongPress) {
        onLongPress(event)
        gestureState.current.isActive = false
      }
    }, longPressDelay)

    // Capture pointer for consistent tracking
    if (elementRef.current) {
      elementRef.current.setPointerCapture(event.pointerId)
    }
  }, [disabled, doubleTapDelay, longPressDelay, onLongPress, pointerToTouchPoint])

  // Handle pointer move
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (disabled || !gestureState.current.isActive) return

    const touchPoint = pointerToTouchPoint(event)
    gestureState.current.currentPoints = [touchPoint]

    // Cancel long press if moved too much
    const startPoint = gestureState.current.startPoints[0]
    if (startPoint && getDistance(startPoint, touchPoint) > 10) {
      clearLongPressTimer()
    }
  }, [disabled, getDistance, clearLongPressTimer, pointerToTouchPoint])

  // Handle pointer up
  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (disabled || !gestureState.current.isActive) return

    clearLongPressTimer()

    const endPoint = pointerToTouchPoint(event)
    const startPoint = gestureState.current.startPoints[0]
    const duration = Date.now() - gestureState.current.startTime

    if (startPoint) {
      const distance = getDistance(startPoint, endPoint)
      const velocity = distance / duration

      // Check for swipe gesture
      if (distance > swipeThreshold && velocity > 0.3) {
        const angle = getAngle(startPoint, endPoint)
        const direction = getDirection(angle)

        if (onSwipe) {
          onSwipe({
            direction,
            distance,
            velocity,
            duration
          })
        }
      } else {
        // Handle tap/double tap
        if (duration < 200 && distance < 10) {
          if (gestureState.current.tapCount === 1) {
            // Single tap - delay to check for double tap
            setTimeout(() => {
              if (gestureState.current.tapCount === 1 && onTap) {
                onTap(event)
              }
            }, doubleTapDelay)
          } else if (gestureState.current.tapCount === 2 && onDoubleTap) {
            onDoubleTap(event)
            gestureState.current.tapCount = 0
          }
        }
      }
    }

    gestureState.current.isActive = false
    gestureState.current.startPoints = []
    gestureState.current.currentPoints = []

    // Release pointer capture
    if (elementRef.current) {
      elementRef.current.releasePointerCapture(event.pointerId)
    }
  }, [
    disabled,
    swipeThreshold,
    doubleTapDelay,
    onSwipe,
    onTap,
    onDoubleTap,
    getDistance,
    getAngle,
    getDirection,
    clearLongPressTimer,
    pointerToTouchPoint
  ])

  // Handle touch start for multi-touch gestures
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (disabled || event.touches.length < 2) return

    event.preventDefault()

    const touchPoints: TouchPoint[] = Array.from(event.touches).map((touch, index) => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }))

    gestureState.current.startPoints = touchPoints
    gestureState.current.currentPoints = touchPoints
  }, [disabled])

  // Handle touch move for pinch gestures
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (disabled || event.touches.length < 2 || gestureState.current.startPoints.length < 2) return

    event.preventDefault()

    const currentPoints: TouchPoint[] = Array.from(event.touches).map((touch, index) => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }))

    const startDistance = getDistance(
      gestureState.current.startPoints[0],
      gestureState.current.startPoints[1]
    )
    const currentDistance = getDistance(currentPoints[0], currentPoints[1])

    const scale = currentDistance / startDistance
    const scaleDiff = Math.abs(1 - scale)

    if (scaleDiff > pinchThreshold && onPinch) {
      const center = {
        x: (currentPoints[0].x + currentPoints[1].x) / 2,
        y: (currentPoints[0].y + currentPoints[1].y) / 2
      }

      onPinch({ scale, center })
    }

    gestureState.current.currentPoints = currentPoints
  }, [disabled, getDistance, pinchThreshold, onPinch])

  // Handle touch end
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (disabled) return

    if (event.touches.length === 0) {
      gestureState.current.startPoints = []
      gestureState.current.currentPoints = []
    }
  }, [disabled])

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element || disabled) return

    // Pointer events for single touch
    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointercancel', handlePointerUp)

    // Touch events for multi-touch
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('pointercancel', handlePointerUp)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)

      clearLongPressTimer()
    }
  }, [
    disabled,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearLongPressTimer
  ])

  return {
    ref: elementRef,
    isActive: gestureState.current.isActive
  }
}