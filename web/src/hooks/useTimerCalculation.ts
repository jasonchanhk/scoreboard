import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ScoreboardData } from '../types/scoreboard'

export const useTimerCalculation = (scoreboard: ScoreboardData | null) => {
  const [timeRemaining, setTimeRemaining] = useState(scoreboard?.timer_duration || 0)

  const calculateRemainingTime = useCallback(() => {
    if (!scoreboard) return 0
    
    const { timer_state, timer_started_at, timer_duration, timer_paused_duration } = scoreboard
    
    if (timer_state === 'stopped' || !timer_started_at) {
      return timer_duration || 0
    }

    if (timer_state === 'paused') {
      const elapsed = timer_paused_duration || 0
      return Math.max(0, (timer_duration || 0) - elapsed)
    }

    if (timer_state === 'running') {
      const now = new Date().getTime()
      const startTime = new Date(timer_started_at).getTime()
      const elapsedSinceCurrentStart = Math.floor((now - startTime) / 1000)
      const totalElapsed = (timer_paused_duration || 0) + elapsedSinceCurrentStart
      return Math.max(0, (timer_duration || 0) - totalElapsed)
    }

    return timer_duration || 0
  }, [scoreboard])

  // Update timer display
  useEffect(() => {
    if (!scoreboard) return
    
    const updateTimer = () => {
      const remaining = calculateRemainingTime()
      setTimeRemaining(remaining)
    }

    // Initialize timer when scoreboard changes
    const initialTime = calculateRemainingTime()
    setTimeRemaining(initialTime)

    if (scoreboard.timer_state === 'running') {
      const interval = setInterval(updateTimer, 100)
      return () => clearInterval(interval)
    }
  }, [scoreboard, calculateRemainingTime])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const formattedTime = useMemo(() => {
    return timeRemaining <= 0 ? '00:00' : formatTime(timeRemaining)
  }, [timeRemaining, formatTime])

  return {
    timeRemaining,
    formattedTime,
    calculateRemainingTime,
  }
}

