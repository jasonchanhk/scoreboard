import React from 'react'
import { Link } from 'react-router-dom'
import { HiChevronLeft } from 'react-icons/hi'

interface AuthPageLayoutProps {
  children: React.ReactNode
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>
      </div>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}

