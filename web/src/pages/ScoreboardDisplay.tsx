import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaExpand } from 'react-icons/fa'
import { HiClock } from 'react-icons/hi'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useCurrentQuarterData } from '../hooks/useCurrentQuarterData'
import { useAuth } from '../contexts/AuthContext'
import { TeamScore } from '../components/TeamScore'
import { AppNav } from '../components/AppNav'
import { Button } from '../components/button'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Timer } from '../components/Timer'
import { BrandingLogo } from '../components/BrandingLogo'
import { QuarterHistoryDialog } from '../components/dialog'

export const ScoreboardDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [quarterHistoryOpen, setQuarterHistoryOpen] = useState(false)
  
  const { scoreboard, allQuarters, loading, error } = useScoreboardData({
    scoreboardId: id
  })

  // Custom hooks
  const { getTeamTotalScore } = useTeamTotalScore(allQuarters)
  const { quarters } = useCurrentQuarterData(
    scoreboard,
    scoreboard?.current_quarter || 1
  )

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
  
  // Calculate scores for meta tags
  const score0 = team0 ? getTeamTotalScore(team0.id) : 0
  const score1 = team1 ? getTeamTotalScore(team1.id) : 0
  const team0Name = team0?.name || 'Team 1'
  const team1Name = team1?.name || 'Team 2'
  
  const title = `${team0Name} vs ${team1Name} - Live Scoreboard`
  const description = `Live score: ${team0Name} ${score0} - ${score1} ${team1Name} on Pretty Scoreboard`
  const imageUrl = id ? `${window.location.origin}/.netlify/functions/og-image?id=${id}` : ''
  const pageUrl = id ? `${window.location.origin}/scoreboard/${id}/view` : ''

  // Set meta tags dynamically (for platforms that execute JavaScript)
  useEffect(() => {
    if (!id) return
    
    // Update or create meta tags
    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) || 
                    document.querySelector(`meta[name="${property}"]`)
      if (!element) {
        element = document.createElement('meta')
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property)
        } else {
          element.setAttribute('name', property)
        }
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }
    
    // Set title
    document.title = title
    
    // Set Open Graph tags
    setMetaTag('og:title', title)
    setMetaTag('og:description', description)
    setMetaTag('og:image', imageUrl)
    setMetaTag('og:url', pageUrl)
    setMetaTag('og:type', 'website')
    setMetaTag('og:site_name', 'Pretty Scoreboard')
    
    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', imageUrl)
    
    // Set standard meta tags
    setMetaTag('description', description)
  }, [id, title, description, imageUrl, pageUrl])

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col relative">
      {/* Navbar - Hidden in fullscreen */}
      {!isFullscreen && (
        <AppNav 
          rightContent={
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setQuarterHistoryOpen(true)}
                variant="secondary"
                size="sm"
              >
                <HiClock className="mr-2" />
                History
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="primary"
                size="sm"
              >
                <FaExpand className="inline mr-2" />
                Fullscreen
              </Button>
            </div>
          }
        />
      )}

      {/* Quarter History Dialog */}
      <QuarterHistoryDialog
        isOpen={quarterHistoryOpen}
        teams={scoreboard?.teams || []}
        allQuarters={allQuarters}
        currentQuarter={currentQuarter}
        quarters={quarters}
        onClose={() => setQuarterHistoryOpen(false)}
      />

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
        <div className="absolute bottom-6 right-6 z-10">
          <BrandingLogo
            variant="default"
            borderColor="black"
            onClick={() => navigate(user ? '/dashboard' : '/')}
          />
        </div>
      )}
    </div>
  )
}

