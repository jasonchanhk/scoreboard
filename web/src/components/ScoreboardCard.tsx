import React from 'react'
import { HiX } from 'react-icons/hi'
import { useGameDateTime } from '../hooks/useGameDateTime'
import { Button } from './Button'

interface Team {
  id: string
  name: string
  scoreboard_id: string
  position: 'home' | 'away'
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
  // Custom hooks
  const { timeDisplayForCard, dateDisplayForCard } = useGameDateTime(scoreboard)
  
  const venueDisplay = scoreboard.venue?.trim() || '-'

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
              {dateDisplayForCard} · <span className="uppercase tracking-wide text-gray-500">{timeDisplayForCard}</span>
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
            <HiX className="text-2xl" />
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
          <Button
            to={`/scoreboard/${scoreboard.id}`}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            Open
          </Button>
          <Button
            onClick={() => onEdit(scoreboard.id)}
            variant="secondary"
            size="sm"
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}

