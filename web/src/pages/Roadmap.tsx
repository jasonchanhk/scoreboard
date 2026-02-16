import React from 'react'
import { Link } from 'react-router-dom'
import { SEOHead } from '../components/SEOHead'
import { Button } from '../components/button'

export const Roadmap: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Roadmap - Upcoming Features | Pretty Scoreboard"
        description="See what we're building next for Pretty Scoreboard. View our roadmap of upcoming features including advanced statistics, mobile apps, and more."
        keywords="pretty scoreboard roadmap, upcoming features, future updates, scoreboard development, feature requests"
        canonical="https://prettyscoreboard.com/roadmap"
      />
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Roadmap</h1>
          <p className="text-gray-600">
            What we're building next.{' '}
            See what we've already released in our {' '}
            <Link to="/changelog" className="text-indigo-600 hover:text-indigo-700 underline">
              changelog
            </Link>
            .
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We're constantly working to improve Pretty Scoreboard. Here's what we're building next:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Advanced statistics tracking and analytics</li>
                <li>Player roster management</li>
                <li>Custom branding options for leagues</li>
                <li>Mobile app for iOS and Android</li>
                <li>Integration with streaming platforms</li>
                <li>Export detailed game data and statistics</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Have a Feature Request?</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">
                We'd love to hear from you! Remember to select 'Feature Request' as the subject when contacting us.
              </p>
              <Button
                to="/contact"
                variant="primary"
                size="md"
              >
                Contact Us
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
