import { toPng } from 'html-to-image'
import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { ScoreboardSummary } from '../components/ScoreboardSummary'
import type { Team, Quarter } from '../types/scoreboard'

interface GenerateImageOptions {
  teams: Team[]
  allQuarters: Quarter[]
  currentQuarter: number
  gameDate?: string | null
  venue?: string | null
}

export const generateScoreboardPNG = async ({ 
  teams, 
  allQuarters, 
  currentQuarter,
  gameDate, 
  venue 
}: GenerateImageOptions): Promise<void> => {
  if (!teams || teams.length < 2) {
    throw new Error('Need at least 2 teams to generate image')
  }

  // Create a temporary container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  container.style.width = '1050px'
  container.style.height = '1350px'
  container.style.overflow = 'hidden'
  document.body.appendChild(container)

  // Create root and render component
  const root: Root = createRoot(container)
  
  root.render(
    React.createElement(ScoreboardSummary, {
      teams,
      allQuarters,
      currentQuarter,
      gameDate,
      venue
    })
  )

  // Wait for rendering to complete (fonts, images, etc.)
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    // Get the rendered element (first child should be our component)
    const element = container.firstChild as HTMLElement
    if (!element) {
      throw new Error('Failed to render component')
    }

    // Convert to PNG
    const dataUrl = await toPng(element, {
      width: 1050,
      height: 1350,
      pixelRatio: 2, // Higher quality
      backgroundColor: '#ffffff',
      cacheBust: true,
    })

    // Download the image
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `scoreboard-${teams[0].name}-vs-${teams[1].name}-${new Date().toISOString().split('T')[0]}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    // Cleanup
    root.unmount()
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}
