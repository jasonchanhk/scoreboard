import React, { useState, useEffect, useCallback } from 'react'
import { IoRefresh, IoPlay, IoPause, IoChevronForward, IoChevronBack } from 'react-icons/io5'
import { CircleButton } from './button'

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
      {/* Portrait: Quarter on top, Time+Controls below. Landscape: Quarter left, Time+Controls right */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full text-gray-900 gap-4 md:gap-8 py-2">
        {/* Quarter controls - Top in portrait, Left in landscape */}
        <div className="flex items-center gap-3 md:gap-4">
          {isOwner && (
            <CircleButton
              onClick={() => onQuarterChange(-1)}
              variant="primary"
              size="md"
              ariaLabel="Previous Quarter"
              type="button"
            >
              <IoChevronBack className="text-white text-xl" />
            </CircleButton>
          )}
          <span className={`${isOwner ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-mono font-extrabold text-black text-center`}>Q{currentQuarter}</span>
          {isOwner && (
            <CircleButton
              onClick={() => onQuarterChange(1)}
              variant="primary"
              size="md"
              ariaLabel="Next Quarter"
              type="button"
            >
              <IoChevronForward className="text-white text-xl" />
            </CircleButton>
          )}
        </div>

        {/* Divider Line - Only show for non-owner view in landscape */}
        {!isOwner && (
          <div className="hidden md:block h-20 border-l-4 border-gray-300"></div>
        )}

        {/* Time display and controls on same row */}
        <div className="flex items-center gap-5 md:gap-8">
          {/* Time display */}
          <div className={`${isOwner ? 'text-6xl md:text-9xl' : 'text-6xl md:text-9xl'} font-mono font-extrabold text-black`}>{displayTime}</div>

          {/* Status and controls */}
          <div className="flex items-center gap-5">
            {/* Timer state - Keep commented out as requested */}
            {/* <div className="flex items-center gap-2 w-24">
              <span
                className={`w-3 h-3 rounded-full inline-block flex-shrink-0 ${
                  state === 'running' ? 'bg-green-600' : state === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-lg whitespace-nowrap font-semibold">
                {state === 'running' ? 'Running' : state === 'paused' ? 'Paused' : 'Stopped'}
              </span>
            </div> */}

            {/* Start/Pause button */}
            {isOwner && (
              <>
                {state === 'stopped' && (
                  <CircleButton
                    onClick={onStart}
                    variant="white"
                    size="lg"
                    ariaLabel="Start Timer"
                    type="button"
                  >
                    <IoPlay className="text-indigo-600 text-3xl" />
                  </CircleButton>
                )}
                {state === 'running' && (
                  <CircleButton
                    onClick={onPause}
                    variant="white"
                    size="lg"
                    ariaLabel="Pause Timer"
                    type="button"
                  >
                    <IoPause className="text-indigo-600 text-3xl" />
                  </CircleButton>
                )}
                {state === 'paused' && (
                  <CircleButton
                    onClick={onStart}
                    variant="white"
                    size="lg"
                    ariaLabel="Resume Timer"
                    type="button"
                  >
                    <IoPlay className="text-indigo-600 text-3xl" />
                  </CircleButton>
                )}

                {/* Reset */}
                <CircleButton
                  onClick={onReset}
                  disabled={isResetDisabled}
                  variant="primary"
                  size="lg"
                  ariaLabel="Reset Timer"
                  type="button"
                >
                  <IoRefresh className="text-white text-3xl" />
                </CircleButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}