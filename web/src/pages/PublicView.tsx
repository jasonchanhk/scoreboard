import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HiChevronLeft } from 'react-icons/hi'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useTimerCalculation } from '../hooks/useTimerCalculation'
import { useAuth } from '../contexts/AuthContext'
import { TeamScore } from '../components/TeamScore'

export const PublicView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { scoreboard, allQuarters, loading, error } = useScoreboardData({
    scoreboardId: id
  })

  // Custom hooks
  const { getTeamTotalScore } = useTeamTotalScore(allQuarters)
  const { formattedTime } = useTimerCalculation(scoreboard)


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-gray-900 text-xl font-medium">Loading scoreboard...</div>
        </div>
      </div>
    )
  }

  if (error || !scoreboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-gray-900 text-xl mb-4">{error || 'Scoreboard not found'}</div>
          <div className="text-gray-500 text-sm">
            This scoreboard may not be shared or the share code is invalid.
          </div>
        </div>
      </div>
    )
  }

  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  const currentQuarter = scoreboard.current_quarter || 1

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col relative">
      {/* Back Button - Top Left Corner */}
      <button
        onClick={() => navigate(user ? '/dashboard' : '/auth')}
        className="absolute top-6 left-6 z-10 text-gray-600 hover:text-gray-900 transition-colors text-2xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center"
        aria-label="Back to Dashboard"
      >
        <HiChevronLeft className="text-2xl" />
      </button>

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col justify-center py-10 px-20">
        <div className="w-full h-[70vh]">
          {/* Top Section: Team Names and Scores */}
          <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left Team */}
            <TeamScore
              teamName={team0?.name || 'Team 1'}
              score={team0 ? getTeamTotalScore(team0.id) : 0}
              color={team0?.color || null}
            />

            {/* Right Team */}
            <TeamScore
              teamName={team1?.name || 'Team 2'}
              score={team1 ? getTeamTotalScore(team1.id) : 0}
              color={team1?.color || null}
            />
          </div>
        </div>

        {/* Bottom Section: Quarter and Time Widget */}
        <div className="flex justify-center mt-8">
          <div className="border-4 border-gray-300 rounded-lg px-4 py-3 flex items-center bg-gray-50">
            {/* Quarter Display */}
            <div className="px-4">
              <div className="text-6xl font-bold text-gray-900">Q{currentQuarter}</div>
            </div>
            
            {/* Divider Line */}
            <div className="h-16 border-l-4 border-gray-300 mx-4"></div>
            
            {/* Time Display */}
            <div className="px-4">
              <div className="text-6xl font-mono font-bold text-gray-900">{formattedTime}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

