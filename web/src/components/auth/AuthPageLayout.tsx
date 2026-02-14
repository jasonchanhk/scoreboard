import React from 'react'
import { AppNav } from '../AppNav'
import { UserMenu } from '../UserMenu'
import { Button } from '../button'
import { useAuth } from '../../contexts/AuthContext'

interface AuthPageLayoutProps {
  children: React.ReactNode
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNav
        rightContent={
          user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-6">
              
              <Button
                variant="outline"
                size="sm"
                to="/"
              >
                Back to Home
              </Button>
            </div>
          )
        }
      />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}

