import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// import { Timer } from './Timer'
// import { ScoreboardHeader } from './ScoreboardHeader'
// import { ScoreboardDisplay } from './ScoreboardDisplay'
// import { QuarterHistory } from './QuarterHistory'
import { useScoreboardData } from '../hooks/useScoreboardData'

export const PublicView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { scoreboard, allQuarters, loading, error } = useScoreboardData({
    scoreboardId: id
  })

  // Timer state for displaying time
  const [timeRemaining, setTimeRemaining] = useState(scoreboard?.timer_duration || 0)

  // Calculate remaining time based on current state
  const calculateRemainingTime = useCallback(() => {
    if (!scoreboard) return 0
    
    const { timer_state, timer_started_at, timer_duration, timer_paused_duration } = scoreboard
    
    if (timer_state === 'stopped' || !timer_started_at) {
      return timer_duration || 0
    }

    if (timer_state === 'paused') {
      const elapsed = timer_paused_duration || 0
      return Math.max(0, (timer_duration || 0) - elapsed)
    }

    if (timer_state === 'running') {
      const now = new Date().getTime()
      const startTime = new Date(timer_started_at).getTime()
      const elapsedSinceCurrentStart = Math.floor((now - startTime) / 1000)
      const totalElapsed = (timer_paused_duration || 0) + elapsedSinceCurrentStart
      return Math.max(0, (timer_duration || 0) - totalElapsed)
    }

    return timer_duration || 0
  }, [scoreboard])

  // Update timer display
  useEffect(() => {
    if (!scoreboard) return
    
    const updateTimer = () => {
      const remaining = calculateRemainingTime()
      setTimeRemaining(remaining)
    }

    // Initialize timer when scoreboard changes
    const initialTime = calculateRemainingTime()
    setTimeRemaining(initialTime)

    if (scoreboard.timer_state === 'running') {
      const interval = setInterval(updateTimer, 100)
      return () => clearInterval(interval)
    }
  }, [scoreboard, calculateRemainingTime])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
          <div className="text-gray-400 text-sm">
            This scoreboard may not be shared or the share code is invalid.
          </div>
        </div>
      </div>
    )
  }

  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  const displayTime = timeRemaining <= 0 ? '00:00' : formatTime(timeRemaining)
  const currentQuarter = scoreboard.current_quarter || 1

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      {/* Back Button - Top Left Corner */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center"
        aria-label="Back to Dashboard"
      >
        ←
      </button>

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col justify-center py-10 px-20">
        <div className="w-full h-[70vh]">
          {/* Top Section: Team Names and Scores */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left Team */}
            <div className="border-4 border-white rounded-2xl p-4 flex flex-col h-full">
              <div className="text-3xl font-bold mb-4 pb-4 border-b-4 border-white text-center">
                {team0?.name || 'Team 1'}
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                <div className="font-bold leading-none" style={{ fontSize: 'min(50vh, 45vw)' }}>
                  {team0 ? getTeamTotalScore(team0.id) : 0}
                </div>
              </div>
            </div>

            {/* Right Team */}
            <div className="border-4 border-white rounded-2xl p-4 flex flex-col h-full">
              <div className="text-3xl font-bold mb-4 pb-4 border-b-4 border-white text-center">
                {team1?.name || 'Team 2'}
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                <div className="font-bold leading-none" style={{ fontSize: 'min(50vh, 45vw)' }}>
                  {team1 ? getTeamTotalScore(team1.id) : 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Quarter and Time Widget */}
        <div className="flex justify-center mt-8">
          <div className="border-4 border-white rounded-lg px-4 py-3 flex items-center">
            {/* Quarter Display */}
            <div className="px-4">
              <div className="text-6xl font-bold">Q{currentQuarter}</div>
            </div>
            
            {/* Divider Line */}
            <div className="h-16 border-l-4 border-white mx-4"></div>
            
            {/* Time Display */}
            <div className="px-4">
              <div className="text-6xl font-mono font-bold">{displayTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Commented out sections */}
      {/* 
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Quarter History */}
        {/* <div className="mt-8 text-center">
          <QuarterHistory
            teams={scoreboard?.teams || []}
            allQuarters={allQuarters}
            currentQuarter={scoreboard?.current_quarter || 1}
          />
        </div> */}
      {/* </div> */}
    </div>
  )
}
