import { useCallback } from 'react'
import type { Quarter } from '../types/scoreboard'

export const useTeamTotalScore = (allQuarters: Quarter[] | undefined) => {
  const getTeamTotalScore = useCallback((teamId: string) => {
    if (!allQuarters || !teamId) return 0
    return allQuarters
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + q.points, 0)
  }, [allQuarters])

  return { getTeamTotalScore }
}

