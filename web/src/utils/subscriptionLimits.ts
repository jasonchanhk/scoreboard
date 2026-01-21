/**
 * Get the maximum number of scoreboards allowed for a subscription plan
 */
export function getScoreboardLimit(planTier: 'basic' | 'plus' | 'premium' | null): number {
  switch (planTier) {
    case 'basic':
      return 2
    case 'plus':
      return 50
    case 'premium':
      return Infinity // Unlimited
    default:
      // No subscription = basic plan
      return 2
  }
}

/**
 * Get a human-readable description of the scoreboard limit
 */
export function getScoreboardLimitDescription(planTier: 'basic' | 'plus' | 'premium' | null): string {
  switch (planTier) {
    case 'basic':
      return '2'
    case 'plus':
      return '50'
    case 'premium':
      return 'Unlimited'
    default:
      return '2'
  }
}

