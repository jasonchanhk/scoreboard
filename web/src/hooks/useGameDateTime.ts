import { useMemo } from 'react'

// Type for scoreboard with date/time fields (used in multiple components)
type ScoreboardWithDateTime = {
  game_date: string | null
  game_start_time: string | null
  game_end_time: string | null
}

export const useGameDateTime = (scoreboard: ScoreboardWithDateTime | null) => {
  const formattedDate = useMemo(() => {
    if (!scoreboard?.game_date) return null
    return new Date(scoreboard.game_date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [scoreboard?.game_date])

  const timeDisplay = useMemo(() => {
    const startTime = scoreboard?.game_start_time ? scoreboard.game_start_time.substring(0, 5) : ''
    const endTime = scoreboard?.game_end_time ? scoreboard.game_end_time.substring(0, 5) : ''
    
    if (startTime && endTime) return `${startTime} – ${endTime}`
    if (startTime) return startTime
    if (endTime) return endTime
    return null
  }, [scoreboard?.game_start_time, scoreboard?.game_end_time])

  // For ScoreboardCard component which has slightly different formatting
  const timeDisplayForCard = useMemo(() => {
    const startTime = scoreboard?.game_start_time ? scoreboard.game_start_time.substring(0, 5) : ''
    const endTime = scoreboard?.game_end_time ? scoreboard.game_end_time.substring(0, 5) : ''
    
    if (startTime && endTime) return `${startTime} – ${endTime}`
    if (startTime) return `Starts ${startTime}`
    if (endTime) return `Ends ${endTime}`
    return '-'
  }, [scoreboard?.game_start_time, scoreboard?.game_end_time])

  const dateDisplayForCard = useMemo(() => {
    if (!scoreboard?.game_date) return '-'
    return new Date(scoreboard.game_date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [scoreboard?.game_date])

  return {
    formattedDate,
    timeDisplay,
    timeDisplayForCard,
    dateDisplayForCard,
  }
}

