import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiX } from 'react-icons/hi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ColorPicker } from './ColorPicker'
import { Button } from './Button'

interface ScoreboardFormProps {
  mode: 'create' | 'edit'
  scoreboardId?: string // Required for edit mode
  initialData?: {
    id?: string
    teamAName?: string
    teamBName?: string
    teamAColor?: string
    teamBColor?: string
    venue?: string
    gameDate?: string
    gameStartTime?: string
    gameEndTime?: string
  }
  onSuccess?: () => void // Called after successful create/update
  onCancel: () => void
  onError?: (error: string) => void // Called on error
}

const HOURS = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

export const ScoreboardForm: React.FC<ScoreboardFormProps> = ({
  mode,
  scoreboardId,
  initialData,
  onSuccess,
  onCancel,
  onError
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [teamAName, setTeamAName] = useState(initialData?.teamAName || '')
  const [teamBName, setTeamBName] = useState(initialData?.teamBName || '')
  const [teamAColor, setTeamAColor] = useState(initialData?.teamAColor || '#ef4444')
  const [teamBColor, setTeamBColor] = useState(initialData?.teamBColor || '#3b82f6')
  const [timerDuration, setTimerDuration] = useState(720) // Default 12 minutes
  const [venue, setVenue] = useState(initialData?.venue || '')
  const [gameDate, setGameDate] = useState(initialData?.gameDate || '')
  const [gameStartTime, setGameStartTime] = useState(initialData?.gameStartTime || '')
  const [gameEndTime, setGameEndTime] = useState(initialData?.gameEndTime || '')
  const [startHour, setStartHour] = useState(() => initialData?.gameStartTime?.split(':')[0] || '')
  const [startMinute, setStartMinute] = useState(() => initialData?.gameStartTime?.split(':')[1] || '')
  const [endHour, setEndHour] = useState(() => initialData?.gameEndTime?.split(':')[0] || '')
  const [endMinute, setEndMinute] = useState(() => initialData?.gameEndTime?.split(':')[1] || '')
  const updateStartTime = (hour: string, minute: string) => {
    if (hour && minute) {
      const time = `${hour}:${minute}`
      setGameStartTime(time)
    } else {
      setGameStartTime('')
    }
  }

  const updateEndTime = (hour: string, minute: string) => {
    if (hour && minute) {
      const time = `${hour}:${minute}`
      setGameEndTime(time)
    } else {
      setGameEndTime('')
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamAName.trim() || !teamBName.trim()) return

    setLoading(true)
    try {
      if (mode === 'create') {
        await handleCreate()
      } else {
        await handleUpdate()
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} scoreboard:`, error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!user) {
      throw new Error('User must be authenticated to create a scoreboard')
    }

    // First create the scoreboard
    const { data: scoreboardData, error: scoreboardError } = await supabase
      .from('scoreboards')
      .insert({
        owner_id: user.id,
        timer_duration: timerDuration,
        timer_state: 'stopped',
        timer_paused_duration: 0,
        venue: venue.trim() || null,
        game_date: gameDate || null,
        game_start_time: gameStartTime || null,
        game_end_time: gameEndTime || null,
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
          position: 'home',
          color: teamAColor,
        },
        {
          scoreboard_id: scoreboardData.id,
          name: teamBName.trim(),
          position: 'away',
          color: teamBColor,
        },
      ])

    if (teamsError) throw teamsError

    // Call success callback
    onSuccess?.()
    
    // Redirect to the scoreboard owner view
    navigate(`/scoreboard/${scoreboardData.id}`)
  }

  const handleUpdate = async () => {
    if (!scoreboardId) {
      throw new Error('Scoreboard ID is required for update')
    }

    // Fetch current scoreboard to get team IDs
    const { data: currentScoreboard, error: fetchError } = await supabase
      .from('scoreboards')
      .select(`
        *,
        teams (*)
      `)
      .eq('id', scoreboardId)
      .single()

    if (fetchError) throw fetchError
    if (!currentScoreboard) throw new Error('Scoreboard not found')

    // Update the scoreboard metadata
    const { error: scoreboardError } = await supabase
      .from('scoreboards')
      .update({
        venue: venue.trim() || null,
        game_date: gameDate || null,
        game_start_time: gameStartTime || null,
        game_end_time: gameEndTime || null,
      })
      .eq('id', scoreboardId)

    if (scoreboardError) throw scoreboardError

    // Update team names and colors using position-based identification
    const homeTeam = currentScoreboard.teams.find((team: any) => team.position === 'home')
    const awayTeam = currentScoreboard.teams.find((team: any) => team.position === 'away')

    if (!homeTeam || !awayTeam) {
      throw new Error('Could not find home or away team')
    }

    const { error: teamAError } = await supabase
      .from('teams')
      .update({ name: teamAName.trim(), color: teamAColor })
      .eq('id', homeTeam.id)

    if (teamAError) throw teamAError

    const { error: teamBError } = await supabase
      .from('teams')
      .update({ name: teamBName.trim(), color: teamBColor })
      .eq('id', awayTeam.id)

    if (teamBError) throw teamBError

    // Call success callback
    onSuccess?.()
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="relative top-20 mx-auto p-5 w-11/12 md:w-2/3 lg:w-1/2 shadow-2xl rounded-lg bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Create New Scoreboard' : 'Edit Scoreboard'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            title="Close"
          >
            <HiX className="text-2xl" />
          </button>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="teamA" className="block text-sm font-medium text-gray-700">
              Home
            </label>
            <input
              type="text"
              id="teamA"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter home team name"
              required
            />
            <ColorPicker
              value={teamAColor}
              onChange={setTeamAColor}
            />
          </div>
          <div>
            <label htmlFor="teamB" className="block text-sm font-medium text-gray-700">
              Away
            </label>
            <input
              type="text"
              id="teamB"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter away team name"
              required
            />
            <ColorPicker
              value={teamBColor}
              onChange={setTeamBColor}
            />
          </div>
        </div>
        
        {/* Only show timer duration for create mode */}
        {mode === 'create' && (
          <div className="space-y-3">
            <label htmlFor="timerDuration" className="block text-sm font-medium text-gray-700">
              Timer Duration (minutes)
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="number"
                id="timerDuration"
                value={Math.floor(timerDuration / 60)}
                onChange={(e) => setTimerDuration((parseInt(e.target.value) || 12) * 60)}
                className="block w-32 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="1"
                max="60"
                required
              />
              <div className="text-sm text-gray-500">minutes</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTimerDuration(720)} // 12 minutes
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  12 min
                </button>
                <button
                  type="button"
                  onClick={() => setTimerDuration(600)} // 10 minutes
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  10 min
                </button>
                <button
                  type="button"
                  onClick={() => setTimerDuration(300)} // 5 minutes
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  5 min
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
              Venue (Optional)
            </label>
            <input
              type="text"
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter venue name"
            />
          </div>
          <div>
            <label htmlFor="gameDate" className="block text-sm font-medium text-gray-700">
              Game Date (Optional)
            </label>
            <input
              type="date"
              id="gameDate"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="gameStartTime" className="block text-sm font-medium text-gray-700">
              Start Time (Optional)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <select
                id="gameStartHour"
                value={startHour}
                onChange={(e) => {
                  const value = e.target.value
                  setStartHour(value)
                  updateStartTime(value, startMinute)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">HH</option>
                {!HOURS.includes(startHour) && startHour && <option value={startHour}>{startHour}</option>}
                {HOURS.map(hour => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className="text-lg text-gray-500">:</span>
              <select
                id="gameStartMinute"
                value={startMinute}
                onChange={(e) => {
                  const value = e.target.value
                  setStartMinute(value)
                  updateStartTime(startHour, value)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">MM</option>
                {!MINUTES.includes(startMinute) && startMinute && <option value={startMinute}>{startMinute}</option>}
                {MINUTES.map(minute => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="gameEndTime" className="block text-sm font-medium text-gray-700">
              End Time (Optional)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <select
                id="gameEndHour"
                value={endHour}
                onChange={(e) => {
                  const value = e.target.value
                  setEndHour(value)
                  updateEndTime(value, endMinute)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">HH</option>
                {!HOURS.includes(endHour) && endHour && <option value={endHour}>{endHour}</option>}
                {HOURS.map(hour => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className="text-lg text-gray-500">:</span>
              <select
                id="gameEndMinute"
                value={endMinute}
                onChange={(e) => {
                  const value = e.target.value
                  setEndMinute(value)
                  updateEndTime(endHour, value)
                }}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">MM</option>
                {!MINUTES.includes(endMinute) && endMinute && <option value={endMinute}>{endMinute}</option>}
                {MINUTES.map(minute => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="sm"
          >
            {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Scoreboard' : 'Update Scoreboard')}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
