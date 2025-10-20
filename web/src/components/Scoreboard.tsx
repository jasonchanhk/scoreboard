import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Timer } from './Timer'
import { ScoreboardHeader } from './ScoreboardHeader'
import { ScoreboardDisplay } from './ScoreboardDisplay'
import { QuarterHistory } from './QuarterHistory'
import { useScoreboardData } from '../hooks/useScoreboardData'
import type { Quarter } from '../types/scoreboard'

export const Scoreboard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [showCopied, setShowCopied] = useState(false)
  
  const { scoreboard, allQuarters, loading, error, isOwner, setScoreboard, setAllQuarters } = useScoreboardData({
    scoreboardId: id,
    userId: user?.id
  })

  // Fetch current quarter data when scoreboard or current quarter changes
  useEffect(() => {
    if (!scoreboard?.teams || scoreboard.teams.length === 0) return

    const fetchCurrentQuarter = async () => {
      const teamIds = scoreboard.teams.map(team => team.id)
      const { data: quartersData, error: quartersError } = await supabase
        .from('quarters')
        .select('*')
        .in('team_id', teamIds)
        .eq('quarter_number', scoreboard.current_quarter)

      if (quartersError) {
        console.error('Error fetching current quarter:', quartersError)
        return
      }
      setQuarters(quartersData || [])
    }

    fetchCurrentQuarter()
  }, [scoreboard?.current_quarter, scoreboard?.teams])

  // Helper function to get team score for current quarter
  const getTeamScore = (teamId: string) => {
    const quarter = quarters.find(q => q.team_id === teamId)
    return quarter?.points || 0
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

  // Navigate to public view
  const handleViewPublic = () => {
    if (!id) return
    navigate(`/scoreboard/${id}/view`)
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
    if (!scoreboard || !isOwner || !scoreboard.teams || !scoreboard.teams[teamIndex]) return

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
      if (scoreboard?.teams && scoreboard.teams.length > 0) {
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
      <ScoreboardHeader
        scoreboard={scoreboard!}
        isOwner={isOwner}
        onBackClick={() => navigate('/')}
        onViewPublic={handleViewPublic}
        onCopyShareCode={handleCopyShareCode}
        showCopied={showCopied}
      />

      {/* Main Scoreboard */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Scoreboard Display */}
        <ScoreboardDisplay
          teams={scoreboard?.teams || []}
          allQuarters={allQuarters}
          isOwner={isOwner}
          onScoreUpdate={updateScore}
        />

        {/* Timer */}
        <div className="mt-12 text-center">
          <Timer
            duration={scoreboard?.timer_duration || 0}
            startedAt={scoreboard?.timer_started_at || null}
            state={scoreboard?.timer_state || 'stopped'}
            pausedDuration={scoreboard?.timer_paused_duration || 0}
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
                <span className="text-2xl font-bold">Q{scoreboard?.current_quarter || 1}</span>
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
          <QuarterHistory
            teams={scoreboard?.teams || []}
            allQuarters={allQuarters}
            currentQuarter={scoreboard?.current_quarter || 1}
            quarters={quarters}
            showCurrentQuarterScores={true}
          />
        </div>

      </div>
    </div>
  )
}
