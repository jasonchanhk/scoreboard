/**
 * Scoreboard OG Image Page
 * Renders the OG image for a specific scoreboard with team names
 */

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Team {
  id: string
  name: string
  color: string
  logo_url?: string | null
}

export const ScoreboardOGImage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const scoreboardId = searchParams.get('id')
  
  const [team0, setTeam0] = useState<Team | null>(null)
  const [team1, setTeam1] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [team0FontSize, setTeam0FontSize] = useState(80)
  const [team1FontSize, setTeam1FontSize] = useState(80)
  const team0Ref = useRef<HTMLDivElement>(null)
  const team1Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scoreboardId) {
      setLoading(false)
      return
    }

    const fetchTeams = async () => {
      try {
        const { data: teams, error } = await supabase
          .from('teams')
          .select('*')
          .eq('scoreboard_id', scoreboardId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching teams:', error)
          setLoading(false)
          return
        }

        if (teams && teams.length >= 2) {
          setTeam0(teams[0])
          setTeam1(teams[1])
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [scoreboardId])

  const team0Name = team0?.name || 'Team 1'
  const team1Name = team1?.name || 'Team 2'
  const team0Color = team0?.color || '#9333ea'
  const team1Color = team1?.color || '#f97316'

  // Adjust font size dynamically to prevent overflow
  useEffect(() => {
    const adjustFontSize = (element: HTMLDivElement | null, setFontSize: (size: number) => void, maxWidth: number) => {
      if (!element) return
      
      const maxFontSize = 80
      const minFontSize = 40
      let fontSize = maxFontSize
      
      // Create a temporary span to measure text width
      const tempSpan = document.createElement('span')
      tempSpan.style.visibility = 'hidden'
      tempSpan.style.position = 'absolute'
      tempSpan.style.whiteSpace = 'nowrap'
      tempSpan.style.fontSize = `${fontSize}px`
      tempSpan.style.fontWeight = 'bold'
      tempSpan.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
      tempSpan.textContent = element.textContent || ''
      document.body.appendChild(tempSpan)
      
      // Binary search for the right font size
      while (fontSize > minFontSize && tempSpan.offsetWidth > maxWidth) {
        fontSize -= 2
        tempSpan.style.fontSize = `${fontSize}px`
      }
      
      document.body.removeChild(tempSpan)
      setFontSize(Math.max(fontSize, minFontSize))
    }

    if (!loading && team0Name && team1Name) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        adjustFontSize(team0Ref.current, setTeam0FontSize, 700)
        adjustFontSize(team1Ref.current, setTeam1FontSize, 700)
      }, 100)
    }
  }, [loading, team0Name, team1Name])

  // Show loading state while fetching
  if (loading) {
    return (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        backgroundImage: 'url(/og-background-scoreboard.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      }}
    >
      
      {/* Team names in bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          right: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: 'flex-end',
        }}
      >
        <div
          ref={team0Ref}
          style={{
            fontSize: `${team0FontSize}px`,
            fontWeight: 'bold',
            color: team0Color,
            textAlign: 'right',
            lineHeight: 1.1,
            maxWidth: '700px',
            whiteSpace: 'nowrap',
          }}
        >
          {team0Name}
        </div>
        <div
          ref={team1Ref}
          style={{
            fontSize: `${team1FontSize}px`,
            fontWeight: 'bold',
            color: team1Color,
            textAlign: 'right',
            lineHeight: 1.1,
            maxWidth: '700px',
            whiteSpace: 'nowrap',
          }}
        >
          {team1Name}
        </div>
      </div>
    </div>
  )
}
