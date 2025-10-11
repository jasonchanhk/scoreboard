import React, { useState, useEffect, useCallback } from 'react'

interface TimerProps {
  duration: number // Total duration in seconds
  startedAt: string | null // ISO timestamp when timer was started
  state: 'stopped' | 'running' | 'paused'
  pausedDuration: number // Total paused time in seconds
  isOwner: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  className?: string
}

export const Timer: React.FC<TimerProps> = ({
  duration,
  startedAt,
  state,
  pausedDuration,
  isOwner,
  onStart,
  onPause,
  onReset,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration)

  // Calculate remaining time based on current state
  const calculateRemainingTime = useCallback(() => {
    if (state === 'stopped' || !startedAt) {
      return duration
    }

    if (state === 'paused') {
      // When paused, calculate based on stored paused duration
      const elapsed = pausedDuration
      return Math.max(0, duration - elapsed)
    }

    if (state === 'running') {
      // When running, we need to account for both:
      // 1. Time elapsed since the current start time
      // 2. Previously paused time
      const now = new Date().getTime()
      const startTime = new Date(startedAt).getTime()
      const elapsedSinceCurrentStart = Math.floor((now - startTime) / 1000)
      const totalElapsed = pausedDuration + elapsedSinceCurrentStart
      return Math.max(0, duration - totalElapsed)
    }

    return duration
  }, [duration, startedAt, state, pausedDuration])

  // Update timer display and manage interval
  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateRemainingTime()
      setTimeRemaining(remaining)
    }

    // Always update once when props change
    updateTimer()

    // Only run interval when timer is actually running
    if (state === 'running') {
      const interval = setInterval(updateTimer, 100)
      return () => clearInterval(interval)
    }
  }, [state, calculateRemainingTime])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-500' // Last minute - red
    if (timeRemaining <= 300) return 'text-yellow-500' // Last 5 minutes - yellow
    return 'text-white' // Normal - white
  }

  const isExpired = timeRemaining <= 0
  const displayTime = isExpired ? '00:00' : formatTime(timeRemaining)

  return (
    <div className={`bg-gray-800 rounded-lg p-6 text-center ${className}`}>
      <h3 className="text-xl font-bold mb-4">Timer</h3>
      
      {/* Timer Display */}
      <div className={`text-6xl font-mono font-bold mb-4 ${getTimerColor()}`}>
        {displayTime}
      </div>

      {/* Timer State Indicator */}
      <div className="text-sm text-gray-400 mb-4">
        {state === 'running' && '⏱️ Running'}
        {state === 'paused' && '⏸️ Paused'}
        {state === 'stopped' && '⏹️ Stopped'}
        {isExpired && '⏰ Time Expired'}
      </div>

      {/* Controls (Owner Only) */}
      {isOwner && (
        <div className="flex justify-center space-x-3">
          {state === 'stopped' && (
            <button
              onClick={onStart}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              ▶️ Start
            </button>
          )}
          
          {state === 'running' && (
            <button
              onClick={onPause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              ⏸️ Pause
            </button>
          )}
          
          {state === 'paused' && (
            <>
              <button
                onClick={onStart}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                ▶️ Resume
              </button>
              <button
                onClick={onReset}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                🔄 Reset
              </button>
            </>
          )}
          
          {state === 'stopped' && timeRemaining < duration && (
            <button
              onClick={onReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🔄 Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}