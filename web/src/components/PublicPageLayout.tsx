import React from 'react'
import { Link } from 'react-router-dom'
import { AppNav } from './AppNav'
import { UserMenu } from './UserMenu'
import { Breadcrumb } from './Breadcrumb'
import { useAuth } from '../contexts/AuthContext'

interface PublicPageLayoutProps {
  children: React.ReactNode
  showBreadcrumb?: boolean
}

export const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ 
  children, 
  showBreadcrumb = true 
}) => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <AppNav
        leftContent={
          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              to="/whats-new"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              What's New
            </Link>
          </div>
        }
        rightContent={
          user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                Log in
              </Link>
            </div>
          )
        }
      />
      {showBreadcrumb && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb />
          </div>
        </div>
      )}
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-gray-600 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Scoreboard. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-gray-900">
              About
            </Link>
            <Link to="/whats-new" className="hover:text-gray-900">
              What's New
            </Link>
            <Link to="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
            <a href="mailto:support@scoreboard.app" className="hover:text-gray-900">
              Support
            </a>
            <Link to="/auth" className="hover:text-gray-900">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
