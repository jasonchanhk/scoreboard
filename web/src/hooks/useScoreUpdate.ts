import { useCallback } from 'react'
import { upsertQuarters } from '../data/quartersRepo'
import type { ScoreboardData, Quarter } from '../types/scoreboard'

export const useScoreUpdate = (
  scoreboard: ScoreboardData | null,
  isOwner: boolean,
  _quarters: Quarter[],
  setQuarters: React.Dispatch<React.SetStateAction<Quarter[]>>,
  setAllQuarters: React.Dispatch<React.SetStateAction<Quarter[]>>,
  getTeamScore: (teamId: string) => number
) => {
  const updateScore = useCallback(async (teamIndex: number, delta: number) => {
    if (!scoreboard || !isOwner || !scoreboard.teams || !scoreboard.teams[teamIndex]) return

    const team = scoreboard.teams[teamIndex]
    const currentScore = getTeamScore(team.id)
    const newScore = Math.max(0, Math.min(200, currentScore + delta))

    try {
      // Atomic upsert to avoid unique constraint violations
      await upsertQuarters([
        {
          team_id: team.id,
          quarter_number: scoreboard.current_quarter,
          points: newScore,
          fouls: 0,
          timeouts: 0,
        },
      ])

      // Optimistically update local state for snappy UI
      const updateQuarters = (prev: Quarter[]) => {
        const existing = prev.find(q => 
          q.team_id === team.id && q.quarter_number === scoreboard.current_quarter
        )
        if (existing) {
          return prev.map(q => (q.id === existing.id ? { ...q, points: newScore } : q))
        }
        return [...prev, {
          id: crypto.randomUUID(),
          team_id: team.id,
          quarter_number: scoreboard.current_quarter,
          points: newScore,
          fouls: 0,
          timeouts: 0,
          created_at: new Date().toISOString(),
        }]
      }

      setQuarters(updateQuarters)
      setAllQuarters(updateQuarters)
    } catch (error) {
      console.error('Error updating score:', error)
    }
  }, [scoreboard, isOwner, getTeamScore, setQuarters, setAllQuarters])

  return { updateScore }
}

