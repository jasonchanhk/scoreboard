import { useState, useEffect, useCallback } from 'react'
import { getByTeamIdsAndQuarter } from '../data/quartersRepo'
import type { ScoreboardData, Quarter } from '../types/scoreboard'

export const useCurrentQuarterData = (
  scoreboard: ScoreboardData | null,
  currentQuarter: number
) => {
  const [quarters, setQuarters] = useState<Quarter[]>([])

  useEffect(() => {
    if (!scoreboard?.teams || scoreboard.teams.length === 0) return

    const fetchCurrentQuarter = async () => {
      const teamIds = scoreboard.teams.map(team => team.id)
      try {
        const quartersData = await getByTeamIdsAndQuarter(teamIds, currentQuarter)
        setQuarters(quartersData || [])
      } catch (quartersError) {
        console.error('Error fetching current quarter:', quartersError)
      }
    }

    fetchCurrentQuarter()
  }, [scoreboard?.teams, currentQuarter])

  const getTeamScore = useCallback((teamId: string) => {
    const quarter = quarters.find(q => q.team_id === teamId)
    return quarter?.points || 0
  }, [quarters])

  return { quarters, setQuarters, getTeamScore }
}

