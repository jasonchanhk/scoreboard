/**
 * Function for scoreboard HTML meta tags only
 * This function NEVER touches Chromium/Puppeteer
 * Used for link previews on social media platforms
 */

import { createClient } from '@supabase/supabase-js'

// Common crawler user agents
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'WhatsApp',
  'whatsapp',
  'Signal',
  'signal',
  'Twitterbot',
  'LinkedInBot',
  'TelegramBot',
  'Telegram',
  'telegram',
  'Slackbot',
  'Discordbot',
  'Applebot',
  'Googlebot',
  'bingbot',
  'YandexBot',
  'Baiduspider',
  'curl',
  'Wget',
]

function isCrawler(userAgent) {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()))
}

function getTeamTotalScore(teamId, quarters) {
  return (quarters || [])
    .filter(q => q.team_id === teamId)
    .reduce((sum, q) => sum + (q.points || 0), 0)
}

function escapeHtml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function generateMetaHTML(scoreboard, url, imageUrl, isCrawlerBot) {
  const team0 = scoreboard.teams?.[0]
  const team1 = scoreboard.teams?.[1]
  
  const team0Name = team0?.name || 'Team 1'
  const team1Name = team1?.name || 'Team 2'
  
  const score0 = team0 ? getTeamTotalScore(team0.id, scoreboard.quarters || []) : 0
  const score1 = team1 ? getTeamTotalScore(team1.id, scoreboard.quarters || []) : 0
  
  const title = `${team0Name} vs ${team1Name} - Live Scoreboard`
  const description = `Live score: ${team0Name} ${score0} - ${score1} ${team1Name} on Pretty Scoreboard`
  const siteName = 'Pretty Scoreboard'
  
  // Escape HTML entities for safe rendering
  const escapedTitle = escapeHtml(title)
  const escapedDescription = escapeHtml(description)
  const escapedUrl = escapeHtml(url)
  const escapedImageUrl = escapeHtml(imageUrl)
  const escapedSiteName = escapeHtml(siteName)
  
  if (isCrawlerBot) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <meta name="title" content="${escapedTitle}">
  <meta name="description" content="${escapedDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapedUrl}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${escapedImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:site_name" content="${escapedSiteName}">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapedUrl}">
  <meta property="twitter:title" content="${escapedTitle}">
  <meta property="twitter:description" content="${escapedDescription}">
  <meta property="twitter:image" content="${escapedImageUrl}">
  <link rel="canonical" href="${escapedUrl}">
</head>
<body>
  <h1>${escapedTitle}</h1>
  <p>${escapedDescription}</p>
  <p><a href="${escapedUrl}">View Live Scoreboard</a></p>
</body>
</html>`
  }
  
  // For browsers, return HTML with meta tags and SPA script
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <meta name="title" content="${escapedTitle}">
  <meta name="description" content="${escapedDescription}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapedUrl}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${escapedImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:site_name" content="${escapedSiteName}">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapedUrl}">
  <meta property="twitter:title" content="${escapedTitle}">
  <meta property="twitter:description" content="${escapedDescription}">
  <meta property="twitter:image" content="${escapedImageUrl}">
  <link rel="canonical" href="${escapedUrl}">
  <script>
    if (typeof window !== 'undefined' && window.document) {
      fetch('/index.html?spa=true')
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const scripts = doc.querySelectorAll('script[type="module"]');
          const links = doc.querySelectorAll('link[rel="stylesheet"]');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.type = 'module';
            newScript.src = script.src;
            document.head.appendChild(newScript);
          });
          links.forEach(link => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.href;
            document.head.appendChild(newLink);
          });
          if (!document.getElementById('root')) {
            const root = document.createElement('div');
            root.id = 'root';
            document.body.appendChild(root);
          }
        })
        .catch(() => {
          window.location.href = '/index.html';
        });
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <p>Please enable JavaScript to view this scoreboard.</p>
    <p><a href="${escapedUrl}">View Scoreboard</a></p>
  </noscript>
</body>
</html>`
}

export const handler = async (event, context) => {
  try {
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'] || ''
    const path = event.path || event.rawPath || ''
    const host = event.headers['host'] || event.headers['Host'] || ''
    const protocol = event.headers['x-forwarded-proto'] || 'https'
    
    // Extract scoreboard ID
    let scoreboardId = null
    if (event.queryStringParameters && event.queryStringParameters.id) {
      scoreboardId = event.queryStringParameters.id
    } else {
      const pathMatch = path.match(/\/scoreboard\/([^/]+)\/view/)
      scoreboardId = pathMatch ? pathMatch[1] : null
    }
    
    if (!scoreboardId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: '<!DOCTYPE html><html><head><title>Scoreboard not found</title></head><body><h1>Scoreboard not found</h1></body></html>',
      }
    }
    
    // Initialize base URL
    let baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL
    if (!baseUrl && host) {
      baseUrl = `${protocol}://${host}`
    }
    if (!baseUrl) {
      baseUrl = 'http://localhost:5173'
    }
    baseUrl = baseUrl.replace(/\/$/, '')
    
    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/html' },
        body: '<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>Server configuration error</h1></body></html>',
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
        headers: { 'Content-Type': 'text/html' },
        body: '<!DOCTYPE html><html><head><title>Scoreboard not found</title></head><body><h1>Scoreboard not found</h1></body></html>',
      }
    }
    
    // Fetch teams
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .eq('scoreboard_id', scoreboardId)
    
    // Fetch quarters
    const teamIds = (teams || []).map(t => t.id)
    let quarters = []
    if (teamIds.length > 0) {
      const { data: quartersData } = await supabase
        .from('quarters')
        .select('*')
        .in('team_id', teamIds)
      quarters = quartersData || []
    }
    
    scoreboard.teams = teams || []
    scoreboard.quarters = quarters
    
    // Generate absolute URLs
    const url = `${baseUrl}/scoreboard/${scoreboardId}/view`
    // Point to the image function (scoreboard-preview handles images)
    const imageUrl = `${baseUrl}/.netlify/functions/scoreboard-preview?id=${encodeURIComponent(scoreboardId)}&image=true`
    
    const isCrawlerBot = isCrawler(userAgent)
    
    const html = generateMetaHTML(scoreboard, url, imageUrl, isCrawlerBot)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
      },
      body: html,
    }
  } catch (error) {
    console.error('Error in scoreboard-meta:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Server Error</h1><p>${error.message}</p></body></html>`,
    }
  }
}
