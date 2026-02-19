/**
 * Build script to generate static HTML for SEO
 * This creates a pre-rendered HTML file that can be served to crawlers
 */

import { writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distDir = join(__dirname, '..', 'dist')
const assetsDir = join(distDir, 'assets')

// Find the actual JS and CSS filenames from the build
let jsFile = '/assets/index.js' // fallback
let cssFile = '/assets/index.css' // fallback

if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir)
  const jsFiles = files.filter(f => f.endsWith('.js') && f.startsWith('index'))
  const cssFiles = files.filter(f => f.endsWith('.css') && f.startsWith('index'))
  
  if (jsFiles.length > 0) {
    jsFile = `/assets/${jsFiles[0]}`
  }
  if (cssFiles.length > 0) {
    cssFile = `/assets/${cssFiles[0]}`
  }
}

// Generate the SEO-optimized static HTML
const seoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/logo.png" />
  <link rel="apple-touch-icon" href="/logo.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Free basketball scoreboard app for real-time game tracking. Track scores, manage timers, and sync to multiple devices. Share live updates with QR codes. No download required. Perfect for coaches, referees, and sports enthusiasts." />
  <meta name="keywords" content="basketball scoreboard, live scoreboard, basketball score tracker, game score tracker, basketball timer, team scoreboard, free scoreboard app, real-time scoreboard, basketball game management" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="https://prettyscoreboard.com/" />
  <title>Basketball Scoreboard - Free Online Scoreboard App | Real-Time Game Tracking</title>
  
  <!-- Open Graph / Social Media Preview -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://prettyscoreboard.com/" />
  <meta property="og:title" content="Basketball Scoreboard - Free Online Scoreboard App | Real-Time Game Tracking" />
  <meta property="og:description" content="Free basketball scoreboard app for real-time game tracking. Track scores, manage timers, and sync to multiple devices. Share live updates with QR codes. No download required." />
  <meta property="og:image" content="https://prettyscoreboard.com/og-background-default.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Pretty Scoreboard" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="Basketball Scoreboard - Free Online Scoreboard App" />
  <meta property="twitter:description" content="Real-time basketball score tracking and management" />
  <meta property="twitter:image" content="https://prettyscoreboard.com/og-background-default.png" />
  
  <!-- Structured Data for SEO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Basketball Scoreboard",
    "alternateName": "Pretty Scoreboard",
    "description": "Free basketball scoreboard app for real-time game tracking. Track scores, manage timers, and sync to multiple devices. Share live updates with QR codes. Perfect for basketball games, tournaments, and practice sessions.",
    "url": "https://prettyscoreboard.com",
    "applicationCategory": "SportsApplication",
    "applicationSubCategory": "Basketball Scoreboard",
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "keywords": "basketball scoreboard, live scoreboard, basketball score tracker, game score tracker, basketball timer, team scoreboard, free scoreboard app, real-time scoreboard, basketball game management, online scoreboard",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
    },
    "featureList": [
      "Real-time basketball score tracking",
      "Quarter timer management",
      "Team color customization",
      "QR code sharing",
      "Multi-device sync",
      "Full-screen display",
      "Game history tracking",
      "Live scoreboard updates"
    ]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pretty Scoreboard",
    "alternateName": "Basketball Scoreboard",
    "url": "https://prettyscoreboard.com",
    "logo": "https://prettyscoreboard.com/logo.png",
    "description": "Free basketball scoreboard app for real-time game tracking and management",
    "sameAs": []
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://prettyscoreboard.com"
      }
    ]
  }
  </script>
</head>
<body>
  <main style="max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
    <h1>Basketball Scoreboard - Free Online Scoreboard App</h1>
    <p style="font-size: 1.25rem; line-height: 1.6; color: #374151; margin-bottom: 2rem;">
      Free basketball scoreboard app for real-time game tracking. Track scores, manage timers, and sync to multiple devices. Share live updates with QR codes. No download required. Perfect for coaches, referees, and sports enthusiasts.
    </p>
    
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Sync Score to Multiple Devices</h2>
      <p style="line-height: 1.6; color: #4b5563;">
        Sync your score to multiple devices in real-time. View updates in real-time on any device—phones, tablets, or large displays. Anywhere around the court.
      </p>
    </section>
    
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Connect to Basketball Scoreboard</h2>
      <p style="line-height: 1.6; color: #4b5563;">
        Use share code, QR code, or public link to connect to your basketball scoreboard. No need to install any software. Anywhere around the court.
      </p>
    </section>
    
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Manage Quarter Timer</h2>
      <p style="line-height: 1.6; color: #4b5563;">
        Control game time with precision on your basketball scoreboard. Start, pause, and reset the timer for each quarter. Keep everyone synchronized with real time.
      </p>
    </section>
    
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Share your Game Summary</h2>
      <p style="line-height: 1.6; color: #4b5563;">
        Download your basketball game summary as a PNG image from the scoreboard. Share your wins on social media.
      </p>
    </section>
    
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Other Features</h2>
      <ul style="line-height: 1.8; color: #4b5563;">
        <li style="margin-bottom: 0.5rem;"><strong>Full Screen Option:</strong> Display your scoreboard in full screen mode for a distraction-free viewing experience. Perfect for large displays and presentations.</li>
        <li style="margin-bottom: 0.5rem;"><strong>View Quarter History:</strong> Track and review the history of each quarter. See detailed statistics and scores for every period of the game.</li>
        <li style="margin-bottom: 0.5rem;"><strong>Choose Team Colors:</strong> Customize team colors to match your team's branding. Make your scoreboard visually distinct and easy to follow.</li>
      </ul>
    </section>
    
    <section style="margin-bottom: 3rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Get Started</h2>
      <p style="line-height: 1.6; color: #4b5563;">
        Create your free basketball scoreboard account today. No credit card required. Start tracking your games in minutes.
      </p>
    </section>
  </main>
  
  <!-- Load the SPA for browsers that execute JavaScript -->
  <div id="root"></div>
  <script type="module" src="${jsFile}"></script>
  <link rel="stylesheet" href="${cssFile}">
</body>
</html>`

// Write the SEO HTML file to dist directory (this is what gets deployed)
const seoHtmlPath = join(distDir, 'index-seo.html')

writeFileSync(seoHtmlPath, seoHtml, 'utf-8')

console.log('✅ Generated static SEO HTML at:', seoHtmlPath)
