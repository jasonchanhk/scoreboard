import type { Team, Quarter } from '../types/scoreboard'

/**
 * Calculate total score for a team from all quarters
 */
export const calculateTeamTotalScore = (teamId: string, quarters: Quarter[]): number => {
  return quarters.filter((q) => q.team_id === teamId).reduce((sum, q) => sum + (q.points || 0), 0)
}

/**
 * Get team data safely with defaults
 */
export const getTeamData = (teams: Team[] | undefined, index: number) => {
  const team = teams?.[index]
  return {
    team,
    name: team?.name || `Team ${index + 1}`,
    color: team?.color || null,
    score: team ? calculateTeamTotalScore(team.id, []) : 0, // Will be calculated with actual quarters
  }
}

/**
 * Generate meta tags data for a scoreboard
 */
export const generateScoreboardMetaTags = (
  team0Name: string,
  team1Name: string,
  score0: number,
  score1: number,
  scoreboardId: string | undefined
) => {
  const title = `${team0Name} vs ${team1Name} - Live Scoreboard`
  const description = `Live score: ${team0Name} ${score0} - ${score1} ${team1Name} on Pretty Scoreboard`
  const imageUrl = scoreboardId
    ? `${window.location.origin}/.netlify/functions/scoreboard-preview?id=${scoreboardId}&image=true`
    : ''
  const pageUrl = scoreboardId
    ? `${window.location.origin}/scoreboard/${scoreboardId}`
    : ''

  return { title, description, imageUrl, pageUrl }
}

