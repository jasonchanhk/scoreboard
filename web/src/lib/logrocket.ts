import LogRocket from 'logrocket'

// Initialize LogRocket
LogRocket.init('jc/pretty-scoreboard')

// Identify user in LogRocket (optional but recommended)
export const identifyUser = (userId: string, email?: string, name?: string) => {
  const userData: { email?: string; name?: string } = {}
  if (email) userData.email = email
  if (name) userData.name = name
  
  LogRocket.identify(userId, userData)
}

