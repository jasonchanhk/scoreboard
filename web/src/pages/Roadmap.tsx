import React from 'react'
import { Link } from 'react-router-dom'
import { FaBasketballBall } from 'react-icons/fa'

export const Roadmap: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-700 rounded-full">
              <FaBasketballBall className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Pretty Scoreboard</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-2">Roadmap</h2>
          <p className="text-gray-600">See what we're building next and share your feedback</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none bg-white rounded-lg shadow-sm p-8 sm:p-12">
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
                <li>Export game data and statistics</li>
              </ul>
              <p>
                Have a feature request? We'd love to hear from you! Contact us at <a href="mailto:support@scoreboard.app" className="text-indigo-600 hover:text-indigo-700 underline">support@scoreboard.app</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ready to try out Pretty Scoreboard? Creating your first scoreboard takes just minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
              >
                Create Your First Scoreboard
              </Link>
              <Link
                to="/changelog"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                View Changelog
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
