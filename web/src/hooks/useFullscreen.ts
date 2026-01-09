import { useState, useEffect } from 'react'

/**
 * Custom hook to handle fullscreen functionality
 * Returns the fullscreen state and a toggle function
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Listen for fullscreen changes (user pressing ESC, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
      // Update state to reflect actual fullscreen status
      setIsFullscreen(!!document.fullscreenElement)
    }
  }

  return { isFullscreen, toggleFullscreen }
}

