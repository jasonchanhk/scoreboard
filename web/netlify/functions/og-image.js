// This function generates a preview image for the scoreboard
// Returns PNG image for better compatibility with messaging apps

const { createClient } = require('@supabase/supabase-js')
const { Resvg } = require('@resvg/resvg-js')

// Helper to escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Note: This is a simplified version. For full image generation, you might want to use
// a library like canvas or puppeteer, or generate the image client-side and cache it.
// For now, we'll return a placeholder or redirect to a generated image.

exports.handler = async (event, context) => {
  try {
    const scoreboardId = event.queryStringParameters?.id
    
    if (!scoreboardId) {
      return {
        statusCode: 400,
        body: 'Missing scoreboard ID',
      }
    }
    
    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: 'Server configuration error',
      }
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Fetch scoreboard data
    const { data: scoreboard, error: scoreboardError } = await supabase
      .from('scoreboards')
      .select('*')
      .eq('id', scoreboardId)
      .single()
    
    if (scoreboardError || !scoreboard) {
      return {
        statusCode: 404,
        body: 'Scoreboard not found',
      }
    }
    
    // Fetch teams and quarters
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .eq('scoreboard_id', scoreboardId)
    
    const teamIds = (teams || []).map(t => t.id)
    let quarters = []
    if (teamIds.length > 0) {
      const { data: quartersData } = await supabase
        .from('quarters')
        .select('*')
        .in('team_id', teamIds)
      quarters = quartersData || []
    }
    
    // For now, return a simple SVG placeholder
    // TODO: Generate actual PNG using canvas or similar
    const team0 = teams?.[0]
    const team1 = teams?.[1]
    const team0Name = team0?.name || 'Team 1'
    const team1Name = team1?.name || 'Team 2'
    
    const getTeamTotalScore = (teamId) => {
      return (quarters || [])
        .filter(q => q.team_id === teamId)
        .reduce((sum, q) => sum + (q.points || 0), 0)
    }
    
    const score0 = team0 ? getTeamTotalScore(team0.id) : 0
    const score1 = team1 ? getTeamTotalScore(team1.id) : 0
    
    // Generate SVG first
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ffffff"/>
  <text x="600" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#111827">${escapeXml(team0Name)} vs ${escapeXml(team1Name)}</text>
  <text x="300" y="350" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="${team0?.color || '#ef4444'}">${score0}</text>
  <text x="900" y="350" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="${team1?.color || '#3b82f6'}">${score1}</text>
  <text x="600" y="550" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#6b7280">Pretty Scoreboard</text>
</svg>`
    
    try {
      // Convert SVG to PNG using resvg
      const resvg = new Resvg(svg, {
        background: 'white',
        fitTo: {
          mode: 'width',
          value: 1200,
        },
      })
      const pngData = resvg.render()
      const pngBuffer = pngData.asPng()
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
        body: pngBuffer.toString('base64'),
        isBase64Encoded: true,
      }
    } catch (error) {
      console.error('Error converting SVG to PNG, falling back to SVG:', error)
      // Fallback to SVG if PNG conversion fails
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
        body: svg,
      }
    }
  } catch (error) {
    console.error('Error generating OG image:', error)
    return {
      statusCode: 500,
      body: 'Error generating image',
    }
  }
}

