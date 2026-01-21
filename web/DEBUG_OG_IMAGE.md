# Debugging OG Image / Link Preview Issues

## What We Changed

1. **Moved Chromium/Puppeteer to dynamic imports** - They're only imported when `isImageRequest === true`
2. **Moved dependencies to runtime** - `@sparticuz/chromium` and `puppeteer-core` are now in `dependencies` (not `devDependencies`)
3. **Added better error handling** - More logging and error details
4. **HTML escaping** - Meta tags are properly escaped
5. **Base URL detection** - Uses environment variables or request headers

## Current Issue

The error "The input directory '/var/task/web/netlify/bin' does not exist" suggests Chromium is being initialized even for HTML requests, which shouldn't happen.

## Debugging Steps

### 1. Check Netlify Function Logs
- Go to Netlify Dashboard → Functions → `scoreboard-preview` → View logs
- Look for the "Request details" log to see:
  - `isImageRequest` value (should be `false` for HTML requests)
  - `path`, `userAgent`, `queryParams`

### 2. Verify the Deployment
- Check that the latest code is deployed
- The function should NOT have `import chromium` or `import puppeteer` at the top level
- Only dynamic imports inside `generateOGImage()` and the default image handler

### 3. Test Directly
```bash
# Test HTML endpoint (should NOT touch Chromium)
curl -k -A "WhatsApp/2.0" "https://dev--pretty-scoreboard.netlify.app/.netlify/functions/scoreboard-preview?id=56320782-491e-47c8-ac5d-e626dff03e2c"

# Check the response - should be HTML with meta tags, no Chromium errors
```

### 4. Check Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`

### 5. Possible Solutions

#### Option A: Separate Functions (Recommended)
Create two separate functions:
- `scoreboard-meta.mjs` - Only handles HTML/meta tags (no Chromium)
- `scoreboard-image.mjs` - Only handles image generation (with Chromium)

#### Option B: Make Image Optional
If Chromium fails, return HTML without the `og:image` URL. Link previews will still work, just without the image.

#### Option C: Use a Different Image Generation Method
Instead of Puppeteer, use:
- Canvas API (server-side)
- SVG generation
- Pre-rendered images

## Code Flow for HTML Requests

1. Request comes in: `/.netlify/functions/scoreboard-preview?id=...`
2. `isImageRequest` is calculated: `false` (no `?image=true`)
3. Should skip all Chromium code
4. Fetch scoreboard data from Supabase
5. Generate HTML with meta tags
6. Return HTML

**Chromium should NEVER be touched in this flow.**

## Next Steps

1. Check Netlify logs to see what's actually happening
2. Verify the deployed code matches the local code
3. Consider splitting into two functions if the issue persists
