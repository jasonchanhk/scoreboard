import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ScoreboardForm } from '../components/ScoreboardForm'
import { ScoreboardCard } from '../components/ScoreboardCard'
import { CreateScoreboardCTA } from '../components/CreateScoreboardCTA'
import { JoinScoreboardCTA } from '../components/JoinScoreboardCTA'
import { DashboardNav } from '../components/DashboardNav'

interface Team {
  id: string
  name: string
  scoreboard_id: string
  position: 'home' | 'away'
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
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchScoreboards()
  }, [])

  const fetchScoreboards = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('scoreboards')
        .select(`
          *,
          teams (*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      const list = data || []
      
      // Ensure teams are ordered consistently (home first, away second)
      list.forEach(scoreboard => {
        if (scoreboard.teams) {
          scoreboard.teams.sort((a: Team, b: Team) => {
            if (a.position === 'home' && b.position === 'away') return -1
            if (a.position === 'away' && b.position === 'home') return 1
            return 0
          })
        }
      })

      setScoreboards(list)
      await computeAndSetScores(list)
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

    const { data: quarters, error } = await supabase
      .from('quarters')
      .select('team_id, quarter_number, points')
      .in('team_id', teamIds)

    if (error) {
      console.error('Error fetching quarters for dashboard:', error)
      return
    }

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

  const createScoreboard = async (formData: {
    teamAName: string
    teamBName: string
    venue: string
    gameDate: string
    gameStartTime: string
    gameEndTime: string
  }) => {
    if (!user) return

    setCreating(true)
    try {
      // First create the scoreboard
      const { data: scoreboardData, error: scoreboardError } = await supabase
        .from('scoreboards')
        .insert({
          owner_id: user.id,
          timer_duration: 720, // Default 12 minutes
          timer_state: 'stopped',
          timer_paused_duration: 0,
          venue: formData.venue || null,
          game_date: formData.gameDate || null,
          game_start_time: formData.gameStartTime || null,
          game_end_time: formData.gameEndTime || null,
        })
        .select()
        .single()

      if (scoreboardError) throw scoreboardError

      // Then create the two teams
      const { error: teamsError } = await supabase
        .from('teams')
        .insert([
          {
            scoreboard_id: scoreboardData.id,
            name: formData.teamAName,
            position: 'home',
          },
          {
            scoreboard_id: scoreboardData.id,
            name: formData.teamBName,
            position: 'away',
          },
        ])

      if (teamsError) throw teamsError

      // Fetch the complete scoreboard with teams
      const { data: completeScoreboard, error: fetchError } = await supabase
        .from('scoreboards')
        .select(`
          *,
          teams (*)
        `)
        .eq('id', scoreboardData.id)
        .single()

      if (fetchError) throw fetchError
      
      // Ensure teams are ordered consistently (home first, away second)
      if (completeScoreboard.teams) {
        completeScoreboard.teams.sort((a: Team, b: Team) => {
          if (a.position === 'home' && b.position === 'away') return -1
          if (a.position === 'away' && b.position === 'home') return 1
          return 0
        })
      }

      const updated = [completeScoreboard, ...scoreboards]
      setScoreboards(updated)
      await computeAndSetScores(updated)
      setShowCreateForm(false)
      
      // Redirect to the scoreboard owner view
      navigate(`/scoreboard/${scoreboardData.id}`)
    } catch (error) {
      console.error('Error creating scoreboard:', error)
    } finally {
      setCreating(false)
    }
  }

  const editScoreboard = async (scoreboardId: string) => {
    const scoreboard = scoreboards.find(sb => sb.id === scoreboardId)
    if (!scoreboard || scoreboard.teams.length < 2) return
    
    setEditingScoreboard(scoreboard)
    setShowEditForm(true)
  }

  const updateScoreboard = async (formData: {
    teamAName: string
    teamBName: string
    venue: string
    gameDate: string
    gameStartTime: string
    gameEndTime: string
  }) => {
    if (!editingScoreboard) return

    setCreating(true)
    try {
      // Update the scoreboard metadata
      const { error: scoreboardError } = await supabase
        .from('scoreboards')
        .update({
          venue: formData.venue || null,
          game_date: formData.gameDate || null,
          game_start_time: formData.gameStartTime || null,
          game_end_time: formData.gameEndTime || null,
        })
        .eq('id', editingScoreboard.id)

      if (scoreboardError) throw scoreboardError

      // Update team names using position-based identification
      const homeTeam = editingScoreboard.teams.find(team => team.position === 'home')
      const awayTeam = editingScoreboard.teams.find(team => team.position === 'away')

      if (!homeTeam || !awayTeam) {
        throw new Error('Could not find home or away team')
      }

      const { error: teamAError } = await supabase
        .from('teams')
        .update({ name: formData.teamAName })
        .eq('id', homeTeam.id)

      if (teamAError) throw teamAError

      const { error: teamBError } = await supabase
        .from('teams')
        .update({ name: formData.teamBName })
        .eq('id', awayTeam.id)

      if (teamBError) throw teamBError

      // Refresh the scoreboards list
      await fetchScoreboards()
      setShowEditForm(false)
      setEditingScoreboard(null)
    } catch (error) {
      console.error('Error updating scoreboard:', error)
    } finally {
      setCreating(false)
    }
  }

  const deleteScoreboard = async (scoreboardId: string) => {
    if (!confirm('Are you sure you want to delete this scoreboard? This action cannot be undone.')) {
      return
    }

    try {
      // Delete scoreboard (this will cascade delete teams and quarters due to foreign key constraints)
      const { error } = await supabase
        .from('scoreboards')
        .delete()
        .eq('id', scoreboardId)
        .eq('owner_id', user!.id) // Ensure user can only delete their own scoreboards

      if (error) throw error

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
      alert('Failed to delete scoreboard. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-4 lg:grid-cols-2 mb-10">
            <CreateScoreboardCTA onCreateClick={() => setShowCreateForm(true)} />
            <JoinScoreboardCTA />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Scoreboards</h2>

          {showCreateForm && (
            <ScoreboardForm
              mode="create"
              onSubmit={createScoreboard}
              onCancel={() => setShowCreateForm(false)}
              loading={creating}
            />
          )}

          {showEditForm && editingScoreboard && (
            <ScoreboardForm
              mode="edit"
              initialData={{
                teamAName: editingScoreboard.teams[0]?.name || '',
                teamBName: editingScoreboard.teams[1]?.name || '',
                venue: editingScoreboard.venue || '',
                gameDate: editingScoreboard.game_date || '',
                gameStartTime: editingScoreboard.game_start_time || '',
                gameEndTime: editingScoreboard.game_end_time || '',
              }}
              onSubmit={updateScoreboard}
              onCancel={() => {
                setShowEditForm(false)
                setEditingScoreboard(null)
              }}
              loading={creating}
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

