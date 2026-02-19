import React, { useState, useRef, useEffect } from 'react'
import { AppNav } from './AppNav'
import { UserMenu } from './UserMenu'
import { Footer } from './Footer'
import { Button } from './button'
import { useAuth } from '../contexts/AuthContext'
import { HiMenu, HiX } from 'react-icons/hi'

interface PublicPageLayoutProps {
  children: React.ReactNode
}

export const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ 
  children
}) => {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [menuOpen])

  const handleMenuAction = (callback: () => void) => {
    callback()
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <AppNav
        rightContent={
          user ? (
            <UserMenu />
          ) : (
            <div className="relative" ref={menuRef}>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <HiX className="w-5 h-5" />
                ) : (
                  <HiMenu className="w-5 h-5" />
                )}
              </button>

              {/* Mobile Menu Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-md shadow-lg bg-white border border-gray-200 sm:hidden">
                  <div className="py-2">
                    <button
                      onClick={() => handleMenuAction(() => {
                        const element = document.getElementById('sync-devices')
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        } else {
                          window.location.href = '/#sync-devices'
                        }
                      })}
                      className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Feature
                    </button>
                    <button
                      onClick={() => handleMenuAction(() => {
                        window.location.href = '/roadmap'
                      })}
                      className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Roadmap
                    </button>
                    <button
                      onClick={() => handleMenuAction(() => {
                        window.location.href = '/contact'
                      })}
                      className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => handleMenuAction(() => {
                        window.location.href = '/auth'
                      })}
                      className="flex items-center w-full text-left px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-200 mt-2"
                    >
                      Log in
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-6">
                <button
                  onClick={() => {
                    const element = document.getElementById('sync-devices')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      window.location.href = '/#sync-devices'
                    }
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Feature
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/roadmap'
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Roadmap
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/contact'
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Contact
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  to="/auth"
                >
                  Log in
                </Button>
              </div>
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
