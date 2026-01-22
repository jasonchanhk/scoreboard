/**
 * Function for scoreboard link previews
 * Handles HTML meta tags for crawlers and serves static OG images
 * Uses static PNG files - simple and reliable
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
// Static PNG serving - reads from public folder

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

// Serve static PNG files from public folder
function serveStaticPNG(imageName) {
  try {
    // Try multiple possible paths for the public folder
    // In Netlify Functions, the structure might vary
    const possiblePaths = [
      join(process.cwd(), '..', '..', 'public', imageName), // netlify/functions -> web/public
      join(process.cwd(), '..', '..', '..', 'public', imageName), // if nested deeper
      join(process.cwd(), 'public', imageName), // if public is in function dir
      join('/var/task', 'public', imageName), // Netlify deployment path
    ]
    
    for (const imagePath of possiblePaths) {
      try {
        const imageBuffer = readFileSync(imagePath)
        return imageBuffer
      } catch (err) {
        // Try next path
        continue
      }
    }
    
    throw new Error(`Could not find ${imageName} in any expected location`)
  } catch (error) {
    console.error(`Error reading static image ${imageName}:`, error)
    throw new Error(`Failed to load image: ${error.message}`)
  }
}

export const handler = async (event, context) => {
  try {
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'] || ''
    const path = event.path || event.rawPath || ''
    const acceptHeader = event.headers['accept'] || event.headers['Accept'] || ''
    const host = event.headers['host'] || event.headers['Host'] || ''
    const protocol = event.headers['x-forwarded-proto'] || 'https'
    
    // Determine if this is an image request or HTML request
    // Only treat as image request if query parameter explicitly says image=true
    // Browsers send Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/*;q=0.8
    // So we can't rely on Accept header alone - must check query param
    const isImageRequest = event.queryStringParameters?.image === 'true'
    
    // Initialize base URL
    // Priority: process.env.URL > process.env.DEPLOY_PRIME_URL > host header > localhost
    let baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL
    if (!baseUrl && host) {
      baseUrl = `${protocol}://${host}`
    }
    if (!baseUrl) {
      baseUrl = 'http://localhost:5173'
    }
    
    // Ensure baseUrl doesn't have trailing slash
    baseUrl = baseUrl.replace(/\/$/, '')
    
    // Extract scoreboard ID (needed for HTML requests)
    let scoreboardId = null
    if (event.queryStringParameters && event.queryStringParameters.id) {
      scoreboardId = event.queryStringParameters.id
    } else {
      const pathMatch = path.match(/\/scoreboard\/([^/]+)\/view/)
      scoreboardId = pathMatch ? pathMatch[1] : null
    }
    
    // Handle image requests - serve static default image for all
    if (isImageRequest) {
      try {
        const pngBuffer = serveStaticPNG('og-background-default.png')
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          },
          body: pngBuffer.toString('base64'),
          isBase64Encoded: true,
        }
      } catch (error) {
        console.error('Error serving image:', error)
        // Fallback: redirect to static file
        return {
          statusCode: 302,
          headers: {
            'Location': `${baseUrl}/og-background-default.png`,
          },
          body: '',
        }
      }
    }
    
    // HTML requests need a scoreboard ID
    if (!scoreboardId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: '<!DOCTYPE html><html><head><title>Scoreboard not found</title></head><body><h1>Scoreboard not found</h1></body></html>',
      }
    }
    
    // Initialize Supabase (needed for scoreboard data)
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
    
    // Return HTML with meta tags
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
    // Use default OG image for all endpoints - simple and reliable
    const imageUrl = `${baseUrl}/og-background-default.png`
    
    // Fix isCrawler check (can't use window in server context)
    const isCrawlerBot = isCrawler(userAgent)
    
    console.log('Generated URLs:', { url, imageUrl, isCrawlerBot })
    
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
    console.error('Error in scoreboard-preview:', error)
    console.error('Error stack:', error.stack)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Server Error</h1><p>${error.message}</p></body></html>`,
    }
  }
}
