import React from 'react'
import { Link } from 'react-router-dom'

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

interface ScoreboardCardProps {
  scoreboard: Scoreboard
  score: { a: number; b: number }
  onDelete: (scoreboardId: string) => void
  onEdit: (scoreboardId: string) => void
}

export const ScoreboardCard: React.FC<ScoreboardCardProps> = ({
  scoreboard,
  score,
  onDelete,
  onEdit,
}) => {
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
    <div className="bg-white shadow rounded-lg p-6">
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
            onClick={() => onDelete(scoreboard.id)}
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
            ? `${score.a} - ${score.b}`
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
          <button
            onClick={() => onEdit(scoreboard.id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

