import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ScoreboardCard } from '../components/ScoreboardCard'
import { CreateScoreboardCTA, JoinScoreboardCTA } from '../components/cta/'
import { AppNav } from '../components/AppNav'
import { UserMenu } from '../components/UserMenu'
import { AlertDialog, ScoreboardFormDialog, ConfirmDialog } from '../components/dialog'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { sortTeams } from '../utils/teamUtils'
import { useAlertDialog, useConfirmDialog } from '../hooks/dialog'
import { useSubscription } from '../hooks/useSubscription'
import { getByOwner, remove as removeScoreboard } from '../data/scoreboardsRepo'
import { getByTeamIds } from '../data/quartersRepo'
import { getScoreboardLimit, getScoreboardLimitDescription } from '../utils/subscriptionLimits'

interface Team {
  id: string
  name: string
  scoreboard_id: string
  position: 'home' | 'away' | null
  color: string | null
  created_at: string
}

interface Scoreboard {
  id: string
  owner_id: string
  share_code: string | null
  current_quarter: number
  timer: string
  venue: string | null
  game_date: string | null
  game_start_time: string | null
  game_end_time: string | null
  created_at: string
  teams: Team[]
}

export const Dashboard: React.FC = () => {
  const [scoreboards, setScoreboards] = useState<Scoreboard[]>([])
  const [scoresByScoreboard, setScoresByScoreboard] = useState<Record<string, { a: number; b: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingScoreboard, setEditingScoreboard] = useState<Scoreboard | null>(null)
  const { user } = useAuth()
  const { subscription } = useSubscription()
  
  // Custom hooks
  const { alert, showError, hideAlert } = useAlertDialog()
  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useConfirmDialog()

  useEffect(() => {
    fetchScoreboards()
  }, [])

  const fetchScoreboards = async () => {
    if (!user) return

    try {
      const list = await getByOwner(user.id)
      const normalized = list.map((scoreboard) => ({
        ...scoreboard,
        venue: scoreboard.venue ?? null,
        game_date: scoreboard.game_date ?? null,
        game_start_time: scoreboard.game_start_time ?? null,
        game_end_time: scoreboard.game_end_time ?? null,
        teams: scoreboard.teams ? sortTeams(scoreboard.teams) : [],
      }))

      setScoreboards(normalized)
      await computeAndSetScores(normalized)
    } catch (error) {
      console.error('Error fetching scoreboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const computeAndSetScores = async (list: Scoreboard[]) => {
    const allTeams = list.flatMap((sb) => sb.teams)
    if (allTeams.length === 0) {
      setScoresByScoreboard({})
      return
    }
    const teamIdToScoreboard: Record<string, { scoreboardId: string; index: number }> = {}
    for (const sb of list) {
      sb.teams.slice(0, 2).forEach((t, idx) => {
        teamIdToScoreboard[t.id] = { scoreboardId: sb.id, index: idx }
      })
    }

    const teamIds = Object.keys(teamIdToScoreboard)
    if (teamIds.length === 0) return

    const quarters = await getByTeamIds(teamIds)

    const next: Record<string, { a: number; b: number }> = {}
    for (const sb of list) {
      next[sb.id] = { a: 0, b: 0 }
    }

    // Calculate cumulative scores across all quarters
    (quarters || []).forEach((q) => {
      const map = teamIdToScoreboard[q.team_id]
      if (!map) return
      const entry = next[map.scoreboardId]
      if (!entry) return
      if (map.index === 0) entry.a += q.points || 0
      if (map.index === 1) entry.b += q.points || 0
    })

    setScoresByScoreboard(next)
  }

  const handleCreateSuccess = async () => {
    // Refresh the scoreboards list after creation
    await fetchScoreboards()
    setShowCreateForm(false)
  }

  const handleCreateClick = () => {
    const planTier = subscription?.plan_tier || 'basic'
    const limit = getScoreboardLimit(planTier)
    
    // Check if user has reached their limit
    if (scoreboards.length >= limit && limit !== Infinity) {
      const planName = planTier.charAt(0).toUpperCase() + planTier.slice(1)
      showError(
        'Scoreboard Limit Reached',
        `You've reached your ${planName} plan limit of ${limit} scoreboards. ` +
        `Please delete an existing scoreboard or upgrade your plan to create more.`
      )
      return
    }
    
    setShowCreateForm(true)
  }

  const handleUpdateSuccess = async () => {
    // Refresh the scoreboards list after update
    await fetchScoreboards()
    setShowEditForm(false)
    setEditingScoreboard(null)
      }

  const handleFormError = (error: string) => {
    showError('Error', error)
  }

  const editScoreboard = async (scoreboardId: string) => {
    const scoreboard = scoreboards.find(sb => sb.id === scoreboardId)
    if (!scoreboard || scoreboard.teams.length < 2) return
    
    setEditingScoreboard(scoreboard)
    setShowEditForm(true)
  }

  const deleteScoreboard = (scoreboardId: string) => {
    showConfirmDialog(
      'Delete Scoreboard',
      'Are you sure you want to delete this scoreboard? This action cannot be undone.',
      scoreboardId
    )
  }

  const performDelete = async (scoreboardId: string) => {
    try {
      // Delete scoreboard (this will cascade delete teams and quarters due to foreign key constraints)
      await removeScoreboard(scoreboardId, user!.id) // Ensure user can only delete their own scoreboards

      // Remove from local state
      const updatedScoreboards = scoreboards.filter(sb => sb.id !== scoreboardId)
      setScoreboards(updatedScoreboards)
      
      // Remove from scores state
      const updatedScores = { ...scoresByScoreboard }
      delete updatedScores[scoreboardId]
      setScoresByScoreboard(updatedScores)

      console.log('Scoreboard deleted successfully')
    } catch (error) {
      console.error('Error deleting scoreboard:', error)
      showError('Error', 'Failed to delete scoreboard. Please try again.')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav rightContent={<UserMenu />} />

      <AlertDialog
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={hideAlert}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (confirmDialog.scoreboardId) {
            hideConfirmDialog()
            await performDelete(confirmDialog.scoreboardId)
          }
        }}
        onCancel={hideConfirmDialog}
      />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-4 lg:grid-cols-2 mb-10">
            <CreateScoreboardCTA onCreateClick={handleCreateClick} />
            <JoinScoreboardCTA />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Scoreboards</h2>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{scoreboards.length}</span>
              {' / '}
              <span>{getScoreboardLimitDescription(subscription?.plan_tier || 'basic')}</span>
            </div>
          </div>

          {showCreateForm && (
            <ScoreboardFormDialog
              mode="create"
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
              onError={handleFormError}
            />
          )}

          {showEditForm && editingScoreboard && (
            <ScoreboardFormDialog
              mode="edit"
              scoreboardId={editingScoreboard.id}
              initialData={{
                teamAName: editingScoreboard.teams[0]?.name || '',
                teamBName: editingScoreboard.teams[1]?.name || '',
                teamAColor: editingScoreboard.teams[0]?.color || '#ef4444',
                teamBColor: editingScoreboard.teams[1]?.color || '#3b82f6',
                venue: editingScoreboard.venue || '',
                gameDate: editingScoreboard.game_date || '',
                gameStartTime: editingScoreboard.game_start_time || '',
                gameEndTime: editingScoreboard.game_end_time || '',
              }}
              onSuccess={handleUpdateSuccess}
              onCancel={() => {
                setShowEditForm(false)
                setEditingScoreboard(null)
              }}
              onError={handleFormError}
            />
          )}

          {scoreboards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No scoreboards yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {scoreboards.map((scoreboard) => (
                <ScoreboardCard
                  key={scoreboard.id}
                  scoreboard={scoreboard}
                  score={scoresByScoreboard[scoreboard.id] || { a: 0, b: 0 }}
                  onDelete={deleteScoreboard}
                  onEdit={editScoreboard}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

