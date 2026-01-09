// This function serves HTML with meta tags for scoreboard previews
// Use this URL for sharing: /scoreboard/:id/preview
// It always serves HTML (no crawler detection needed)

const { createClient } = require('@supabase/supabase-js')

function generateMetaHTML(scoreboard, url) {
  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  
  const team0Name = team0?.name || 'Team 1'
  const team1Name = team1?.name || 'Team 2'
  
  // Calculate scores from quarters
  const getTeamTotalScore = (teamId, quarters) => {
    return (quarters || [])
      .filter(q => q.team_id === teamId)
      .reduce((sum, q) => sum + (q.points || 0), 0)
  }
  
  const score0 = team0 ? getTeamTotalScore(team0.id, scoreboard.quarters || []) : 0
  const score1 = team1 ? getTeamTotalScore(team1.id, scoreboard.quarters || []) : 0
  
  const title = `${team0Name} vs ${team1Name} - Live Scoreboard`
  const description = `Live score: ${team0Name} ${score0} - ${score1} ${team1Name} on Pretty Scoreboard`
  const siteName = 'Pretty Scoreboard'
  
  // Generate preview image URL
  const imageUrl = `${new URL(url).origin}/.netlify/functions/og-image?id=${scoreboard.id}`
  const viewUrl = url.replace('/preview', '/view')
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${viewUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${viewUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${imageUrl}">
  
  <!-- Redirect to actual page -->
  <meta http-equiv="refresh" content="0; url=${viewUrl}">
  <link rel="canonical" href="${viewUrl}">
</head>
<body>
  <script>window.location.href = '${viewUrl}';</script>
  <p>Redirecting to <a href="${viewUrl}">${title}</a>...</p>
</body>
</html>`
}

exports.handler = async (event, context) => {
  try {
    const path = event.path || event.rawPath || ''
    
    // Extract scoreboard ID from path: /scoreboard/:id/preview
    const pathMatch = path.match(/\/scoreboard\/([^/]+)\/preview/)
    let scoreboardId = pathMatch ? pathMatch[1] : null
    
    // Fallback to query string
    if (!scoreboardId && event.queryStringParameters && event.queryStringParameters.id) {
      scoreboardId = event.queryStringParameters.id
    }
    
    if (!scoreboardId) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<!DOCTYPE html><html><head><title>Scoreboard not found</title></head><body><h1>Scoreboard not found</h1></body></html>',
      }
    }
    
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Server configuration error</h1></body></html>',
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
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<!DOCTYPE html><html><head><title>Scoreboard not found</title></head><body><h1>Scoreboard not found</h1></body></html>',
      }
    }
    
    // Fetch teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('scoreboard_id', scoreboardId)
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
    }
    
    // Fetch quarters for score calculation
    const teamIds = (teams || []).map(t => t.id)
    let quarters = []
    if (teamIds.length > 0) {
      const { data: quartersData, error: quartersError } = await supabase
        .from('quarters')
        .select('*')
        .in('team_id', teamIds)
      
      if (!quartersError && quartersData) {
        quarters = quartersData
      }
    }
    
    // Combine data
    const scoreboardWithData = {
      ...scoreboard,
      teams: teams || [],
      quarters: quarters,
    }
    
    // Build the full URL
    const protocol = event.headers['x-forwarded-proto'] || event.headers['X-Forwarded-Proto'] || 'https'
    const host = event.headers.host || event.headers.Host
    const fullUrl = `${protocol}://${host}${path}`
    
    // Generate HTML with meta tags
    const html = generateMetaHTML(scoreboardWithData, fullUrl)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    }
  } catch (error) {
    console.error('Error in scoreboard-preview function:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>An error occurred</h1></body></html>',
    }
  }
}

