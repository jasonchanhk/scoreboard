# Netlify Setup for Link Previews

## Overview

This setup enables link previews (with images) when sharing scoreboard URLs (`/scoreboard/:id/view`) on WhatsApp, Signal, Telegram, and other messaging apps.

## How It Works

1. **Netlify Function for Meta Tags** (`netlify/functions/scoreboard-meta.js`)
   - Intercepts requests to `/scoreboard/:id/view`
   - Detects crawlers (WhatsApp, Signal, Telegram bots) vs regular browsers
   - For crawlers: Returns HTML with Open Graph meta tags
   - For browsers: Returns HTML with meta tags + script to load the SPA
   - Fetches scoreboard data from Supabase

2. **Netlify Function for Preview Image** (`netlify/functions/og-image.js`)
   - Generates a preview image (currently SVG, can be upgraded to PNG)
   - Shows team names and scores
   - Returns the image that appears in link previews

3. **Client-Side Meta Tags** (in `ScoreboardDisplay.tsx`)
   - Sets meta tags dynamically for platforms that execute JavaScript
   - Works as a fallback for Facebook, Twitter, LinkedIn

## Configuration

### 1. Netlify Redirects

The `netlify.toml` file includes a redirect rule that routes `/scoreboard/:id/view` to the function:

```toml
[[redirects]]
  from = "/scoreboard/:id/view"
  to = "/.netlify/functions/scoreboard-meta"
  status = 200
  force = true
```

This ensures all requests to scoreboard view URLs go through the function first.

### 2. Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

- `VITE_SUPABASE_URL` or `SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` - Your Supabase anon key

The functions will automatically use these to connect to Supabase.

### 3. Function Location

Functions are located in `web/netlify/functions/`:
- `scoreboard-meta.js` - Handles meta tags for `/scoreboard/:id/view`
- `og-image.js` - Generates preview images

Netlify automatically detects and deploys functions in this directory.

## How It Works for Different Platforms

### Crawlers (WhatsApp, Signal, Telegram)
1. Crawler requests `/scoreboard/:id/view`
2. Netlify routes to `scoreboard-meta` function
3. Function detects crawler via User-Agent
4. Function fetches scoreboard data from Supabase
5. Function returns HTML with Open Graph meta tags
6. Crawler reads meta tags and displays preview

### Regular Browsers
1. Browser requests `/scoreboard/:id/view`
2. Netlify routes to `scoreboard-meta` function
3. Function detects it's a browser (not a crawler)
4. Function returns HTML with meta tags + script to load SPA
5. Browser loads the React SPA normally

## Testing

### 1. Test the Meta Function

Test with a crawler user agent:
```bash
curl -A "WhatsApp/2.0" https://yoursite.netlify.app/scoreboard/{scoreboard-id}/view
```

You should see HTML with meta tags.

### 2. Test the Image Function

Visit directly:
```
https://yoursite.netlify.app/.netlify/functions/og-image?id={scoreboard-id}
```

You should see an SVG image.

### 3. Test Link Previews

Use these tools to test link previews:
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### 4. Test in Messaging Apps

1. Share a scoreboard URL (`/scoreboard/:id/view`) in WhatsApp/Signal/Telegram
2. The preview should show:
   - Title: "{Team A} vs {Team B} - Live Scoreboard"
   - Description: "Live score: {Team A} {score} - {score} {Team B} on Pretty Scoreboard"
   - Image: Preview image with team names and scores

## Troubleshooting

### Preview Not Showing

1. **Check environment variables** - Make sure Supabase credentials are set in Netlify
2. **Check function logs** - Go to Netlify Dashboard → Functions → View logs
3. **Test the function directly** - Use curl with a crawler user agent
4. **Clear cache** - Some platforms cache previews, use their debugger tools to refresh

### Function Not Being Called

1. **Check `netlify.toml`** - Make sure the redirect rule is present
2. **Check function location** - Functions should be in `netlify/functions/`
3. **Redeploy** - Push changes to trigger a new deployment

### Image Not Loading

1. **Check image function** - Test the `og-image` function directly
2. **Check image URL in meta tags** - Should point to `/.netlify/functions/og-image?id={id}`
3. **Check CORS** - Make sure the image function returns proper headers

## Future Improvements

1. **Upgrade to PNG images** - Currently using SVG, can upgrade to PNG for better compatibility
2. **Add caching** - Cache generated images to reduce function calls
3. **Dynamic image generation** - Use canvas or puppeteer to generate more detailed preview images
4. **Edge Functions** - Consider upgrading to Netlify Edge Functions for better performance

## Files Reference

- `netlify/functions/scoreboard-meta.js` - Main function for meta tags
- `netlify/functions/og-image.js` - Function for preview images
- `netlify.toml` - Netlify configuration with redirect rules
- `src/pages/ScoreboardDisplay.tsx` - Client-side meta tags (fallback)

