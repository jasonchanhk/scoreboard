import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaBasketballBall, FaExpand } from 'react-icons/fa'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useAuth } from '../contexts/AuthContext'
import { TeamScore } from '../components/TeamScore'
import { AppNav } from '../components/AppNav'
import { Button } from '../components/button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Timer } from '../components/Timer'

export const PublicView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const { scoreboard, allQuarters, loading, error } = useScoreboardData({
    scoreboardId: id
  })

  // Custom hooks
  const { getTeamTotalScore } = useTeamTotalScore(allQuarters)

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err)
      })
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])


  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !scoreboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-gray-900 text-xl mb-4">{error || 'Scoreboard not found'}</div>
          <div className="text-gray-500 text-sm">
            This scoreboard may not be shared or the share code is invalid.
          </div>
        </div>
      </div>
    )
  }

  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  const currentQuarter = scoreboard.current_quarter || 1

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col relative">
      {/* Navbar - Hidden in fullscreen */}
      {!isFullscreen && (
        <AppNav 
          rightContent={
            <Button
              onClick={toggleFullscreen}
              variant="primary"
              size="sm"
            >
              <FaExpand className="inline mr-2" />
              Fullscreen
            </Button>
          }
        />
      )}

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col py-10 px-20 min-h-0">
        {/* Top Section: Team Names and Scores - Dynamic height */}
        <div className="flex-1 flex items-stretch min-h-0">
          <div className="grid grid-cols-2 gap-8 w-full">
            {/* Left Team */}
            <TeamScore
              teamName={team0?.name || 'Team 1'}
              score={team0 ? getTeamTotalScore(team0.id) : 0}
              color={team0?.color || null}
            />

            {/* Right Team */}
            <TeamScore
              teamName={team1?.name || 'Team 2'}
              score={team1 ? getTeamTotalScore(team1.id) : 0}
              color={team1?.color || null}
            />
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
            isOwner={false}
            onStart={() => {}}
            onPause={() => {}}
            onReset={() => {}}
            currentQuarter={currentQuarter}
            onQuarterChange={() => {}}
            className="w-full h-full"
          />
        </div>
      </div>
        
      {/* Branding - Bottom Right Corner - Only shown in fullscreen */}
      {isFullscreen && (
        <div
          onClick={() => navigate(user ? '/dashboard' : '/')}
          className="absolute bottom-6 right-6 z-10 cursor-pointer"
        >
          <div className="flex items-center space-x-2 bg-white border border-black rounded-lg px-3 py-2">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full flex-shrink-0">
              <FaBasketballBall className="text-white text-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-900 leading-tight">Powered by</span>
              <span className="text-sm font-bold text-gray-900">Pretty Scoreboard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

