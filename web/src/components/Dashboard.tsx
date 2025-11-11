import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ScoreboardForm } from './ScoreboardForm'

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
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.email?.slice(0, 2) || 'US').toUpperCase()

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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full">
                  <span className="text-lg">🏀</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Pretty Scoreboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open user menu</span>
                  {initials}
                </button>
                <div className="absolute right-0 top-full z-50 hidden group-hover:block focus-within:block w-56 rounded-md shadow-lg bg-white">
                  <div className="py-2">
                    {user?.email && (
                      <div className="px-4 pb-2 text-xs text-gray-500 cursor-default select-text">
                        {user.email}
                      </div>
                    )}
                    <button
                      onClick={signOut}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Scoreboards</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const code = joinCode.trim().toUpperCase()
                  if (/^[A-Z0-9]{6}$/.test(code)) {
                    setJoining(true)
                    try {
                      const { data, error } = await supabase
                        .from('scoreboards')
                        .select('id')
                        .eq('share_code', code)
                        .single()

                      if (error) throw error
                      if (!data) {
                        alert('Scoreboard not found or not shared')
                        return
                      }

                      navigate(`/scoreboard/${data.id}/view`)
                    } catch (error) {
                      console.error('Error joining scoreboard:', error)
                      alert('Failed to join scoreboard')
                    } finally {
                      setJoining(false)
                    }
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  inputMode="text"
                  maxLength={6}
                  placeholder="Enter 6-char code"
                  value={joinCode}
                  onChange={(e) => {
                    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    setJoinCode(cleaned)
                  }}
                  className="w-full sm:w-56 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={!/^[A-Z0-9]{6}$/.test(joinCode) || joining}
                  className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'View'}
                </button>
              </form>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Scoreboard
              </button>
            </div>
          </div>

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
              {scoreboards.map((scoreboard) => {
                const startTime = scoreboard.game_start_time ? scoreboard.game_start_time.substring(0, 5) : ''
                const endTime = scoreboard.game_end_time ? scoreboard.game_end_time.substring(0, 5) : ''
                const timeDisplay =
                  startTime && endTime
                    ? `${startTime} – ${endTime}`
                    : startTime
                      ? `Starts ${startTime}`
                      : endTime
                        ? `Ends ${endTime}`
                        : '-'
                const venueDisplay = scoreboard.venue?.trim() || '-'
                const dateDisplay = scoreboard.game_date
                  ? new Date(scoreboard.game_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : '-'

                return (
                  <div key={scoreboard.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {scoreboard.teams.length >= 2
                            ? `${scoreboard.teams[0].name} vs ${scoreboard.teams[1].name}`
                            : 'Loading teams...'}
                        </h3>

                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">
                            {dateDisplay} · <span className="uppercase tracking-wide text-gray-500">{timeDisplay}</span>
                          </div>
                          <div className="text-sm font-normal text-gray-900">{venueDisplay}</div>
                        </div>
                      </div>

                      {/* Delete button in top-right corner */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => deleteScoreboard(scoreboard.id)}
                          className="text-gray-400 hover:text-red-600 text-2xl leading-none cursor-pointer"
                          title="Delete scoreboard"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-4xl font-extrabold text-gray-900">
                        {scoreboard.teams.length >= 2
                          ? `${(scoresByScoreboard[scoreboard.id]?.a ?? 0)} - ${(scoresByScoreboard[scoreboard.id]?.b ?? 0)}`
                          : 'Loading...'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Q{scoreboard.current_quarter}</div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <Link
                          to={`/scoreboard/${scoreboard.id}`}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium"
                        >
                          Open
                        </Link>
                        {!scoreboard.share_code ? (
                          <button
                            onClick={() => editScoreboard(scoreboard.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        ) : (
                          <div className="bg-green-100 text-green-800 py-2 px-4 rounded-md text-sm font-medium">
                            {scoreboard.share_code}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
