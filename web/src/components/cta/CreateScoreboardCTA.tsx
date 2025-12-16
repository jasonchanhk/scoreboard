import React from 'react'
import { Button } from '../button'

interface CreateScoreboardCTAProps {
  onCreateClick: () => void
}

export const CreateScoreboardCTA: React.FC<CreateScoreboardCTAProps> = ({ onCreateClick }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-900">Create a new scoreboard</h3>
        <p className="text-sm text-gray-600">
          Launch a fresh game center with teams, timers, and live controls. Perfect for league games or pickup matches.
        </p>
        <ul className="space-y-2 text-sm text-gray-500">
          <li>• Customize team names, venue, and schedule</li>
          <li>• Control the clock and scoring in real time</li>
          <li>• Share a public link for fans and staff</li>
        </ul>
      </div>
      <div className="mt-10">
        <Button onClick={onCreateClick} variant="primary" size="md">
          Create new scoreboard
        </Button>
      </div>
    </div>
  )
}

