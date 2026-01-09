import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaExpand } from 'react-icons/fa'
import { HiClock } from 'react-icons/hi'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useCurrentQuarterData } from '../hooks/useCurrentQuarterData'
import { useFullscreen } from '../hooks/useFullscreen'
import { useMetaTags } from '../hooks/useMetaTags'
import { useAuth } from '../contexts/AuthContext'
import { generateScoreboardMetaTags } from '../utils/scoreboardHelpers'
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
  const [quarterHistoryOpen, setQuarterHistoryOpen] = useState(false)

  // Fetch scoreboard data
  const { scoreboard, allQuarters, loading, error } = useScoreboardData({
    scoreboardId: id,
  })

  // Custom hooks
  const { getTeamTotalScore } = useTeamTotalScore(allQuarters)
  const { quarters } = useCurrentQuarterData(scoreboard, scoreboard?.current_quarter || 1)
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  // Calculate team data and scores
  const teamData = useMemo(() => {
    if (!scoreboard) return null

    const team0 = scoreboard.teams?.[0]
    const team1 = scoreboard.teams?.[1]
    const score0 = team0 ? getTeamTotalScore(team0.id) : 0
    const score1 = team1 ? getTeamTotalScore(team1.id) : 0

    return {
      team0: {
        name: team0?.name || 'Team 1',
        score: score0,
        color: team0?.color || null,
      },
      team1: {
        name: team1?.name || 'Team 2',
        score: score1,
        color: team1?.color || null,
      },
      currentQuarter: scoreboard.current_quarter || 1,
    }
  }, [scoreboard, getTeamTotalScore])

  // Generate meta tags data
  const metaTagsData = useMemo(() => {
    if (!teamData || !id) return null

    return generateScoreboardMetaTags(
      teamData.team0.name,
      teamData.team1.name,
      teamData.team0.score,
      teamData.team1.score,
      id
    )
  }, [teamData, id])

  // Set meta tags
  useMetaTags(metaTagsData)

  // Early returns AFTER all hooks
  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !scoreboard || !teamData) {
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
              <Button onClick={toggleFullscreen} variant="primary" size="sm">
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
        teams={scoreboard.teams || []}
        allQuarters={allQuarters}
        currentQuarter={teamData.currentQuarter}
        quarters={quarters}
        onClose={() => setQuarterHistoryOpen(false)}
      />

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col py-10 px-20 min-h-0">
        <div className="flex-1 flex items-stretch min-h-0">
          <div className="grid grid-cols-2 gap-8 w-full">
            <TeamScore
              teamName={teamData.team0.name}
              score={teamData.team0.score}
              color={teamData.team0.color}
            />
            <TeamScore
              teamName={teamData.team1.name}
              score={teamData.team1.score}
              color={teamData.team1.color}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Timer */}
      <div className="flex flex-shrink-0 bg-gray-100 p-4 text-gray-900" style={{ height: '20vh' }}>
        <div className="flex-1 rounded-2xl p-3 flex flex-row items-stretch gap-6 min-w-0">
          <Timer
            duration={scoreboard.timer_duration || 0}
            startedAt={scoreboard.timer_started_at || null}
            state={scoreboard.timer_state || 'stopped'}
            pausedDuration={scoreboard.timer_paused_duration || 0}
            isOwner={false}
            onStart={() => {}}
            onPause={() => {}}
            onReset={() => {}}
            currentQuarter={teamData.currentQuarter}
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

