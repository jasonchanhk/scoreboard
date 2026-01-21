// Email validation utilities

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates if an email has the correct format
 */
export const isValidEmailFormat = (email: string): boolean => {
  return EMAIL_REGEX.test(email)
}

/**
 * Checks if an email contains plus addressing (e.g., user+tag@example.com)
 */
export const hasPlusAddressing = (email: string): boolean => {
  const [localPart] = email.split('@')
  return localPart?.includes('+') ?? false
}

