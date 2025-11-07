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
  
  // Determine if reset should be disabled (at beginning or when running)
  const isResetDisabled = state === 'running' || timeRemaining === duration

  return (
    <div className={`bg-transparent p-0 flex flex-col h-full justify-between ${className}`}>
      <div className="text-center">
        <h3 className="text-base font-bold mb-2">Timer</h3>
      </div>
      
      {/* Timer Display with Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 justify-center">
        {/* Timer Display and Controls Row */}
        <div className="flex items-center justify-center gap-3">
          {/* Reset Button (Left) - Always show when owner */}
          {isOwner && (
            <button
              onClick={onReset}
              disabled={isResetDisabled}
              className={`text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
                isResetDisabled
                  ? 'text-gray-500 bg-gray-800 cursor-not-allowed opacity-50'
                  : 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 cursor-pointer'
              }`}
              aria-label="Reset Timer"
            >
              ↻
            </button>
          )}

          {/* Timer Display */}
          <div className={`text-6xl font-mono font-bold ${getTimerColor()}`}>
            {displayTime}
          </div>

          {/* Start/Stop Button (Right) - Only show when owner */}
          {isOwner && (
            <>
              {state === 'stopped' && (
                <button
                  onClick={onStart}
                  className="text-gray-300 hover:text-white transition-colors text-xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
                  aria-label="Start Timer"
                >
                  ▶
                </button>
              )}
              
              {state === 'running' && (
                <button
                  onClick={onPause}
                  className="text-gray-300 hover:text-white transition-colors text-xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
                  aria-label="Pause Timer"
                >
                  ⏸
                </button>
              )}
              
              {state === 'paused' && (
                <button
                  onClick={onStart}
                  className="text-gray-300 hover:text-white transition-colors text-xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
                  aria-label="Resume Timer"
                >
                  ▶
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Timer State Indicator */}
        <div className="text-xs text-gray-400">
          {state === 'running' && 'Running'}
          {state === 'paused' && 'Paused'}
          {state === 'stopped' && 'Stopped'}
          {isExpired && '⏰ Time Expired'}
        </div>
      </div>
    </div>
  )
}