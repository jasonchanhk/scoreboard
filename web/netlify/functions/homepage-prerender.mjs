/**
 * Netlify Function to serve static pre-rendered HTML for the homepage
 * Reads from index-seo.html generated during build
 * This ensures search engines see the full content even if they don't execute JavaScript
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Common crawler user agents
const CRAWLER_USER_AGENTS = [
  'Googlebot',
  'googlebot',
  'bingbot',
  'Bingbot',
  'YandexBot',
  'yandex',
  'Baiduspider',
  'baiduspider',
  'Slurp',
  'DuckDuckBot',
  'facebookexternalhit',
  'WhatsApp',
  'whatsapp',
  'Twitterbot',
  'LinkedInBot',
  'Applebot',
  'curl',
  'Wget',
  'SemrushBot',
  'AhrefsBot',
  'MJ12bot',
]

function isCrawler(userAgent) {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()))
}

// Try to read the static SEO HTML file generated during build
function getPrerenderedHTML() {
  try {
    // In Netlify, the dist folder is the publish directory (root)
    // Functions can access files relative to the site root
    // Try multiple possible paths
    const possiblePaths = [
      join('/opt', 'buildhome', 'repo', 'web', 'dist', 'index-seo.html'), // Netlify build path
      join(process.cwd(), '..', 'dist', 'index-seo.html'), // Relative to function
      join(process.cwd(), 'dist', 'index-seo.html'), // Current directory
    ]
    
    for (const path of possiblePaths) {
      try {
        if (existsSync(path)) {
          return readFileSync(path, 'utf-8')
        }
      } catch (e) {
        // Try next path
        continue
      }
    }
    
    throw new Error('Could not find index-seo.html in any expected location')
  } catch (error) {
    console.error('Could not read index-seo.html, using minimal fallback:', error.message)
    // Minimal fallback - just redirect to SPA if file not found
    // In production, this should never happen if build script runs correctly
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Basketball Scoreboard - Free Online Scoreboard App</title>
  <meta name="description" content="Free basketball scoreboard app for real-time game tracking." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://prettyscoreboard.com/" />
  <script>window.location.href = '/index.html';</script>
</head>
<body>
  <p>Loading...</p>
  <p><a href="/index.html">Click here if you are not redirected</a></p>
</body>
</html>`
  }
}

export const handler = async (event) => {
  try {
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'] || ''
    const isCrawlerBot = isCrawler(userAgent)
    
    // For crawlers, serve pre-rendered HTML from static file
    if (isCrawlerBot) {
      const prerenderedHtml = getPrerenderedHTML()
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
        body: prerenderedHtml,
      }
    }
    
    // For regular browsers, redirect to the SPA
    return {
      statusCode: 302,
      headers: {
        'Location': '/index.html',
        'Cache-Control': 'public, max-age=300',
      },
      body: '',
    }
  } catch (error) {
    console.error('Error in homepage-prerender:', error)
    // On error, let Netlify serve the normal index.html
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '',
    }
  }
}
