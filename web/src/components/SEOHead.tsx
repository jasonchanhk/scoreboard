import { useEffect } from 'react'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
}

/**
 * Component to dynamically update SEO meta tags per route
 * This helps with SEO by setting page-specific meta tags
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://prettyscoreboard.com/og-background-default.png',
  ogType = 'website',
  noindex = false,
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title
    }

    // Helper to set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      if (!content) return

      const selector = isProperty
        ? `meta[property="${property}"]`
        : `meta[name="${property}"]`

      let element = document.querySelector(selector)

      if (!element) {
        element = document.createElement('meta')
        if (isProperty) {
          element.setAttribute('property', property)
        } else {
          element.setAttribute('name', property)
        }
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Update description
    if (description) {
      setMetaTag('description', description)
      setMetaTag('og:description', description, true)
      setMetaTag('twitter:description', description, true)
    }

    // Update keywords
    if (keywords) {
      setMetaTag('keywords', keywords)
    }

    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }

    // Update Open Graph tags
    if (title) {
      setMetaTag('og:title', title, true)
      setMetaTag('twitter:title', title, true)
    }

    setMetaTag('og:type', ogType, true)
    setMetaTag('og:image', ogImage, true)
    setMetaTag('twitter:image', ogImage, true)

    // Update robots
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    }
  }, [title, description, keywords, canonical, ogImage, ogType, noindex])

  return null
}
