import React from 'react'
import { AppNav } from './AppNav'
import { UserMenu } from './UserMenu'
import { Footer } from './Footer'
import { Button } from './button'
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
            <button
              onClick={() => {
                const element = document.getElementById('sync-devices')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                } else {
                  // If not on landing page, navigate first then scroll
                  window.location.href = '/#sync-devices'
                }
              }}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Feature
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('faq')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                } else {
                  // If not on landing page, navigate first then scroll
                  window.location.href = '/#faq'
                }
              }}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>
        }
        rightContent={
          user ? (
            <UserMenu />
          ) : (
            <Button
              variant="outline"
              size="sm"
              to="/auth"
            >
              Log in
            </Button>
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
