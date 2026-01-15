import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth()
  const { subscription } = useSubscription()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Get display name from user metadata, or fallback to first part of email
  const getDisplayName = (): string => {
    if (!user?.email) return 'User'
    
    // Check for display name in user metadata (from Google OAuth or custom)
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.user_metadata?.display_name
    
    if (displayName) {
      return displayName
    }
    
    // Fallback to first half of email before @
    const emailPart = user.email.split('@')[0]
    return emailPart
  }
  
  const displayName = getDisplayName()
  const initials = (displayName?.slice(0, 2) || 'US').toUpperCase()

  // Get plan display name
  const getPlanDisplayName = (): string => {
    if (!subscription) {
      return 'Basic'
    }
    const tier = subscription.plan_tier.charAt(0).toUpperCase() + subscription.plan_tier.slice(1)
    return `${tier}`
  }

  const planDisplayName = getPlanDisplayName()

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuItemClick = (callback: () => void) => {
    callback()
    setIsOpen(false)
  }

  return (
    <div className="relative group" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-9 h-9 cursor-pointer rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open user menu</span>
        {initials}
      </button>
      {/* Invisible bridge to maintain hover state when moving from button to menu */}
      <div className="absolute right-0 top-full h-2 w-56" />
      <div className={`absolute right-0 top-full mt-2 z-50 w-56 rounded-md shadow-lg bg-white border border-gray-200 ${
        isOpen ? 'block' : 'hidden group-hover:block'
      }`}>
        <div className="py-2">
          {user?.email && (
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900 cursor-default select-text">
                {displayName}
              </div>
              <div className="text-xs text-gray-500 cursor-default select-text mt-0.5">
                {user.email}
              </div>
              <div className="text-xs text-gray-600 cursor-default select-text mt-1 font-medium border py-0.5 px-1 rounded-md inline-block">
                {planDisplayName}
              </div>
            </div>
          )}
          <div className="py-1">
            <button
              onClick={() => handleMenuItemClick(() => navigate('/settings'))}
              className="w-full text-left block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
            >
              Settings
            </button>
            <button
              onClick={() => handleMenuItemClick(() => navigate('/subscription'))}
              className="w-full text-left block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
            >
              Subscription
            </button>
          </div>
          <div className="border-t border-gray-100 pt-1">
          <button
            onClick={() => handleMenuItemClick(signOut)}
              className="w-full text-left block px-4 py-2 cursor-pointer text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

