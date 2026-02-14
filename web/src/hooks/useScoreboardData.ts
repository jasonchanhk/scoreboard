import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { sortTeams } from '../utils/teamUtils'
import { getByTeamIds } from '../data/quartersRepo'
import { getByIdWithTeams, getByShareCodeWithTeams } from '../data/scoreboardsRepo'
import type { ScoreboardData, Team, Quarter } from '../types/scoreboard'

interface UseScoreboardDataProps {
  scoreboardId?: string
  shareCode?: string
  userId?: string
}

export const useScoreboardData = ({ scoreboardId, shareCode, userId }: UseScoreboardDataProps) => {
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null)
  const [allQuarters, setAllQuarters] = useState<Quarter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const pollIntervalRef = useRef<number | null>(null)
  const scoreboardRef = useRef<ScoreboardData | null>(null)

  // Helper function to fetch quarters for teams
  const fetchQuarters = async (teamIds: string[]) => {
    return getByTeamIds(teamIds)
  }

  const fetchScoreboard = async () => {
    try {
      let data: ScoreboardData | null = null
      if (scoreboardId) {
        data = (await getByIdWithTeams(scoreboardId)) as ScoreboardData | null
      } else if (shareCode) {
        data = (await getByShareCodeWithTeams(shareCode)) as ScoreboardData | null
      } else {
        throw new Error('No scoreboard ID or share code provided')
      }

      if (!data) {
        setError(shareCode ? 'Scoreboard not found or not shared' : 'Scoreboard not found')
        return
      }

      // Ensure teams are ordered consistently (home first, away second)
      const teams = data.teams ? sortTeams(data.teams) : []
      const normalized = { ...data, teams }

      setScoreboard(normalized)
      scoreboardRef.current = normalized
      setIsOwner(userId ? userId === normalized.owner_id : false)

      // Fetch all quarters for teams
      if (teams.length > 0) {
        const teamIds = teams.map((team: Team) => team.id)
        const quartersData = await fetchQuarters(teamIds)
        setAllQuarters(quartersData)
      } else {
        setAllQuarters([])
      }
    } catch (error) {
      console.error('Error fetching scoreboard:', error)
      setError('Failed to load scoreboard')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    const identifier = scoreboardId || shareCode
    if (!identifier) return

    const channelName = scoreboardId ? `scoreboard-${scoreboardId}` : `public-scoreboard-${shareCode}`
    const filter = scoreboardId ? `id=eq.${scoreboardId}` : `share_code=eq.${shareCode}`

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scoreboards',
          filter,
        },
        async () => {
          console.log('Scoreboard update received, fetching complete data...')
          await fetchScoreboard()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quarters',
        },
        async (payload) => {
          console.log('Quarters update received')
          // Refresh all quarters when they change
          const currentScoreboard = scoreboardRef.current
          if (currentScoreboard?.teams) {
            const teamIds = currentScoreboard.teams.map(team => team.id)
            
            // For scoreboard view, check if the quarter belongs to our teams
            if (scoreboardId && payload.new) {
              const quarterTeamId = (payload.new as any).team_id
              if (!teamIds.includes(quarterTeamId)) {
                return
              }
            }
            
            const quartersData = await fetchQuarters(teamIds)
            setAllQuarters(quartersData)
          }
        }
      )
      .subscribe()

    return subscription
  }

  useEffect(() => {
    if (!scoreboardId && !shareCode) return
    
    // Clean up existing subscription and polling
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    fetchScoreboard()
    subscriptionRef.current = subscribeToUpdates()
    
    // Add fallback polling every 10 seconds
    pollIntervalRef.current = setInterval(async () => {
      if (!scoreboard?.id) return
      const reload = await getByIdWithTeams(scoreboard.id!)
      if (reload) {
        const teams = reload.teams ? sortTeams(reload.teams) : []
        const normalized = { ...reload, teams } as ScoreboardData
        if (JSON.stringify(normalized) !== JSON.stringify(scoreboard)) {
          setScoreboard(normalized)
        }
      }
    }, 10000)

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [scoreboardId, shareCode]) // Only depend on identifiers, NOT scoreboard!

  return {
    scoreboard,
    allQuarters,
    loading,
    error,
    isOwner,
    setScoreboard,
    setAllQuarters
  }
}
