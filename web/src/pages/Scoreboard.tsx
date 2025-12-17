import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TeamScore } from '../components/TeamScore'
import { AppNav } from '../components/AppNav'
import { Button } from '../components/button'
import { HiPencil } from 'react-icons/hi'
import { useAuth } from '../contexts/AuthContext'
import { Timer } from '../components/Timer'
import { AlertDialog, ScoreboardFormDialog, ShareDialog } from '../components/dialog'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useAlertDialog } from '../hooks/dialog'
import { useCurrentQuarterData } from '../hooks/useCurrentQuarterData'
import { useShareCode } from '../hooks/useShareCode'
import { useTimerControls } from '../hooks/useTimerControls'
import { useScoreUpdate } from '../hooks/useScoreUpdate'
import { sortTeams } from '../utils/teamUtils'
import { getByIdWithTeams, update as updateScoreboard } from '../data/scoreboardsRepo'
import { getByTeamIdsAndQuarter } from '../data/quartersRepo'

export const Scoreboard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  
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

  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  
  const publicViewUrl = id ? `${window.location.origin}/scoreboard/${id}/view` : ''

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <AppNav
        rightContent={
              <div className="flex items-center space-x-3">
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
                onClick={() => setShareOpen(true)}
                variant="primary"
                size="sm"
              >
                Share
              </Button>
            </div>
        }
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareOpen}
        shareCode={scoreboard?.share_code || null}
        publicViewUrl={publicViewUrl}
        isOwner={isOwner}
        showCopied={showCopied}
        isGeneratingShareCode={isGeneratingShareCode}
        onClose={() => setShareOpen(false)}
        onCopyShareCode={handleCopyShareCode}
        onGenerateShareCode={handleGenerateShareCodeWithError}
        onViewPublic={handleViewPublic}
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
        <div className="flex-1 min-h-0 py-10 flex items-center justify-center">
          <div className="flex items-center gap-6 h-full">
            {/* Team Containers */}
            <div className="grid grid-cols-2 gap-8 h-full" style={{ width: '70vw' }}>
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

