import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TeamScore } from '../components/TeamScore'
import { AppNav } from '../components/AppNav'
import { Button } from '../components/button'
import { HiPencil, HiClock, HiEye, HiMenu, HiX, HiShare } from 'react-icons/hi'
import { useAuth } from '../contexts/AuthContext'
import { Timer } from '../components/Timer'
import { AlertDialog, ScoreboardFormDialog, ShareDialog, QuarterHistoryDialog } from '../components/dialog'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useAlertDialog } from '../hooks/dialog'
import { useCurrentQuarterData } from '../hooks/useCurrentQuarterData'
import { useShareCode } from '../hooks/useShareCode'
import { useTimerControls } from '../hooks/useTimerControls'
import { useScoreUpdate } from '../hooks/useScoreUpdate'
import { useMetaTags } from '../hooks/useMetaTags'
import { generateScoreboardMetaTags } from '../utils/scoreboardHelpers'
import { sortTeams } from '../utils/teamUtils'
import { getByIdWithTeams, update as updateScoreboard } from '../data/scoreboardsRepo'
import { getByTeamIdsAndQuarter } from '../data/quartersRepo'

export const ScoreboardController: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [quarterHistoryOpen, setQuarterHistoryOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const { scoreboard, allQuarters, loading, error, isOwner, setScoreboard, setAllQuarters } = useScoreboardData({
    scoreboardId: id,
    userId: user?.id
  })

  // Custom hooks
  const { alert, showError, hideAlert } = useAlertDialog()
  const { getTeamTotalScore } = useTeamTotalScore(allQuarters)
  const { quarters, setQuarters, getTeamScore } = useCurrentQuarterData(
    scoreboard,
    scoreboard?.current_quarter || 1
  )
  const { showCopied, isGeneratingShareCode, handleCopyShareCode, handleGenerateShareCode } = useShareCode(
    scoreboard,
    isOwner,
    setScoreboard
  )
  const { handleTimerStart, handleTimerPause, handleTimerReset } = useTimerControls(
    scoreboard,
    isOwner,
    id,
    setScoreboard
  )
  const { updateScore } = useScoreUpdate(
    scoreboard,
    isOwner,
    quarters,
    setQuarters,
    setAllQuarters,
    getTeamScore
  )


  const handleViewPublic = useCallback(() => {
    if (!id) return
    navigate(`/scoreboard/${id}/view`)
  }, [id, navigate])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [menuOpen])

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [menuOpen])

  const handleMenuAction = (action: () => void) => {
    action()
    setMenuOpen(false)
  }

  // Wrapper for handleGenerateShareCode to handle errors
  const handleGenerateShareCodeWithError = useCallback(async () => {
    try {
      await handleGenerateShareCode()
    } catch (error) {
      showError('Error', 'Could not generate a share code. Please try again later.')
    }
  }, [handleGenerateShareCode, showError])

  const handleUpdateSuccess = async () => {
    // Refresh the scoreboard data after update
    if (id) {
      const updatedScoreboard = await getByIdWithTeams(id)
      if (updatedScoreboard) {
        const teams = updatedScoreboard.teams ? sortTeams(updatedScoreboard.teams) : []
        const normalized = {
          ...(updatedScoreboard as any),
          venue: updatedScoreboard.venue ?? null,
          game_date: updatedScoreboard.game_date ?? null,
          game_start_time: updatedScoreboard.game_start_time ?? null,
          game_end_time: updatedScoreboard.game_end_time ?? null,
          teams,
        }
        setScoreboard(normalized)
      }
    }
    setShowEditForm(false)
  }

  const handleFormError = (error: string) => {
    showError('Error', error)
  }

  const updateQuarter = async (delta: number) => {
    if (!scoreboard || !isOwner) return

    const newQuarter = Math.max(1, Math.min(4, scoreboard.current_quarter + delta))

    try {
      if (!id) return
      await updateScoreboard(id, { current_quarter: newQuarter })

      // Update local scoreboard state with new quarter
      setScoreboard(prev => prev ? { ...prev, current_quarter: newQuarter } : null)

      // Refresh quarters for the new quarter
      if (scoreboard?.teams && scoreboard.teams.length > 0) {
        const teamIds = scoreboard.teams.map(team => team.id)
        const quartersData = await getByTeamIdsAndQuarter(teamIds, newQuarter)
        setQuarters(quartersData || [])
      }
    } catch (error) {
      console.error('Error updating quarter:', error)
    }
  }

  // Calculate team data and scores for meta tags
  // These hooks must be called before any early returns
  const team0 = scoreboard?.teams?.[0]
  const team1 = scoreboard?.teams?.[1]
  
  const teamData = useMemo(() => {
    if (!scoreboard) return null

    const score0 = team0 ? getTeamTotalScore(team0.id) : 0
    const score1 = team1 ? getTeamTotalScore(team1.id) : 0

    return {
      team0: {
        name: team0?.name || 'Team 1',
        score: score0,
      },
      team1: {
        name: team1?.name || 'Team 2',
        score: score1,
      },
    }
  }, [scoreboard, team0, team1, getTeamTotalScore])

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

  // Early returns after all hooks
  if (loading) {
    return <LoadingSpinner />
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
  
  const publicViewUrl = id ? `${window.location.origin}/scoreboard/${id}/view` : ''

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <AppNav
        rightContent={
          <div className="relative" ref={menuRef}>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <HiX className="w-5 h-5" />
              ) : (
                <HiMenu className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-md shadow-lg bg-white border border-gray-200 sm:hidden">
                <div className="py-2">
                  {isOwner && (
                    <button
                      onClick={() => handleMenuAction(() => setShowEditForm(true))}
                      className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <HiPencil className="mr-3 w-5 h-5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleMenuAction(() => setQuarterHistoryOpen(true))}
                    className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HiClock className="mr-3 w-5 h-5" />
                    History
                  </button>
                  <button
                    onClick={() => handleMenuAction(() => setShareOpen(true))}
                    className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HiShare className="mr-3 w-5 h-5" />
                    Share
                  </button>
                  <button
                    onClick={() => handleMenuAction(handleViewPublic)}
                    className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HiEye className="mr-3 w-5 h-5" />
                    View Public
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {isOwner && (
                <Button
                  onClick={() => setShowEditForm(true)}
                  variant="secondary"
                  size="sm"
                >
                  <HiPencil className="mr-2" />
                  Edit
                </Button>
              )}
              <Button
                onClick={() => setQuarterHistoryOpen(true)}
                variant="secondary"
                size="sm"
              >
                <HiClock className="mr-2" />
                History
              </Button>
              <Button
                onClick={() => setShareOpen(true)}
                variant="primary"
                size="sm"
              >
                <HiShare className="mr-2" />
                Share
              </Button>
              <Button
                onClick={handleViewPublic}
                variant="primary"
                size="sm"
              >
                <HiEye className="w-5 h-5" />
              </Button>
            </div>
          </div>
        }
      />

      {/* Quarter History Dialog */}
      <QuarterHistoryDialog
        isOpen={quarterHistoryOpen}
        teams={scoreboard?.teams || []}
        allQuarters={allQuarters}
        currentQuarter={scoreboard?.current_quarter || 1}
        quarters={quarters}
        onClose={() => setQuarterHistoryOpen(false)}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareOpen}
        shareCode={scoreboard?.share_code || null}
        publicViewUrl={publicViewUrl}
        isOwner={isOwner}
        showCopied={showCopied}
        isGeneratingShareCode={isGeneratingShareCode}
        teams={scoreboard?.teams || []}
        allQuarters={allQuarters}
        currentQuarter={scoreboard?.current_quarter || 1}
        gameDate={scoreboard?.game_date || null}
        venue={scoreboard?.venue || null}
        onClose={() => setShareOpen(false)}
        onCopyShareCode={handleCopyShareCode}
        onGenerateShareCode={handleGenerateShareCodeWithError}
      />
      <AlertDialog
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={hideAlert}
      />

      {/* Edit Form */}
      {showEditForm && scoreboard && (
        <ScoreboardFormDialog
          mode="edit"
          scoreboardId={scoreboard.id}
          initialData={{
            teamAName: scoreboard.teams[0]?.name || '',
            teamBName: scoreboard.teams[1]?.name || '',
            teamAColor: scoreboard.teams[0]?.color || '#ef4444',
            teamBColor: scoreboard.teams[1]?.color || '#3b82f6',
            venue: scoreboard.venue || '',
            gameDate: scoreboard.game_date || '',
            gameStartTime: scoreboard.game_start_time || '',
            gameEndTime: scoreboard.game_end_time || '',
            timerDurationMinutes: scoreboard.timer_duration ? Math.round(scoreboard.timer_duration / 60) : 12,
          }}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setShowEditForm(false)}
          onError={handleFormError}
        />
      )}
      
      {/* Back handled via navbar logo button */}

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section: Score Container */}
        <div className="flex-1 min-h-0 py-4 md:py-10 flex items-center justify-center">
          <div className="flex items-center justify-center h-full w-full px-4 md:px-6 lg:px-8">
            {/* Team Containers - Stack on mobile portrait, side-by-side on landscape/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-full w-full max-w-[95vw] md:max-w-[70vw]">
              {/* Left Team */}
              <TeamScore
                teamName={team0?.name || 'Team 1'}
                score={team0 ? getTeamTotalScore(team0.id) : 0}
                color={team0?.color || null}
                isOwner={isOwner}
                onScoreUpdate={(delta) => updateScore(0, delta)}
              />

              {/* Right Team */}
              <TeamScore
                teamName={team1?.name || 'Team 2'}
                score={team1 ? getTeamTotalScore(team1.id) : 0}
                color={team1?.color || null}
                isOwner={isOwner}
                onScoreUpdate={(delta) => updateScore(1, delta)}
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
              isOwner={isOwner}
              onStart={handleTimerStart}
              onPause={handleTimerPause}
              onReset={handleTimerReset}
              currentQuarter={scoreboard?.current_quarter || 1}
              onQuarterChange={updateQuarter}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

