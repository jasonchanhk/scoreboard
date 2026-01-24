import React from 'react'
import { Link } from 'react-router-dom'
import { FaBasketballBall } from 'react-icons/fa'
import { TwoColumnLayout } from './layout'

interface FooterProps {
  backgroundColor?: string
  gap?: string
}

export const Footer: React.FC<FooterProps> = ({ 
  backgroundColor = 'bg-slate-900',
  gap = 'gap-12'
}) => {
  return (
    <footer>
      <TwoColumnLayout backgroundColor={backgroundColor} gap={gap}>
          {/* Left Section - Branding */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-full">
                <FaBasketballBall className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-white">Pretty Scoreboard</h2>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Scoreboard helps leagues and teams run events with confidence. Track scores, manage
              rosters, display live stats, and share a polished public view—all from a single
              dashboard.
            </p>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Scoreboard. All rights reserved.
            </p>
          </div>

          {/* Right Section - Links in Columns */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            {/* LEGAL Column */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* HELP Column */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Help
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@scoreboard.app" className="text-gray-400 hover:text-white transition-colors">
                    support@scoreboard.app
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* PRODUCT Column */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/whats-new" className="text-gray-400 hover:text-white transition-colors">
                    What's New
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
      </TwoColumnLayout>
    </footer>
  )
}
