import React from 'react'
import type { Team, Quarter, QuarterHistoryItem } from '../types/scoreboard'

interface QuarterHistoryProps {
  teams: Team[]
  allQuarters: Quarter[]
  currentQuarter: number
  quarters?: Quarter[] // Optional current quarter data for highlighting
  showCurrentQuarterScores?: boolean
  largeText?: boolean // If true, use text-5xl for text sizes
}

export const QuarterHistory: React.FC<QuarterHistoryProps> = ({
  teams,
  allQuarters,
  currentQuarter,
  quarters = [],
  showCurrentQuarterScores = false,
  largeText = false
}) => {
  // Helper function to get team by index
  const getTeam = (index: number) => {
    if (!teams || teams.length <= index) return null
    return teams[index]
  }

  // Helper function to get team score for current quarter
  const getTeamScore = (teamId: string) => {
    const quarter = quarters.find(q => q.team_id === teamId)
    return quarter?.points || 0
  }

  // Helper function to get quarter scores organized by quarter
  const getQuarterHistory = (): QuarterHistoryItem[] => {
    if (!teams || teams.length < 2) return []
    
    const teamA = teams[0]
    const teamB = teams[1]
    const quarterNumbers = [1, 2, 3, 4]
    
    return quarterNumbers.map(q => {
      const teamAQuarter = allQuarters.find(quarter => 
        quarter.team_id === teamA.id && quarter.quarter_number === q
      )
      const teamBQuarter = allQuarters.find(quarter => 
        quarter.team_id === teamB.id && quarter.quarter_number === q
      )
      
      return {
        quarter: q,
        teamAScore: teamAQuarter?.points || 0,
        teamBScore: teamBQuarter?.points || 0,
        teamAName: teamA.name,
        teamBName: teamB.name,
      }
    })
  }

  if (!teams || teams.length < 2) {
    return null
  }

  const headerTextSize = largeText ? 'text-5xl' : 'text-xs'
  const rowTextSize = largeText ? 'text-5xl' : 'text-sm'
  const quarterLabelSize = largeText ? 'text-5xl' : 'text-sm'
  const scoreTextSize = largeText ? 'text-5xl' : 'text-base'
  const paddingY = largeText ? 'py-6' : 'py-2.5'
  const paddingX = largeText ? 'px-6' : 'px-3'
  const headerPaddingY = largeText ? 'py-4' : 'py-2'
  const headerPaddingX = largeText ? 'px-6' : 'px-3'
  const quarterWidth = largeText ? 'w-20' : 'w-10'

  return (
    <div className="w-full">
      {/* Header */}
      <div className={`flex gap-2 mb-2 ${headerPaddingY} ${headerPaddingX} ${headerTextSize} font-medium text-gray-700 bg-gray-50 rounded-t-lg border-b border-gray-200`}>
        <div className={`${quarterWidth} flex-shrink-0`}></div>
        <div className="flex-1 text-center truncate font-semibold">{getTeam(0)?.name}</div>
        <div className="flex-1 text-center truncate font-semibold">{getTeam(1)?.name}</div>
      </div>

      {/* Quarter rows */}
      <div className="border border-gray-200 rounded-b-lg overflow-hidden">
        {getQuarterHistory().map((q, index) => (
          <div
            key={q.quarter}
            className={`flex gap-2 ${paddingY} ${paddingX} ${rowTextSize} ${
              q.quarter === currentQuarter
                ? 'bg-indigo-50 border-l-4 border-indigo-600'
                : index < getQuarterHistory().length - 1
                ? 'border-b border-gray-200'
                : ''
            }`}
          >
            <div className={`${quarterWidth} flex-shrink-0 font-medium text-gray-600 ${quarterLabelSize}`}>Q{q.quarter}</div>
            <div className="flex-1 text-center">
              {q.quarter === currentQuarter && showCurrentQuarterScores ? (
                <span className={`text-indigo-600 font-bold ${scoreTextSize}`}>
                  {getTeam(0) ? getTeamScore(getTeam(0)!.id) : 0}
                </span>
              ) : (
                <span className={`text-gray-900 font-medium ${scoreTextSize}`}>{q.teamAScore}</span>
              )}
            </div>
            <div className="flex-1 text-center">
              {q.quarter === currentQuarter && showCurrentQuarterScores ? (
                <span className={`text-indigo-600 font-bold ${scoreTextSize}`}>
                  {getTeam(1) ? getTeamScore(getTeam(1)!.id) : 0}
                </span>
              ) : (
                <span className={`text-gray-900 font-medium ${scoreTextSize}`}>{q.teamBScore}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
