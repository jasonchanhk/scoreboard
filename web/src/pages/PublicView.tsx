import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HiChevronLeft } from 'react-icons/hi'
import { useScoreboardData } from '../hooks/useScoreboardData'
import { useTeamTotalScore } from '../hooks/useTeamTotalScore'
import { useTimerCalculation } from '../hooks/useTimerCalculation'
import { useAuth } from '../contexts/AuthContext'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Scoreboard not found'}</div>
          <div className="text-gray-400 text-sm">
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      {/* Back Button - Top Left Corner */}
      <button
        onClick={() => navigate(user ? '/dashboard' : '/auth')}
        className="absolute top-6 left-6 z-10 text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center"
        aria-label="Back to Dashboard"
      >
        <HiChevronLeft className="text-2xl" />
      </button>

      {/* Main Scoreboard */}
      <div className="flex-1 flex flex-col justify-center py-10 px-20">
        <div className="w-full h-[70vh]">
          {/* Top Section: Team Names and Scores */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left Team */}
            <div className="border-4 border-white rounded-2xl p-4 flex flex-col h-full">
              <div className="text-3xl font-bold mb-4 pb-4 border-b-4 border-white text-center">
                {team0?.name || 'Team 1'}
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                <div className="font-bold leading-none" style={{ fontSize: 'min(50vh, 45vw)' }}>
                  {team0 ? getTeamTotalScore(team0.id) : 0}
                </div>
              </div>
            </div>

            {/* Right Team */}
            <div className="border-4 border-white rounded-2xl p-4 flex flex-col h-full">
              <div className="text-3xl font-bold mb-4 pb-4 border-b-4 border-white text-center">
                {team1?.name || 'Team 2'}
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                <div className="font-bold leading-none" style={{ fontSize: 'min(50vh, 45vw)' }}>
                  {team1 ? getTeamTotalScore(team1.id) : 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Quarter and Time Widget */}
        <div className="flex justify-center mt-8">
          <div className="border-4 border-white rounded-lg px-4 py-3 flex items-center">
            {/* Quarter Display */}
            <div className="px-4">
              <div className="text-6xl font-bold">Q{currentQuarter}</div>
            </div>
            
            {/* Divider Line */}
            <div className="h-16 border-l-4 border-white mx-4"></div>
            
            {/* Time Display */}
            <div className="px-4">
              <div className="text-6xl font-mono font-bold">{formattedTime}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

