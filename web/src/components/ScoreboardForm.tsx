import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiX } from 'react-icons/hi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './Button'
import { ColorPicker, DateInput, DurationInput, TextInput, TimeInput } from './input'

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

interface FormData {
  teamAName: string
  teamBName: string
  teamAColor: string
  teamBColor: string
  timerDurationMinutes: number
  venue: string
  gameDate: string
  gameStartTime: string
  gameEndTime: string
}


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
  
  const [formData, setFormData] = useState<FormData>({
    teamAName: initialData?.teamAName || '',
    teamBName: initialData?.teamBName || '',
    teamAColor: initialData?.teamAColor || '#ef4444',
    teamBColor: initialData?.teamBColor || '#3b82f6',
    timerDurationMinutes: 12, // Default 12 minutes
    venue: initialData?.venue || '',
    gameDate: initialData?.gameDate || '',
    gameStartTime: initialData?.gameStartTime || '',
    gameEndTime: initialData?.gameEndTime || '',
  })

  // Helper function to update form fields
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.teamAName.trim() || !formData.teamBName.trim()) return

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
        timer_duration: formData.timerDurationMinutes * 60,
        timer_state: 'stopped',
        timer_paused_duration: 0,
        venue: formData.venue.trim() || null,
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
          name: formData.teamAName.trim(),
          position: 'home',
          color: formData.teamAColor,
        },
        {
          scoreboard_id: scoreboardData.id,
          name: formData.teamBName.trim(),
          position: 'away',
          color: formData.teamBColor,
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
        venue: formData.venue.trim() || null,
        game_date: formData.gameDate || null,
        game_start_time: formData.gameStartTime || null,
        game_end_time: formData.gameEndTime || null,
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
      .update({ name: formData.teamAName.trim(), color: formData.teamAColor })
      .eq('id', homeTeam.id)

    if (teamAError) throw teamAError

    const { error: teamBError } = await supabase
      .from('teams')
      .update({ name: formData.teamBName.trim(), color: formData.teamBColor })
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
            <TextInput
              label="Home"
              value={formData.teamAName}
              onChange={(value) => updateField('teamAName', value)}
              id="teamA"
              placeholder="Enter home team name"
              required
            />
            <ColorPicker
              value={formData.teamAColor}
              onChange={(value) => updateField('teamAColor', value)}
            />
          </div>
          <div>
            <TextInput
              label="Away"
              value={formData.teamBName}
              onChange={(value) => updateField('teamBName', value)}
              id="teamB"
              placeholder="Enter away team name"
              required
            />
            <ColorPicker
              value={formData.teamBColor}
              onChange={(value) => updateField('teamBColor', value)}
            />
          </div>
        </div>
        
        {/* Only show timer duration for create mode */}
        {mode === 'create' && (
          <DurationInput
            label="Timer Duration (minutes)"
            value={formData.timerDurationMinutes}
            onChange={(value) => updateField('timerDurationMinutes', value)}
            id="timerDuration"
            min={1}
            max={60}
            required
            quickOptions={[12, 10, 5]}
          />
        )}
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextInput
            label="Venue (Optional)"
            value={formData.venue}
            onChange={(value) => updateField('venue', value)}
            id="venue"
            placeholder="Enter venue name"
          />
          <DateInput
            label="Game Date (Optional)"
            value={formData.gameDate}
            onChange={(value) => updateField('gameDate', value)}
            id="gameDate"
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TimeInput
            label="Start Time (Optional)"
            value={formData.gameStartTime}
            onChange={(value) => updateField('gameStartTime', value)}
            id="gameStartTime"
          />
          <TimeInput
            label="End Time (Optional)"
            value={formData.gameEndTime}
            onChange={(value) => updateField('gameEndTime', value)}
            id="gameEndTime"
          />
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
            size="md"
          >
            {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Scoreboard' : 'Update Scoreboard')}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
