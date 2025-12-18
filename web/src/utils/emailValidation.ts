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

/**
 * Validates email and returns error message if invalid
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim()
  
  if (!trimmed) {
    return 'Email is required'
  }
  
  if (!isValidEmailFormat(trimmed)) {
    return 'Please enter a valid email address'
  }
  
  if (hasPlusAddressing(trimmed)) {
    return null // Plus addressing is handled separately with dialog
  }
  
  return null
}

