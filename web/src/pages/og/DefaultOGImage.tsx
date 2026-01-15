/**
 * Default OG Image Page
 * Shows the default OG image for pages that don't have a specific scoreboard
 * Used as the default link preview for all pages
 */

import React from 'react'

export const DefaultOGImage: React.FC = () => {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        backgroundImage: 'url(/og-background-default.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  )
}
