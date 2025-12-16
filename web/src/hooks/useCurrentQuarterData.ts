import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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
      const { data: quartersData, error: quartersError } = await supabase
        .from('quarters')
        .select('*')
        .in('team_id', teamIds)
        .eq('quarter_number', currentQuarter)

      if (quartersError) {
        console.error('Error fetching current quarter:', quartersError)
        return
      }
      setQuarters(quartersData || [])
    }

    fetchCurrentQuarter()
  }, [scoreboard?.teams, currentQuarter])

  const getTeamScore = useCallback((teamId: string) => {
    const quarter = quarters.find(q => q.team_id === teamId)
    return quarter?.points || 0
  }, [quarters])

  return { quarters, setQuarters, getTeamScore }
}

