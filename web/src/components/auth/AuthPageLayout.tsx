import React from 'react'
import { Link } from 'react-router-dom'
import { HiChevronLeft } from 'react-icons/hi'

interface AuthPageLayoutProps {
  children: React.ReactNode
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 text-gray-300 hover:text-white transition-colors text-2xl font-bold bg-gray-800 hover:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer"
        aria-label="Back to Landing"
      >
        <HiChevronLeft className="text-2xl" />
      </Link>
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  )
}

