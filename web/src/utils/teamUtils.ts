import type { Team } from '../types/scoreboard'

/**
 * Sorts teams consistently: home first, away second
 * This ensures consistent team ordering across the application
 */
export const sortTeams = (teams: Team[]): Team[] => {
  return [...teams].sort((a: Team, b: Team) => {
    if (a.position === 'home' && b.position === 'away') return -1
    if (a.position === 'away' && b.position === 'home') return 1
    return 0
  })
}

