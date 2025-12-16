import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth()
  const initials = (user?.email?.slice(0, 2) || 'US').toUpperCase()

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="sr-only">Open user menu</span>
        {initials}
      </button>
      <div className="absolute right-0 top-full z-50 hidden group-hover:block focus-within:block w-56 rounded-md shadow-lg bg-white">
        <div className="py-2">
          {user?.email && (
            <div className="px-4 pb-2 text-xs text-gray-500 cursor-default select-text">
              {user.email}
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

