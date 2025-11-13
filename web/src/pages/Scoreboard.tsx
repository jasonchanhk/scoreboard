import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Timer } from '../components/Timer'
import { QuarterHistory } from '../components/QuarterHistory'
import { Alert } from '../components/Alert'
import { useScoreboardData } from '../hooks/useScoreboardData'
import type { Quarter } from '../types/scoreboard'

export const Scoreboard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [showCopied, setShowCopied] = useState(false)
  const [isGeneratingShareCode, setIsGeneratingShareCode] = useState(false)
  const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'error' | 'success' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error',
  })
  
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

  const handleGenerateShareCode = async () => {
    if (!scoreboard || !isOwner) return

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const generateCode = () => {
      const bytes = new Uint8Array(6)
      window.crypto.getRandomValues(bytes)
      let out = ''
      for (let i = 0; i < bytes.length; i++) {
        out += alphabet[bytes[i] % alphabet.length]
      }
      return out
    }

    const scoreboardId = scoreboard.id
    const maxAttempts = 10
    let lastError: unknown = null

    setIsGeneratingShareCode(true)

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const shareCode = generateCode()
          const { error } = await supabase
            .from('scoreboards')
            .update({ share_code: shareCode })
            .eq('id', scoreboardId)

          if (error) {
            // @ts-ignore - supabase error may include code
            if (error.code === '23505') {
              continue
            }
            throw error
          }

          setScoreboard(prev => (prev ? { ...prev, share_code: shareCode } : prev))
          return
        } catch (err) {
          lastError = err
        }
      }

      console.error('Error generating share code after retries:', lastError)
      setAlert({
        isOpen: true,
        title: 'Error',
        message: 'Could not generate a share code. Please try again later.',
        variant: 'error',
      })
    } finally {
      setIsGeneratingShareCode(false)
    }
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

  // Helper function to get cumulative team score across all quarters
  const getTeamTotalScore = (teamId: string) => {
    if (!allQuarters || !teamId) return 0
    return allQuarters
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + q.points, 0)
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
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  
  // Generate public view URL for QR code
  const publicViewUrl = id ? `${window.location.origin}/scoreboard/${id}/view` : ''

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
      <Alert
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      
      {/* Back Button - Top Left Corner */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 z-10 text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
        aria-label="Back to Dashboard"
      >
        ←
      </button>

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col py-10 px-20 overflow-hidden">
        {/* Top Section: Score Container */}
        <div className="flex-1 min-h-0 mb-4 flex items-center justify-center">
          <div className="flex items-center gap-4 h-full">
            {/* Left Score Controls */}
            {isOwner && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => updateScore(0, 1)}
                  className="text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
                  aria-label="Add 1 point"
                >
                  +
                </button>
                <button
                  onClick={() => updateScore(0, -1)}
                  className="text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
                  aria-label="Subtract 1 point"
                >
                  −
                </button>
              </div>
            )}
            
            {/* Team Containers */}
            <div className="grid grid-cols-2 gap-4 h-full" style={{ width: '60vw' }}>
              {/* Left Team */}
              <div className="border-4 border-white rounded-2xl p-3 flex flex-col h-full">
                <div className="text-2xl font-bold mb-2 pb-2 border-b-4 border-white text-center">
                  {team0?.name || 'Team 1'}
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                  <div className="font-bold leading-none" style={{ fontSize: 'min(30vh, 28vw)' }}>
                    {team0 ? getTeamTotalScore(team0.id) : 0}
                  </div>
                </div>
              </div>

              {/* Right Team */}
              <div className="border-4 border-white rounded-2xl p-3 flex flex-col h-full">
                <div className="text-2xl font-bold mb-2 pb-2 border-b-4 border-white text-center">
                  {team1?.name || 'Team 2'}
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                  <div className="font-bold leading-none" style={{ fontSize: 'min(30vh, 28vw)' }}>
                    {team1 ? getTeamTotalScore(team1.id) : 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Score Controls */}
            {isOwner && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => updateScore(1, 1)}
                  className="text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
                  aria-label="Add 1 point"
                >
                  +
                </button>
                <button
                  onClick={() => updateScore(1, -1)}
                  className="text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
                  aria-label="Subtract 1 point"
                >
                  −
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Three Equal Width Sections using Flex */}
        <div className="flex gap-4 flex-shrink-0 min-h-0" style={{ maxHeight: '40vh' }}>
          {/* Left: Quarter History */}
          <div className="flex-1 border-4 border-white rounded-2xl p-3 flex flex-col min-w-0">
            <h3 className="text-base font-bold mb-2 text-center">Quarter History</h3>
            <div className="flex-1 overflow-auto min-h-0">
              <QuarterHistory
                teams={scoreboard?.teams || []}
                allQuarters={allQuarters}
                currentQuarter={scoreboard?.current_quarter || 1}
                quarters={quarters}
                showCurrentQuarterScores={true}
              />
            </div>
          </div>

          {/* Center: Timer and Quarter Control */}
          <div className="flex-1 border-4 border-white rounded-2xl p-3 flex flex-col min-w-0">
            {/* Timer */}
            <div className="mb-3 flex-1 flex flex-col min-h-0">
              <Timer
                duration={scoreboard?.timer_duration || 0}
                startedAt={scoreboard?.timer_started_at || null}
                state={scoreboard?.timer_state || 'stopped'}
                pausedDuration={scoreboard?.timer_paused_duration || 0}
                isOwner={isOwner}
                onStart={handleTimerStart}
                onPause={handleTimerPause}
                onReset={handleTimerReset}
                className="w-full h-full"
              />
            </div>

            {/* Quarter Controls */}
            {isOwner && (
              <div className="border-t-4 border-white pt-3 flex-shrink-0">
                <div className="flex justify-center items-center space-x-3">
                  <button
                    onClick={() => updateQuarter(-1)}
                    className="text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
                    aria-label="Previous Quarter"
                  >
                    ←
                  </button>
                  <span className="text-xl font-bold">Q{scoreboard?.current_quarter || 1}</span>
                  <button
                    onClick={() => updateQuarter(1)}
                    className="text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
                    aria-label="Next Quarter"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Share Code and View Public */}
          <div className="flex-1 border-4 border-white rounded-2xl p-3 flex flex-col min-w-0">
            <h3 className="text-base font-bold mb-2 text-center">Share</h3>
            <div className="flex gap-3 flex-1 items-start">
              {/* Left Side: Share Code and View Public Button */}
              <div className="flex-1 flex flex-col">
                {/* Share Code */}
                <div className="mb-3 flex-shrink-0">
                  <div className="text-xs text-gray-300 mb-1 text-center">Share Code</div>
                  {scoreboard.share_code ? (
                    <div 
                      className="text-xl font-mono bg-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors text-center"
                      onClick={handleCopyShareCode}
                      title="Click to copy share code"
                    >
                      {showCopied ? 'Copied!' : scoreboard.share_code}
                    </div>
                  ) : isOwner ? (
                    <button
                      onClick={handleGenerateShareCode}
                      disabled={isGeneratingShareCode}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-3 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isGeneratingShareCode ? 'Generating...' : 'Generate Share Code'}
                    </button>
                  ) : (
                    <div className="text-sm text-gray-400 text-center">Not available</div>
                  )}
                </div>
                
                {/* View Public Button */}
                <div className="flex-shrink-0">
                  <div className="text-xs text-gray-300 mb-1 text-center">Public View</div>
                  <button
                    onClick={handleViewPublic}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-3 rounded-lg text-sm font-medium text-center cursor-pointer w-full"
                  >
                    Go to Public View
                  </button>
                </div>
              </div>

              {/* Right Side: QR Code */}
              {publicViewUrl && (
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="text-xs text-gray-300 mb-1 text-center">Scan to View</div>
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      value={publicViewUrl}
                      size={120}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

