import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ScoreboardData } from '../types/scoreboard'

export const useTimerControls = (
  scoreboard: ScoreboardData | null,
  isOwner: boolean,
  scoreboardId: string | undefined,
  setScoreboard: (updater: (prev: ScoreboardData | null) => ScoreboardData | null) => void
) => {
  const handleTimerStart = useCallback(async () => {
    if (!scoreboard || !isOwner || !scoreboardId) return

    const now = new Date().toISOString()
    let newPausedDuration = 0

    if (scoreboard.timer_state === 'paused') {
      // When resuming from pause, keep the current paused duration
      newPausedDuration = scoreboard.timer_paused_duration || 0
      console.log('Resuming from pause with duration:', newPausedDuration)
    } else {
      // Starting fresh - reset paused duration
      newPausedDuration = 0
      console.log('Starting fresh timer')
    }

    // OPTIMISTIC UPDATE: Update local state immediately
    setScoreboard(prev => prev ? {
      ...prev,
      timer_state: 'running',
      timer_started_at: now,
      timer_paused_duration: newPausedDuration,
    } : null)

    try {
      const { error } = await supabase
        .from('scoreboards')
        .update({
          timer_state: 'running',
          timer_started_at: now,
          timer_paused_duration: newPausedDuration,
        })
        .eq('id', scoreboardId)

      if (error) {
        // Revert optimistic update on error
        setScoreboard(prev => prev ? {
          ...prev,
          timer_state: scoreboard.timer_state,
          timer_started_at: scoreboard.timer_started_at,
          timer_paused_duration: scoreboard.timer_paused_duration,
        } : null)
        throw error
      }
      console.log('Timer started successfully')
    } catch (error) {
      console.error('Error starting timer:', error)
    }
  }, [scoreboard, isOwner, scoreboardId, setScoreboard])

  const handleTimerPause = useCallback(async () => {
    if (!scoreboard || !isOwner || scoreboard.timer_state !== 'running' || !scoreboardId) return
    if (!scoreboard.timer_started_at) return

    // Calculate how much time has elapsed since the timer started
    const now = new Date().getTime()
    const startTime = new Date(scoreboard.timer_started_at).getTime()
    const elapsedSinceStart = Math.floor((now - startTime) / 1000)
    
    // Total paused duration = previous paused time + current elapsed time
    const newPausedDuration = (scoreboard.timer_paused_duration || 0) + elapsedSinceStart

    // OPTIMISTIC UPDATE: Update local state immediately
    setScoreboard(prev => prev ? {
      ...prev,
      timer_state: 'paused',
      timer_paused_duration: newPausedDuration,
    } : null)

    try {
      const { error } = await supabase
        .from('scoreboards')
        .update({
          timer_state: 'paused',
          timer_paused_duration: newPausedDuration,
        })
        .eq('id', scoreboardId)

      if (error) {
        // Revert optimistic update on error
        setScoreboard(prev => prev ? {
          ...prev,
          timer_state: 'running',
          timer_paused_duration: scoreboard.timer_paused_duration,
        } : null)
        throw error
      }
      console.log('Timer paused with total duration:', newPausedDuration)
    } catch (error) {
      console.error('Error pausing timer:', error)
    }
  }, [scoreboard, isOwner, scoreboardId, setScoreboard])

  const handleTimerReset = useCallback(async () => {
    if (!scoreboard || !isOwner || !scoreboardId) return

    // OPTIMISTIC UPDATE: Update local state immediately
    setScoreboard(prev => prev ? {
      ...prev,
      timer_state: 'stopped',
      timer_started_at: null,
      timer_paused_duration: 0,
    } : null)

    try {
      const { error } = await supabase
        .from('scoreboards')
        .update({
          timer_state: 'stopped',
          timer_started_at: null,
          timer_paused_duration: 0,
        })
        .eq('id', scoreboardId)

      if (error) {
        // Revert optimistic update on error
        setScoreboard(prev => prev ? {
          ...prev,
          timer_state: scoreboard.timer_state,
          timer_started_at: scoreboard.timer_started_at,
          timer_paused_duration: scoreboard.timer_paused_duration,
        } : null)
        throw error
      }
      console.log('Timer reset successfully')
    } catch (error) {
      console.error('Error resetting timer:', error)
    }
  }, [scoreboard, isOwner, scoreboardId, setScoreboard])

  return {
    handleTimerStart,
    handleTimerPause,
    handleTimerReset,
  }
}

