import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
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

export const Scoreboard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scoreboard, setScoreboard] = useState<ScoreboardData | null>(null)
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [allQuarters, setAllQuarters] = useState<Quarter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const subscriptionRef = useRef<any>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoreboardRef = useRef<ScoreboardData | null>(null)

  useEffect(() => {
    if (!id) return
    
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
    
    // Add fallback polling every 10 seconds (much less frequent)
    pollIntervalRef.current = setInterval(() => {
      if (scoreboard?.id) {
        supabase
          .from('scoreboards')
          .select(`*, teams (*)`)
          .eq('id', scoreboard.id)
          .single()
          .then(({ data }) => {
            if (data && JSON.stringify(data) !== JSON.stringify(scoreboard)) {
              setScoreboard(data)
            }
          })
      }
    }, 10000) // 10 seconds instead of 3
    
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
  }, [id]) // ONLY depend on id, NOT scoreboard!

  const fetchScoreboard = async () => {
    try {
      const { data, error } = await supabase
        .from('scoreboards')
        .select(`
          *,
          teams (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) {
        setError('Scoreboard not found')
        return
      }

      setScoreboard(data)
      scoreboardRef.current = data
      setIsOwner(user?.id === data.owner_id)

      // Fetch quarters for all teams
      if (data.teams && data.teams.length > 0) {
        const teamIds = data.teams.map((team: Team) => team.id)
        
        // Fetch current quarter
        const { data: quartersData, error: quartersError } = await supabase
          .from('quarters')
          .select('*')
          .in('team_id', teamIds)
          .eq('quarter_number', data.current_quarter)

        if (quartersError) throw quartersError
        setQuarters(quartersData || [])

        // Fetch all quarters for history
        const { data: allQuartersData, error: allQuartersError } = await supabase
          .from('quarters')
          .select('*')
          .in('team_id', teamIds)
          .order('quarter_number', { ascending: true })

        if (allQuartersError) throw allQuartersError
        setAllQuarters(allQuartersData || [])
      }
    } catch (error) {
      console.error('Error fetching scoreboard:', error)
      setError('Failed to load scoreboard')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    if (!id) return

    const subscription = supabase
      .channel(`scoreboard-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scoreboards',
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const newData = payload.new as ScoreboardData
          setScoreboard(newData)
          scoreboardRef.current = newData
          
          // Also refresh quarters data when scoreboard updates
          if (newData.teams && newData.teams.length > 0) {
            const teamIds = newData.teams.map(team => team.id)
            
            // Refresh current quarter
            const { data: currentQuarters } = await supabase
              .from('quarters')
              .select('*')
              .in('team_id', teamIds)
              .eq('quarter_number', newData.current_quarter)
            setQuarters(currentQuarters || [])

            // Refresh all quarters for history
            const { data: allQuartersData } = await supabase
              .from('quarters')
              .select('*')
              .in('team_id', teamIds)
              .order('quarter_number', { ascending: true })
            setAllQuarters(allQuartersData || [])
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
          // Only refresh if this quarter belongs to our scoreboard teams
          const currentScoreboard = scoreboardRef.current
          if (currentScoreboard?.teams && payload.new) {
            const teamIds = currentScoreboard.teams.map(team => team.id)
            const quarterTeamId = (payload.new as any).team_id
            
            if (teamIds.includes(quarterTeamId)) {
              // Refresh current quarter
              const { data: currentQuarters } = await supabase
                .from('quarters')
                .select('*')
                .in('team_id', teamIds)
                .eq('quarter_number', currentScoreboard.current_quarter)
              setQuarters(currentQuarters || [])

              // Refresh all quarters for history
              const { data: allQuartersData } = await supabase
                .from('quarters')
                .select('*')
                .in('team_id', teamIds)
                .order('quarter_number', { ascending: true })
              setAllQuarters(allQuartersData || [])
            }
          }
        }
      )
      .subscribe()

    return subscription
  }

  // Helper function to get team score for current quarter
  const getTeamScore = (teamId: string) => {
    const quarter = quarters.find(q => q.team_id === teamId)
    return quarter?.points || 0
  }

  // Helper function to get cumulative team score across all quarters
  const getTeamTotalScore = (teamId: string) => {
    return allQuarters
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + q.points, 0)
  }

  // Helper function to get team by index
  const getTeam = (index: number) => {
    return scoreboard?.teams[index] || null
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


  // Handle copy share code with feedback
  const handleCopyShareCode = () => {
    if (!scoreboard?.share_code) return
    
    navigator.clipboard.writeText(scoreboard.share_code)
    setShowCopied(true)
    
    setTimeout(() => {
      setShowCopied(false)
    }, 3000)
  }

  // Timer control functions - With optimistic updates
  const handleTimerStart = async () => {
    if (!scoreboard || !isOwner) return

    const now = new Date().toISOString()
    let newPausedDuration = 0

    if (scoreboard.timer_state === 'paused') {
      // When resuming from pause, keep the current paused duration
      newPausedDuration = scoreboard.timer_paused_duration
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
        .eq('id', id)

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
  }

  const handleTimerPause = async () => {
    if (!scoreboard || !isOwner || scoreboard.timer_state !== 'running') return

    if (!scoreboard.timer_started_at) return

    // Calculate how much time has elapsed since the timer started
    const now = new Date().getTime()
    const startTime = new Date(scoreboard.timer_started_at).getTime()
    const elapsedSinceStart = Math.floor((now - startTime) / 1000)
    
    // Total paused duration = previous paused time + current elapsed time
    const newPausedDuration = scoreboard.timer_paused_duration + elapsedSinceStart

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
        .eq('id', id)

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
  }

  const handleTimerReset = async () => {
    if (!scoreboard || !isOwner) return

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
        .eq('id', id)

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
  }

  const updateScore = async (teamIndex: number, delta: number) => {
    if (!scoreboard || !isOwner || !scoreboard.teams[teamIndex]) return

    const team = scoreboard.teams[teamIndex]
    const currentScore = getTeamScore(team.id)
    const newScore = Math.max(0, Math.min(200, currentScore + delta))

    try {
      // Atomic upsert to avoid unique constraint violations
      const { error } = await supabase
        .from('quarters')
        .upsert(
          [
            {
              team_id: team.id,
              quarter_number: scoreboard.current_quarter,
              points: newScore,
              fouls: 0,
              timeouts: 0,
            },
          ],
          { onConflict: 'team_id,quarter_number' }
        )

      if (error) throw error

      // Optimistically update local state for snappy UI
      setQuarters(prev => {
        const existing = prev.find(q => q.team_id === team.id && q.quarter_number === scoreboard.current_quarter)
        if (existing) {
          return prev.map(q => (q.id === existing.id ? { ...q, points: newScore } : q))
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            team_id: team.id,
            quarter_number: scoreboard.current_quarter,
            points: newScore,
            fouls: 0,
            timeouts: 0,
            created_at: new Date().toISOString(),
          },
        ]
      })

      // Also update allQuarters state for history
      setAllQuarters(prev => {
        const existing = prev.find(q => q.team_id === team.id && q.quarter_number === scoreboard.current_quarter)
        if (existing) {
          return prev.map(q => (q.id === existing.id ? { ...q, points: newScore } : q))
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            team_id: team.id,
            quarter_number: scoreboard.current_quarter,
            points: newScore,
            fouls: 0,
            timeouts: 0,
            created_at: new Date().toISOString(),
          },
        ]
      })
    } catch (error) {
      console.error('Error updating score:', error)
    }
  }

  const updateQuarter = async (delta: number) => {
    if (!scoreboard || !isOwner) return

    const newQuarter = Math.max(1, Math.min(4, scoreboard.current_quarter + delta))

    try {
      const { error } = await supabase
        .from('scoreboards')
        .update({ current_quarter: newQuarter })
        .eq('id', id)

      if (error) throw error

      // Update local scoreboard state with new quarter
      setScoreboard(prev => prev ? { ...prev, current_quarter: newQuarter } : null)

      // Refresh quarters for the new quarter
      if (scoreboard.teams && scoreboard.teams.length > 0) {
        const teamIds = scoreboard.teams.map(team => team.id)
        
        // Fetch quarters for the new quarter
        const { data: quartersData, error: quartersError } = await supabase
          .from('quarters')
          .select('*')
          .in('team_id', teamIds)
          .eq('quarter_number', newQuarter)

        if (quartersError) throw quartersError
        setQuarters(quartersData || [])
      }
    } catch (error) {
      console.error('Error updating quarter:', error)
    }
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
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
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
            className="text-gray-300 hover:text-white"
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
            <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <span>{isOwner ? 'Owner View' : 'View Only'} • Quarter {scoreboard.current_quarter}</span>
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
            <div className="relative">
              <div className="text-8xl font-bold mb-4">
                {getTeam(0) ? getTeamTotalScore(getTeam(0)!.id) : 0}
              </div>
              {isOwner && getTeam(0) && (
                <div className="space-y-4">
                  <button
                    onClick={() => updateScore(0, 1)}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateScore(0, -1)}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
                  >
                    -1
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">
              {getTeam(1)?.name || 'Loading...'}
            </h2>
            <div className="relative">
              <div className="text-8xl font-bold mb-4">
                {getTeam(1) ? getTeamTotalScore(getTeam(1)!.id) : 0}
              </div>
              {isOwner && getTeam(1) && (
                <div className="space-y-4">
                  <button
                    onClick={() => updateScore(1, 1)}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateScore(1, -1)}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
                  >
                    -1
                  </button>
                </div>
              )}
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
            isOwner={isOwner}
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onReset={handleTimerReset}
            className="max-w-md mx-auto"
          />
        </div>

        {/* Quarter Controls */}
        {isOwner && (
          <div className="mt-8 text-center">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-4">Quarter Controls</h3>
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => updateQuarter(-1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  Previous
                </button>
                <span className="text-2xl font-bold">Q{scoreboard.current_quarter}</span>
                <button
                  onClick={() => updateQuarter(1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <div className="text-center">
                      {q.quarter === scoreboard.current_quarter ? (
                        <span className="text-green-400 font-bold">
                          {getTeam(0) ? getTeamScore(getTeam(0)!.id) : 0}
                        </span>
                      ) : (
                        q.teamAScore
                      )}
                    </div>
                    <div className="text-center">
                      {q.quarter === scoreboard.current_quarter ? (
                        <span className="text-green-400 font-bold">
                          {getTeam(1) ? getTeamScore(getTeam(1)!.id) : 0}
                        </span>
                      ) : (
                        q.teamBScore
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>


        {/* Share Code Display */}
        {scoreboard.share_code && (
          <div className="mt-8 text-center">
            <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-2">Share Code</h3>
              <div 
                className="text-2xl font-mono bg-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={handleCopyShareCode}
                title="Click to copy share code"
              >
                {showCopied ? 'Copied!' : scoreboard.share_code}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Click the code above to copy it
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
