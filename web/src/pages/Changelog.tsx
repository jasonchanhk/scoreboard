import React from 'react'
import { Link } from 'react-router-dom'
import { FaBasketballBall } from 'react-icons/fa'

export const Changelog: React.FC = () => {
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
          <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-2">Changelog</h2>
          <p className="text-gray-600">Stay up to date with the latest features and improvements</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none bg-white rounded-lg shadow-sm p-8 sm:p-12">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Latest Updates</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-indigo-600">Latest Updates</span>
                  <span className="text-sm text-gray-500">• {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Improved real-time synchronization across all devices</li>
                  <li>Enhanced mobile experience for scoreboard controllers</li>
                  <li>Better performance and faster load times</li>
                  <li>Updated UI with light mode for better visibility</li>
                </ul>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-600">Recent Features</span>
                  <span className="text-sm text-gray-500">• Previous Updates</span>
                </div>
                <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
                  <li>Share code functionality for easy scoreboard sharing</li>
                  <li>Quarter history tracking and display</li>
                  <li>Fullscreen mode for public displays</li>
                  <li>Subscription plans with different scoreboard limits</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ready to try out the latest features? Creating your first scoreboard takes just minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
              >
                Create Your First Scoreboard
              </Link>
              <Link
                to="/roadmap"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                View Roadmap
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
