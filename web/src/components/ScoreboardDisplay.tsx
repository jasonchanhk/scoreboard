import React from 'react'
import type { Team, Quarter } from '../types/scoreboard'

interface ScoreboardDisplayProps {
  teams: Team[]
  allQuarters: Quarter[]
  isOwner?: boolean
  onScoreUpdate?: (teamIndex: number, delta: number) => void
}

export const ScoreboardDisplay: React.FC<ScoreboardDisplayProps> = ({
  teams,
  allQuarters,
  isOwner = false,
  onScoreUpdate
}) => {
  // Helper function to get team by index
  const getTeam = (index: number) => {
    if (!teams || teams.length <= index) return null
    return teams[index]
  }

  // Helper function to get cumulative team score across all quarters
  const getTeamTotalScore = (teamId: string) => {
    return allQuarters
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + q.points, 0)
  }

  const showControls = isOwner && onScoreUpdate

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Home Team */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">
          {getTeam(0)?.name || 'Loading...'}
        </h2>
        <div className="relative">
          <div className="text-8xl font-bold mb-4">
            {getTeam(0) ? getTeamTotalScore(getTeam(0)!.id) : 0}
          </div>
          {showControls && getTeam(0) && (
            <div className="space-y-4">
              <button
                onClick={() => onScoreUpdate!(0, 1)}
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
              >
                +1
              </button>
              <button
                onClick={() => onScoreUpdate!(0, -1)}
                className="block w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
              >
                -1
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Away Team */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">
          {getTeam(1)?.name || 'Loading...'}
        </h2>
        <div className="relative">
          <div className="text-8xl font-bold mb-4">
            {getTeam(1) ? getTeamTotalScore(getTeam(1)!.id) : 0}
          </div>
          {showControls && getTeam(1) && (
            <div className="space-y-4">
              <button
                onClick={() => onScoreUpdate!(1, 1)}
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
              >
                +1
              </button>
              <button
                onClick={() => onScoreUpdate!(1, -1)}
                className="block w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg text-xl font-bold"
              >
                -1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
