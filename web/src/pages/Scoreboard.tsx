import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { TeamScore } from '../components/TeamScore'
import { AppNav } from '../components/AppNav'
import { Button } from '../components/Button'
import { HiX, HiPencil } from 'react-icons/hi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Timer } from '../components/Timer'
import { Alert } from '../components/Alert'
import { ScoreboardForm } from '../components/ScoreboardForm'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useAlert } from '../hooks/useAlert'
import { useCurrentQuarterData } from '../hooks/useCurrentQuarterData'
import { useShareCode } from '../hooks/useShareCode'
import { useTimerControls } from '../hooks/useTimerControls'
import { useScoreUpdate } from '../hooks/useScoreUpdate'
import { sortTeams } from '../utils/teamUtils'

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
  const { alert, showError, hideAlert } = useAlert()
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
      const { data: updatedScoreboard, error: fetchError } = await supabase
        .from('scoreboards')
        .select(`
          *,
          teams (*)
        `)
        .eq('id', id)
        .single()

      if (!fetchError && updatedScoreboard) {
        if (updatedScoreboard.teams) {
          updatedScoreboard.teams = sortTeams(updatedScoreboard.teams)
        }
        setScoreboard(updatedScoreboard)
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
                      onClick={handleGenerateShareCodeWithError}
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
        onClose={hideAlert}
      />

      {/* Edit Form */}
      {showEditForm && scoreboard && (
        <ScoreboardForm
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

