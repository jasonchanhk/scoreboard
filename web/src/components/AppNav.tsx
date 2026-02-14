import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BrandingLogo } from './BrandingLogo'
import { useAuth } from '../contexts/AuthContext'

interface AppNavProps {
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}

export const AppNav: React.FC<AppNavProps> = ({ leftContent, rightContent }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDashboard = location.pathname === '/dashboard'
  
  const handleClick = () => {
    if (!isDashboard) {
      if (user) {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    }
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <BrandingLogo 
              variant="navbar"
              onClick={!isDashboard ? handleClick : undefined}
            />
            {leftContent && (
              <div className="flex items-center">
                {leftContent}
              </div>
            )}
          </div>
          {rightContent && (
            <div className="flex items-center">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

