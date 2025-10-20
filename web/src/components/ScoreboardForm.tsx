import React, { useState } from 'react'

interface ScoreboardFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id?: string
    teamAName?: string
    teamBName?: string
    venue?: string
    gameDate?: string
    gameStartTime?: string
    gameEndTime?: string
  }
  onSubmit: (data: {
    teamAName: string
    teamBName: string
    venue: string
    gameDate: string
    gameStartTime: string
    gameEndTime: string
  }) => Promise<void>
  onCancel: () => void
  loading: boolean
}

export const ScoreboardForm: React.FC<ScoreboardFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading
}) => {
  const [teamAName, setTeamAName] = useState(initialData?.teamAName || '')
  const [teamBName, setTeamBName] = useState(initialData?.teamBName || '')
  const [timerDuration, setTimerDuration] = useState(720) // Default 12 minutes
  const [venue, setVenue] = useState(initialData?.venue || '')
  const [gameDate, setGameDate] = useState(initialData?.gameDate || '')
  const [gameStartTime, setGameStartTime] = useState(initialData?.gameStartTime || '')
  const [gameEndTime, setGameEndTime] = useState(initialData?.gameEndTime || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamAName.trim() || !teamBName.trim()) return

    await onSubmit({
      teamAName: teamAName.trim(),
      teamBName: teamBName.trim(),
      venue: venue.trim(),
      gameDate,
      gameStartTime,
      gameEndTime
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {mode === 'create' ? 'Create New Scoreboard' : 'Edit Scoreboard'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="teamA" className="block text-sm font-medium text-gray-700">
              Home
            </label>
            <input
              type="text"
              id="teamA"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter home team name"
              required
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter away team name"
              required
            />
          </div>
        </div>
        
        {/* Only show timer duration for create mode */}
        {mode === 'create' && (
          <div>
            <label htmlFor="timerDuration" className="block text-sm font-medium text-gray-700">
              Timer Duration (minutes)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="number"
                id="timerDuration"
                value={Math.floor(timerDuration / 60)}
                onChange={(e) => setTimerDuration((parseInt(e.target.value) || 12) * 60)}
                className="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="1"
                max="60"
                required
              />
              <div className="text-sm text-gray-500">
                minutes
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setTimerDuration(720)} // 12 minutes
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  12 min
                </button>
                <button
                  type="button"
                  onClick={() => setTimerDuration(600)} // 10 minutes
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  10 min
                </button>
                <button
                  type="button"
                  onClick={() => setTimerDuration(300)} // 5 minutes
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  5 min
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
              Venue (Optional)
            </label>
            <input
              type="text"
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gameStartTime" className="block text-sm font-medium text-gray-700">
              Start Time (Optional)
            </label>
            <input
              type="time"
              id="gameStartTime"
              value={gameStartTime}
              onChange={(e) => setGameStartTime(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="gameEndTime" className="block text-sm font-medium text-gray-700">
              End Time (Optional)
            </label>
            <input
              type="time"
              id="gameEndTime"
              value={gameEndTime}
              onChange={(e) => setGameEndTime(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Scoreboard' : 'Update Scoreboard')}
          </button>
        </div>
      </form>
    </div>
  )
}
