import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Timer } from './Timer'

interface Team {
  id: string
  name: string
  scoreboard_id: string
  created_at: string
}

interface Quarter {
  id: string
  team_id: string
  quarter_number: number
  points: number
  fouls: number
  timeouts: number
  created_at: string
}

interface ScoreboardData {
  id: string
  owner_id: string
  share_code: string | null
  current_quarter: number
  timer: string
  timer_duration: number
  timer_started_at: string | null
  timer_state: 'stopped' | 'running' | 'paused'
  timer_paused_duration: number
  created_at: string
  teams: Team[]
}

export const PublicView: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>()
  const navigate = useNavigate()
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null)
  const [allQuarters, setAllQuarters] = useState<Quarter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shareCode) return
    fetchScoreboard()
    subscribeToUpdates()
    
    // Fallback polling every 2 seconds if subscriptions fail
    const pollInterval = setInterval(() => {
      if (scoreboard?.id) {
        // Refetch scoreboard data
        supabase
          .from('scoreboards')
          .select(`
            *,
            teams (*)
          `)
          .eq('id', scoreboard.id)
          .single()
          .then(({ data }) => {
            if (data && JSON.stringify(data) !== JSON.stringify(scoreboard)) {
              console.log('Polling detected changes, updating...')
              setScoreboard(data)
            }
          })
      }
    }, 2000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [shareCode, scoreboard])

  const fetchScoreboard = async () => {
    try {
      const { data, error } = await supabase
        .from('scoreboards')
        .select(`
          *,
          teams (*)
        `)
        .eq('share_code', shareCode)
        .single()

      if (error) throw error
      if (!data) {
        setError('Scoreboard not found or not shared')
        return
      }

      setScoreboard(data)

      // Fetch all quarters for teams
      if (data.teams && data.teams.length > 0) {
        const teamIds = data.teams.map(team => team.id)
        const { data: quartersData, error: quartersError } = await supabase
          .from('quarters')
          .select('*')
          .in('team_id', teamIds)
          .order('quarter_number', { ascending: true })

        if (quartersError) throw quartersError
        setAllQuarters(quartersData || [])
      }
    } catch (error) {
      console.error('Error fetching scoreboard:', error)
      setError('Failed to load scoreboard')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    if (!shareCode) return

    const subscription = supabase
      .channel(`public-scoreboard-${shareCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scoreboards',
          filter: `share_code=eq.${shareCode}`,
        },
        async (payload) => {
          console.log('Scoreboard update received:', payload)
          setScoreboard(payload.new as ScoreboardData)
          
          // Also refresh quarters data when scoreboard updates
          const newData = payload.new as ScoreboardData
          if (newData.teams && newData.teams.length > 0) {
            const teamIds = newData.teams.map(team => team.id)
            const { data: quartersData, error: quartersError } = await supabase
              .from('quarters')
              .select('*')
              .in('team_id', teamIds)
              .order('quarter_number', { ascending: true })

            if (!quartersError) {
              setAllQuarters(quartersData || [])
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
        async () => {
          console.log('Quarters update received')
          // Refresh all quarters when they change
          if (scoreboard?.teams) {
            const teamIds = scoreboard.teams.map(team => team.id)
            const { data: quartersData, error: quartersError } = await supabase
              .from('quarters')
              .select('*')
              .in('team_id', teamIds)
              .order('quarter_number', { ascending: true })

            if (!quartersError) {
              setAllQuarters(quartersData || [])
            }
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  // Helper function to get team by index
  const getTeam = (index: number) => {
    return scoreboard?.teams[index] || null
  }

  // Helper function to get cumulative team score across all quarters
  const getTeamTotalScore = (teamId: string) => {
    return allQuarters
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + q.points, 0)
  }

  // Helper function to get quarter scores organized by quarter
  const getQuarterHistory = () => {
    if (!scoreboard || scoreboard.teams.length < 2) return []
    
    const teamA = scoreboard.teams[0]
    const teamB = scoreboard.teams[1]
    const quarters = [1, 2, 3, 4]
    
    return quarters.map(q => {
      const teamAQuarter = allQuarters.find(quarter => 
        quarter.team_id === teamA.id && quarter.quarter_number === q
      )
      const teamBQuarter = allQuarters.find(quarter => 
        quarter.team_id === teamB.id && quarter.quarter_number === q
      )
      
      return {
        quarter: q,
        teamAScore: teamAQuarter?.points || 0,
        teamBScore: teamBQuarter?.points || 0,
        teamAName: teamA.name,
        teamBName: teamB.name,
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading scoreboard...</div>
      </div>
    )
  }

  if (error || !scoreboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Scoreboard not found'}</div>
          <div className="text-gray-400 text-sm">
            This scoreboard may not be shared or the share code is invalid.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {scoreboard.teams.length >= 2 
                ? `${scoreboard.teams[0].name} vs ${scoreboard.teams[1].name}`
                : 'Loading teams...'
              }
            </h1>
            <div className="text-sm text-gray-400 mt-1">
              Live Scoreboard • Quarter {scoreboard.current_quarter}
            </div>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Scoreboard */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Team A */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">
              {getTeam(0)?.name || 'Loading...'}
            </h2>
            <div className="text-8xl font-bold">
              {getTeam(0) ? getTeamTotalScore(getTeam(0)!.id) : 0}
            </div>
          </div>

          {/* Team B */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">
              {getTeam(1)?.name || 'Loading...'}
            </h2>
            <div className="text-8xl font-bold">
              {getTeam(1) ? getTeamTotalScore(getTeam(1)!.id) : 0}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="mt-12 text-center">
          <Timer
            duration={scoreboard.timer_duration}
            startedAt={scoreboard.timer_started_at}
            state={scoreboard.timer_state}
            pausedDuration={scoreboard.timer_paused_duration}
            isOwner={false} // Public view is always read-only
            onStart={() => {}} // No-op functions for public view
            onPause={() => {}}
            onReset={() => {}}
            className="max-w-md mx-auto"
          />
        </div>

        {/* Current Quarter Display */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-2xl font-bold mb-2">Quarter {scoreboard.current_quarter}</div>
            <div className="text-lg text-gray-400">Live Scoreboard</div>
          </div>
        </div>

        {/* Quarter History */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6">Quarter History</h3>
            
            {scoreboard.teams.length >= 2 && (
              <>
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-medium text-gray-300">
                  <div>Quarter</div>
                  <div className="text-center">{getTeam(0)?.name}</div>
                  <div className="text-center">{getTeam(1)?.name}</div>
                </div>

                {/* Quarter rows */}
                {getQuarterHistory().map((q) => (
                  <div key={q.quarter} className={`grid grid-cols-3 gap-4 py-2 text-sm rounded ${
                    q.quarter === scoreboard.current_quarter ? 'bg-gray-700' : ''
                  }`}>
                    <div className="font-medium">Q{q.quarter}</div>
                    <div className="text-center">{q.teamAScore}</div>
                    <div className="text-center">{q.teamBScore}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* View Only Notice */}
        <div className="mt-8 text-center">
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-blue-200 text-sm">
              📺 View Only - This scoreboard updates in real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
