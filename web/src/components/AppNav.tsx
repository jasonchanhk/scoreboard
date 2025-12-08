import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaBasketballBall } from 'react-icons/fa'

interface AppNavProps {
  rightContent?: React.ReactNode
}

export const AppNav: React.FC<AppNavProps> = ({ rightContent }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isDashboard = location.pathname === '/dashboard'
  
  const handleClick = () => {
    if (!isDashboard) {
      navigate('/dashboard')
    }
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div 
              className={`flex items-center space-x-3 ${!isDashboard ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleClick}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full">
                <FaBasketballBall className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Pretty Scoreboard</h1>
            </div>
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

