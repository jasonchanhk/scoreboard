import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Team {
  id: string
  name: string
  scoreboard_id: string
  created_at: string
}

interface Scoreboard {
  id: string
  owner_id: string
  share_code: string | null
  current_quarter: number
  timer: string
  created_at: string
  teams: Team[]
}

export const Dashboard: React.FC = () => {
  const [scoreboards, setScoreboards] = useState<Scoreboard[]>([])
  const [scoresByScoreboard, setScoresByScoreboard] = useState<Record<string, { a: number; b: number }>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [teamAName, setTeamAName] = useState('')
  const [teamBName, setTeamBName] = useState('')
  const [creating, setCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const { user, signOut } = useAuth()
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

  const createScoreboard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !teamAName.trim() || !teamBName.trim()) return

    setCreating(true)
    try {
      // First create the scoreboard
      const { data: scoreboardData, error: scoreboardError } = await supabase
        .from('scoreboards')
        .insert({
          owner_id: user.id,
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
            name: teamAName.trim(),
          },
          {
            scoreboard_id: scoreboardData.id,
            name: teamBName.trim(),
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

      const updated = [completeScoreboard, ...scoreboards]
      setScoreboards(updated)
      await computeAndSetScores(updated)
      setTeamAName('')
      setTeamBName('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating scoreboard:', error)
    } finally {
      setCreating(false)
    }
  }

  const generateShareCode = async (scoreboardId: string) => {
    try {
      const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error } = await supabase
        .from('scoreboards')
        .update({ share_code: shareCode })
        .eq('id', scoreboardId)

      if (error) throw error

      // Update local state
      setScoreboards(scoreboards.map(sb => 
        sb.id === scoreboardId ? { ...sb, share_code: shareCode } : sb
      ))
    } catch (error) {
      console.error('Error generating share code:', error)
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
              <h1 className="text-xl font-semibold text-gray-900">Basketball Scoreboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
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
                onSubmit={(e) => {
                  e.preventDefault()
                  const code = joinCode.trim().toUpperCase()
                  if (/^[A-Z0-9]{6}$/.test(code)) {
                    navigate(`/view/${code}`)
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
                  disabled={!/^[A-Z0-9]{6}$/.test(joinCode)}
                  className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  View
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
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Scoreboard</h3>
              <form onSubmit={createScoreboard} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="teamA" className="block text-sm font-medium text-gray-700">
                      Team A Name
                    </label>
                    <input
                      type="text"
                      id="teamA"
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter team A name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="teamB" className="block text-sm font-medium text-gray-700">
                      Team B Name
                    </label>
                    <input
                      type="text"
                      id="teamB"
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter team B name"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Scoreboard'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {scoreboards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No scoreboards yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {scoreboards.map((scoreboard) => (
                <div key={scoreboard.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {scoreboard.teams.length >= 2 
                        ? `${scoreboard.teams[0].name} vs ${scoreboard.teams[1].name}`
                        : 'Loading teams...'
                      }
                    </h3>
                    <div className="text-sm text-gray-500">
                      Q{scoreboard.current_quarter}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {scoreboard.teams.length >= 2
                        ? `${(scoresByScoreboard[scoreboard.id]?.a ?? 0)} - ${(scoresByScoreboard[scoreboard.id]?.b ?? 0)}`
                        : 'Loading...'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {scoreboard.timer}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/scoreboard/${scoreboard.id}`}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium"
                    >
                      Open
                    </Link>
                    {!scoreboard.share_code ? (
                      <button
                        onClick={() => generateShareCode(scoreboard.id)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                      >
                        Share
                      </button>
                    ) : (
                      <div className="bg-green-100 text-green-800 py-2 px-4 rounded-md text-sm font-medium">
                        {scoreboard.share_code}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
