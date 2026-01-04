import React from 'react'
import { TeamScore } from './TeamScore'
import { QuarterHistory } from './QuarterHistory'
import { BrandingLogo } from './BrandingLogo'
import type { Team, Quarter } from '../types/scoreboard'

interface ScoreboardSummaryProps {
  teams: Team[]
  allQuarters: Quarter[]
  currentQuarter: number
  gameDate?: string | null
  venue?: string | null
}

export const ScoreboardSummary: React.FC<ScoreboardSummaryProps> = ({
  teams,
  allQuarters,
  currentQuarter,
  gameDate,
  venue
}) => {
  const getTeamTotalScore = (teamId: string): number => {
    return allQuarters
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + q.points, 0)
  }

  if (!teams || teams.length < 2) {
    return null
  }

  const team0 = teams[0]
  const team1 = teams[1]
  const score0 = getTeamTotalScore(team0.id)
  const score1 = getTeamTotalScore(team1.id)

  // Get current quarter data for highlighting
  const quarters = allQuarters.filter(q => 
    (q.team_id === team0.id || q.team_id === team1.id) && 
    q.quarter_number === currentQuarter
  )

  return (
    <div className="w-[1050px] h-[1350px] p-10 bg-white flex flex-col relative">
      {/* Title */}
      <div className="pt-10 pb-10">
        <h1 className="text-7xl font-bold text-gray-900 text-center leading-tight">Game Summary</h1>
      </div>

      {/* Team Scorecards */}
      <div className="flex gap-14 justify-center mb-14 px-16">
        <div className="w-[450px] h-[320px] flex-shrink-0">
          <TeamScore
            teamName={team0.name}
            score={score0}
            color={team0.color || null}
            isOwner={false}
          />
        </div>
        <div className="w-[450px] h-[320px] flex-shrink-0">
          <TeamScore
            teamName={team1.name}
            score={score1}
            color={team1.color || null}
            isOwner={false}
          />
        </div>
      </div>

      {/* Quarter History */}
      <div className="px-16 mb-10">
        <QuarterHistory
          teams={teams}
          allQuarters={allQuarters}
          currentQuarter={currentQuarter}
          quarters={quarters}
          showCurrentQuarterScores={true}
          largeText={true}
        />
      </div>

      {/* Date and Venue */}
      {(gameDate || venue) && (
        <div className="text-center text-gray-600 text-5xl mb-6">
          {gameDate && (
            <span>
              {new Date(gameDate).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
          {gameDate && venue && <span> • </span>}
          {venue && <span>{venue}</span>}
        </div>
      )}

      {/* Logo/Branding - positioned absolutely at bottom right */}
      <div className="absolute bottom-8 right-16">
        <BrandingLogo variant="summary" />
      </div>
    </div>
  )
}

