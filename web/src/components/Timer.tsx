import React, { useState, useEffect, useCallback } from 'react'
import { HiChevronLeft, HiChevronRight, HiPlay, HiPause } from 'react-icons/hi'
import { IoRefresh } from 'react-icons/io5'

interface TimerProps {
  duration: number // Total duration in seconds
  startedAt: string | null // ISO timestamp when timer was started
  state: 'stopped' | 'running' | 'paused'
  pausedDuration: number // Total paused time in seconds
  isOwner: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  currentQuarter: number
  onQuarterChange: (delta: number) => void
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
  currentQuarter,
  onQuarterChange,
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

  const isExpired = timeRemaining <= 0
  const displayTime = isExpired ? '00:00' : formatTime(timeRemaining)
  
  // Determine if reset should be disabled (at beginning or when running)
  const isResetDisabled = state === 'running' || timeRemaining === duration

  return (
    <div className={`bg-transparent p-0 flex flex-col h-full justify-center ${className}`}>
      {/* Row: Quarter controls (left) - Time (center) - Status/Buttons (right) */}
      <div className="flex items-center justify-center w-full text-gray-900 gap-10 py-2">
        {/* Quarter controls */}
        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              onClick={() => onQuarterChange(-1)}
              className="text-gray-900 bg-gray-300 hover:bg-gray-400 transition-colors text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
              aria-label="Previous Quarter"
            >
              <HiChevronLeft className="text-xl" />
            </button>
          )}
          <span className="text-xl font-semibold">Q{currentQuarter}</span>
          {isOwner && (
            <button
              onClick={() => onQuarterChange(1)}
              className="text-gray-900 bg-gray-300 hover:bg-gray-400 transition-colors text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
              aria-label="Next Quarter"
            >
              <HiChevronRight className="text-xl" />
            </button>
          )}
        </div>

        {/* Time display */}
        <div className="text-8xl font-mono font-extrabold px-4 text-black">{displayTime}</div>

        {/* Status and controls */}
        <div className="flex items-center gap-4">
          {/* Timer state */}
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full inline-block ${
                state === 'running' ? 'bg-green-600' : state === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
            />
            <span className={`text-lg ${
              state === 'running' ? 'text-green-600' : state === 'paused' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {state === 'running' ? 'running' : state === 'paused' ? 'paused' : 'stopped'}
            </span>
          </div>

          {/* Start/Pause button */}
          {isOwner && (
            <>
              {state === 'stopped' && (
                <button
                  onClick={onStart}
                  className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
                  aria-label="Start Timer"
                  title="Start"
                >
                  <HiPlay className="text-green-600 text-2xl" />
                </button>
              )}
              {state === 'running' && (
                <button
                  onClick={onPause}
                  className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
                  aria-label="Pause Timer"
                  title="Pause"
                >
                  <HiPause className="text-green-600 text-2xl" />
                </button>
              )}
              {state === 'paused' && (
                <button
                  onClick={onStart}
                  className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
                  aria-label="Resume Timer"
                  title="Resume"
                >
                  <HiPlay className="text-green-600 text-2xl" />
                </button>
              )}

              {/* Reset (orange) */}
              <button
                onClick={onReset}
                disabled={isResetDisabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isResetDisabled
                    ? 'bg-orange-300 cursor-not-allowed opacity-60'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                aria-label="Reset Timer"
                title="Reset"
              >
                <IoRefresh className="text-white text-2xl" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}