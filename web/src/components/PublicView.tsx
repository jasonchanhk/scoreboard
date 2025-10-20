import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Timer } from './Timer'
import { ScoreboardHeader } from './ScoreboardHeader'
import { ScoreboardDisplay } from './ScoreboardDisplay'
import { QuarterHistory } from './QuarterHistory'
import { useScoreboardData } from '../hooks/useScoreboardData'

export const PublicView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { scoreboard, allQuarters, loading, error } = useScoreboardData({
    scoreboardId: id
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading scoreboard...</div>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <ScoreboardHeader
        scoreboard={scoreboard!}
        isOwner={false}
        onBackClick={() => navigate('/')}
      />

      {/* Main Scoreboard */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Scoreboard Display */}
        <ScoreboardDisplay
          teams={scoreboard?.teams || []}
          allQuarters={allQuarters}
        />

        {/* Timer */}
        <div className="mt-12 text-center">
          <Timer
            duration={scoreboard?.timer_duration || 0}
            startedAt={scoreboard?.timer_started_at || null}
            state={scoreboard?.timer_state || 'stopped'}
            pausedDuration={scoreboard?.timer_paused_duration || 0}
            isOwner={false} // Public view is always read-only
            onStart={() => {}} // No-op functions for public view
            onPause={() => {}}
            onReset={() => {}}
            className="max-w-md mx-auto"
          />
        </div>

        {/* Current Quarter Display */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-2xl font-bold mb-2">Quarter {scoreboard?.current_quarter || 1}</div>
            <div className="text-lg text-gray-400">Live Scoreboard</div>
          </div>
        </div>

        {/* Quarter History */}
        <div className="mt-8 text-center">
          <QuarterHistory
            teams={scoreboard?.teams || []}
            allQuarters={allQuarters}
            currentQuarter={scoreboard?.current_quarter || 1}
          />
        </div>

        {/* View Only Notice */}
        <div className="mt-8 text-center">
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-blue-200 text-sm">
              📺 View Only - This scoreboard updates in real-time
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
