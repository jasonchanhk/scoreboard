import React from 'react'
import { Link } from 'react-router-dom'
import { AppNav } from './AppNav'
import { UserMenu } from './UserMenu'
import { Footer } from './Footer'
import { useAuth } from '../contexts/AuthContext'

interface PublicPageLayoutProps {
  children: React.ReactNode
}

export const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ 
  children
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
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
