import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path: string
}

const routeMap: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/whats-new': "What's New",
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/auth': 'Log in',
}

export const Breadcrumb: React.FC = () => {
  const location = useLocation()
  const pathname = location.pathname

  // Don't show breadcrumb on home page
  if (pathname === '/') {
    return null
  }

  // Build breadcrumb items
  const items: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
  ]

  // Add current page if it's in our route map
  const currentPageLabel = routeMap[pathname]
  if (currentPageLabel && pathname !== '/') {
    items.push({ label: currentPageLabel, path: pathname })
  }

  return (
    <nav className="flex items-center text-sm text-gray-600 border-gray-200" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  &gt;
                </span>
              )}
              {isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
