import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoreboardRef = useRef<ScoreboardData | null>(null)

  // Helper function to sort teams consistently
  const sortTeams = (teams: Team[]) => {
    return teams.sort((a: Team, b: Team) => {
      if (a.position === 'home' && b.position === 'away') return -1
      if (a.position === 'away' && b.position === 'home') return 1
      return 0
    })
  }

  // Helper function to fetch quarters for teams
  const fetchQuarters = async (teamIds: string[]) => {
    const { data: quartersData, error: quartersError } = await supabase
      .from('quarters')
      .select('*')
      .in('team_id', teamIds)
      .order('quarter_number', { ascending: true })

    if (quartersError) throw quartersError
    return quartersData || []
  }

  const fetchScoreboard = async () => {
    try {
      const query = supabase
        .from('scoreboards')
        .select(`
          *,
          teams (*)
        `)

      let result
      if (scoreboardId) {
        result = await query.eq('id', scoreboardId).single()
      } else if (shareCode) {
        result = await query.eq('share_code', shareCode).single()
      } else {
        throw new Error('No scoreboard ID or share code provided')
      }

      const { data, error } = result

      if (error) throw error
      if (!data) {
        setError(shareCode ? 'Scoreboard not found or not shared' : 'Scoreboard not found')
        return
      }

      // Ensure teams are ordered consistently (home first, away second)
      if (data.teams) {
        data.teams = sortTeams(data.teams)
      }

      setScoreboard(data)
      scoreboardRef.current = data
      setIsOwner(userId ? userId === data.owner_id : false)

      // Fetch all quarters for teams
      if (data.teams && data.teams.length > 0) {
        const teamIds = data.teams.map((team: Team) => team.id)
        const quartersData = await fetchQuarters(teamIds)
        setAllQuarters(quartersData)
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
          
          // Fetch complete scoreboard data with teams
          const query = supabase
            .from('scoreboards')
            .select(`
              *,
              teams (*)
            `)

          let result
          if (scoreboardId) {
            result = await query.eq('id', scoreboardId).single()
          } else if (shareCode) {
            result = await query.eq('share_code', shareCode).single()
          }

          if (result) {
            const { data: completeData, error } = result

            if (error) {
              console.error('Error fetching complete scoreboard data:', error)
              return
            }

            // Ensure teams are ordered consistently (home first, away second)
            if (completeData.teams) {
              completeData.teams = sortTeams(completeData.teams)
            }
            
            setScoreboard(completeData)
            scoreboardRef.current = completeData
            
            // Also refresh quarters data when scoreboard updates
            if (completeData.teams && completeData.teams.length > 0) {
              const teamIds = completeData.teams.map((team: Team) => team.id)
              const quartersData = await fetchQuarters(teamIds)
              setAllQuarters(quartersData)
            }
          }
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
    pollIntervalRef.current = setInterval(() => {
      if (scoreboard?.id) {
        supabase
          .from('scoreboards')
          .select(`*, teams (*)`)
          .eq('id', scoreboard.id)
          .single()
          .then(({ data }) => {
            if (data && JSON.stringify(data) !== JSON.stringify(scoreboard)) {
              // Ensure teams are ordered consistently (home first, away second)
              if (data.teams) {
                data.teams = sortTeams(data.teams)
              }
              setScoreboard(data)
            }
          })
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
