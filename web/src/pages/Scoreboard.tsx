import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { FaBasketballBall } from 'react-icons/fa'
import { IoAdd, IoRemove } from 'react-icons/io5'
import { HiPencil, HiX } from 'react-icons/hi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Timer } from '../components/Timer'
import { Alert } from '../components/Alert'
import { useScoreboardData } from '../hooks/useScoreboardData'
import type { Quarter } from '../types/scoreboard'

export const Scoreboard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'error' | 'success' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error',
  })
  const [shareOpen, setShareOpen] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isGeneratingShareCode, setIsGeneratingShareCode] = useState(false)
  
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


  // Share handlers (modal)
  const handleCopyShareCode = useCallback(() => {
    if (!scoreboard?.share_code) return
    navigator.clipboard.writeText(scoreboard.share_code)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }, [scoreboard?.share_code])

  const handleGenerateShareCode = useCallback(async () => {
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
            // @ts-ignore
            if (error.code === '23505') continue
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
  }, [scoreboard, isOwner, setScoreboard])

  const handleViewPublic = useCallback(() => {
    if (!id) return
    navigate(`/scoreboard/${id}/view`)
  }, [id, navigate])

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-gray-900 text-xl font-medium">Loading scoreboard...</div>
        </div>
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
  
  const publicViewUrl = id ? `${window.location.origin}/scoreboard/${id}/view` : ''

  // Format game date/time for navbar
  const formattedDate = scoreboard.game_date
    ? new Date(scoreboard.game_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null
  const startTime = scoreboard.game_start_time ? scoreboard.game_start_time.substring(0, 5) : ''
  const endTime = scoreboard.game_end_time ? scoreboard.game_end_time.substring(0, 5) : ''
  const timeDisplay =
    startTime && endTime ? `${startTime} – ${endTime}` : startTime ? startTime : endTime ? endTime : null

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full hover:bg-orange-600 transition-colors cursor-pointer"
                  aria-label="Back to Dashboard"
                  title="Back to Dashboard"
                >
                  <FaBasketballBall className="text-white text-sm" />
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {formattedDate || 'No date set'}
                    {timeDisplay ? ` · ${timeDisplay}` : ''}
                  </span>
                  {scoreboard.venue && (
                    <span className="text-xs text-gray-500">{scoreboard.venue}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Share Dialog */}
      {shareOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShareOpen(false)
          }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="relative top-20 mx-auto p-5 w-11/12 md:w-2/3 lg:w-1/2 shadow-2xl rounded-lg bg-white text-gray-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Share</h3>
              <button
                onClick={() => setShareOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                <HiX className="text-2xl" />
              </button>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-1 flex flex-col">
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-1">Share Code</div>
                  {scoreboard.share_code ? (
                    <div
                      className="text-xl font-mono bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-center"
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
                <div className="flex-shrink-0">
                  <div className="text-xs text-gray-600 mb-1">Public View</div>
                  <button
                    onClick={handleViewPublic}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-3 rounded-lg text-sm font-medium text-center cursor-pointer w-full"
                  >
                    Go to Public View
                  </button>
                </div>
              </div>
              {publicViewUrl && (
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-1">Scan to View</div>
                  <div className="bg-white p-2 rounded-lg border">
                    <QRCodeSVG value={publicViewUrl} size={120} level="H" includeMargin={false} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Alert
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      
      {/* Back handled via navbar logo button */}

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section: Score Container */}
        <div className="flex-1 min-h-0 py-10 flex items-center justify-center">
          <div className="flex items-center gap-6 h-full">
            {/* Team Containers */}
            <div className="grid grid-cols-2 gap-8 h-full" style={{ width: '70vw' }}>
              {/* Left Team */}
              <div className="rounded-3xl overflow-hidden flex flex-col h-full border-4 border-green-300">
                <div className="bg-green-400 text-black text-3xl font-extrabold py-3 text-center">
                  {team0?.name || 'Team 1'}
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden px-2 bg-white">
                  <div className="font-extrabold leading-none text-green-400" style={{ fontSize: 'min(30vh, 28vw)' }}>
                    {team0 ? getTeamTotalScore(team0.id) : 0}
                  </div>
                </div>
                {isOwner && (
                  <div className="bg-white py-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => updateScore(0, 1)}
                      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold flex items-center justify-center"
                      aria-label="Add 1 point"
                    >
                      <IoAdd className="text-gray-900 text-xl" />
                    </button>
                    <button
                      onClick={() => updateScore(0, -1)}
                      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold flex items-center justify-center"
                      aria-label="Subtract 1 point"
                    >
                      <IoRemove className="text-gray-900 text-xl" />
                    </button>
                    <button
                      onClick={() => {/* edit left team - logic to be added */}}
                      className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"
                      aria-label="Edit team"
                      title="Edit"
                    >
                      <HiPencil className="text-gray-500 text-xl" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Team */}
              <div className="rounded-3xl overflow-hidden flex flex-col h-full border-4 border-orange-300">
                <div className="bg-orange-500 text-black text-3xl font-extrabold py-3 text-center">
                  {team1?.name || 'Team 2'}
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden px-2 bg-white">
                  <div className="font-extrabold leading-none text-orange-500" style={{ fontSize: 'min(30vh, 28vw)' }}>
                    {team1 ? getTeamTotalScore(team1.id) : 0}
                  </div>
                </div>
                {isOwner && (
                  <div className="bg-white py-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => updateScore(1, 1)}
                      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold flex items-center justify-center"
                      aria-label="Add 1 point"
                    >
                      <IoAdd className="text-gray-900 text-xl" />
                    </button>
                    <button
                      onClick={() => updateScore(1, -1)}
                      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold flex items-center justify-center"
                      aria-label="Subtract 1 point"
                    >
                      <IoRemove className="text-gray-900 text-xl" />
                    </button>
                    <button
                      onClick={() => {/* edit right team - logic to be added */}}
                      className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"
                      aria-label="Edit team"
                      title="Edit"
                    >
                      <HiPencil className="text-gray-500 text-xl" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Timer and Quarter Control Only */}
        <div
          className="flex flex-shrink-0 bg-gray-100 p-4 text-gray-900"
          style={{ height: '20vh' }}
        >
          {/* Timer with integrated quarter controls */}
          <div className="flex-1 rounded-2xl p-3 flex flex-row items-stretch gap-6 min-w-0">
            <Timer
              duration={scoreboard?.timer_duration || 0}
              startedAt={scoreboard?.timer_started_at || null}
              state={scoreboard?.timer_state || 'stopped'}
              pausedDuration={scoreboard?.timer_paused_duration || 0}
              isOwner={isOwner}
              onStart={handleTimerStart}
              onPause={handleTimerPause}
              onReset={handleTimerReset}
              currentQuarter={scoreboard?.current_quarter || 1}
              onQuarterChange={updateQuarter}
              className="w-full h-full"
            />
          </div>
          {/* The original Quarter History and Share sections are commented out for now */}
          {/*
          <div className="flex-1 border-4 border-white rounded-2xl p-3 flex flex-col min-w-0"> ... </div>
          <div className="flex-1 border-4 border-white rounded-2xl p-3 flex flex-col min-w-0"> ... </div>
          */}
        </div>
      </div>
    </div>
  )
}

