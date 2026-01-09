const { createClient } = require('@supabase/supabase-js')

// Common crawler user agents
// WhatsApp uses "WhatsApp" in user agent
// Signal uses "Signal" in user agent
// Telegram uses "TelegramBot" or "Telegram"
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'WhatsApp',
  'whatsapp', // lowercase variant
  'Signal',
  'signal', // lowercase variant
  'Twitterbot',
  'LinkedInBot',
  'TelegramBot',
  'Telegram',
  'telegram', // lowercase variant
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

function generateMetaHTML(scoreboard, url, isCrawler) {
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
  
  // Generate preview image URL using Netlify Edge Function
  const imageUrl = `${new URL(url).origin}/.netlify/edge-functions/og-image?id=${scoreboard.id}`
  
  // For crawlers, return simple HTML with meta tags
  // For browsers, include SPA script tags so the app loads
  if (isCrawler) {
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
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${url}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${imageUrl}">
  
  <link rel="canonical" href="${url}">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p><a href="${url}">View Live Scoreboard</a></p>
</body>
</html>`
  }
  
  // For browsers, return HTML with meta tags and a script that loads the SPA
  // The script will fetch the actual index.html and replace the current document
  // This way, crawlers see the meta tags, and browsers get the SPA
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏀</text></svg>">
  
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${url}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${imageUrl}">
  
  <link rel="canonical" href="${url}">
  
  <!-- Load SPA for browsers -->
  <script>
    // Only load SPA if we're in a browser (not a crawler)
    if (typeof window !== 'undefined' && window.document) {
      // Fetch index.html and replace current document
      fetch('/index.html?spa=true')
        .then(response => response.text())
        .then(html => {
          // Parse and inject the SPA
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const scripts = doc.querySelectorAll('script[type="module"]');
          const links = doc.querySelectorAll('link[rel="stylesheet"]');
          
          // Add scripts and styles to current document
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
          
          // Keep the root div
          if (!document.getElementById('root')) {
            const root = document.createElement('div');
            root.id = 'root';
            document.body.appendChild(root);
          }
        })
        .catch(() => {
          // Fallback: redirect to index.html
          window.location.href = '/index.html';
        });
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <p>Please enable JavaScript to view this scoreboard.</p>
    <p><a href="${url}">View Scoreboard</a></p>
  </noscript>
</body>
</html>`
}

exports.handler = async (event, context) => {
  try {
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'] || ''
    const path = event.path || event.rawPath || ''
    
    // Extract scoreboard ID - prioritize query parameter (from redirect), then path
    let scoreboardId = null
    if (event.queryStringParameters && event.queryStringParameters.id) {
      scoreboardId = event.queryStringParameters.id
    } else {
      // Fallback: extract from path format: /scoreboard/:id/view
      const pathMatch = path.match(/\/scoreboard\/([^/]+)\/view/)
      scoreboardId = pathMatch ? pathMatch[1] : null
    }
    
    if (!scoreboardId) {
      // If no ID, serve the SPA index.html for browsers
      if (!isCrawler(userAgent)) {
        // Read and return index.html (this will be handled by Netlify's default routing)
        return {
          statusCode: 302,
          headers: {
            Location: '/index.html',
          },
        }
      }
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<!DOCTYPE html><html><head><title>Scoreboard not found</title></head><body><h1>Scoreboard not found</h1></body></html>',
      }
    }
    
    // For regular browsers (not crawlers), we still serve HTML with meta tags
    // but include a script that loads the SPA
    // This ensures meta tags are always present for SEO and social sharing
    // The generateMetaHTML function handles both crawlers and browsers
    
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
    const fullPath = `/scoreboard/${scoreboardId}/view`
    const fullUrl = `${protocol}://${host}${fullPath}`
    
    // Check if it's a crawler
    const crawler = isCrawler(userAgent)
    
    // Generate HTML with meta tags
    const html = generateMetaHTML(scoreboardWithData, fullUrl, crawler)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    }
  } catch (error) {
    console.error('Error in scoreboard-meta function:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>An error occurred</h1></body></html>',
    }
  }
}
