import React from 'react'
import { Link } from 'react-router-dom'
import { BrandingLogo } from './BrandingLogo'
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
            <div className="mb-4">
              <BrandingLogo variant="footer" />
            </div>
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
                  <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
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
                  <Link to="/changelog" className="text-gray-400 hover:text-white transition-colors">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="text-gray-400 hover:text-white transition-colors">
                    Roadmap
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
