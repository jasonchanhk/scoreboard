import { useEffect } from 'react'

interface MetaTagsOptions {
  title: string
  description: string
  imageUrl: string
  pageUrl: string
  siteName?: string
}

/**
 * Custom hook to set meta tags for SEO and social sharing
 * Sets Open Graph, Twitter Card, and standard meta tags
 */
export const useMetaTags = (options: MetaTagsOptions | null) => {
  useEffect(() => {
    if (!options) return

    const { title, description, imageUrl, pageUrl, siteName = 'Pretty Scoreboard' } = options

    // Helper to set or update a meta tag
    const setMetaTag = (property: string, content: string) => {
      if (!content) return // Skip empty values

      let element =
        document.querySelector(`meta[property="${property}"]`) ||
        document.querySelector(`meta[name="${property}"]`)

      if (!element) {
        element = document.createElement('meta')
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property)
        } else {
          element.setAttribute('name', property)
        }
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Set document title
    document.title = title

    // Open Graph tags
    setMetaTag('og:type', 'website')
    setMetaTag('og:url', pageUrl)
    setMetaTag('og:title', title)
    setMetaTag('og:description', description)
    setMetaTag('og:image', imageUrl)
    setMetaTag('og:image:width', '1200')
    setMetaTag('og:image:height', '630')
    setMetaTag('og:site_name', siteName)

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:url', pageUrl)
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', imageUrl)

    // Standard meta tags
    setMetaTag('description', description)
  }, [options])
}

