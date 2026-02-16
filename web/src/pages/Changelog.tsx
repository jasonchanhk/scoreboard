import React from 'react'
import { Link } from 'react-router-dom'
import { SEOHead } from '../components/SEOHead'

interface ChangelogEntry {
  version: string
  date: string
  items: string[]
}

interface ChangelogData {
  updates: ChangelogEntry[]
}

const changelogData: ChangelogData = {
  updates: [
    {
      version: 'v.1.0.1',
      date: 'February 16, 2026',
      items: [
        'Improved real-time synchronization across all devices',
        'Enhanced mobile experience for scoreboard controllers',
        'Export game summary as PNG image',
        'Updated landing, changelog, and roadmap pages styling'
      ]
    },
    {
      version: 'v.1.0.0',
      date: 'Novemeber 20, 2025',
      items: [
        'Basic Scoreboard Creation',
        'Share code functionality for easy scoreboard sharing',
        'Quarter history tracking and display',
        'Fullscreen mode for public displays',
      ]
    }
  ]
}

export const Changelog: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Changelog - Latest Updates & Features | Pretty Scoreboard"
        description="Stay up to date with the latest features and improvements to Pretty Scoreboard. See what's new, recent updates, and upcoming enhancements."
        keywords="pretty scoreboard changelog, scoreboard updates, new features, what's new, basketball scoreboard updates"
        canonical="https://prettyscoreboard.com/changelog"
      />
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Changelog</h1>
          <p className="text-gray-600">
            Latest features and improvements.{' '}
            See what's coming next on our {' '}
            <Link to="/roadmap" className="text-indigo-600 hover:text-indigo-700 underline">
              roadmap
            </Link>
            .
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Latest Updates</h3>
            <div className="space-y-6">
              {changelogData.updates.map((update, index) => (
                <div
                  key={update.version}
                  className={`border-l-4 pl-4 ${
                    index === 0 ? 'border-indigo-500' : 'border-gray-300'
                  }`}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`text-xl font-bold ${
                          index === 0 ? 'text-indigo-600' : 'text-gray-900'
                        }`}
                      >
                        {update.version}
                      </span>
                      <span className="text-sm text-gray-500">• {update.date}</span>
                    </div>
                  </div>
                  <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
                    {update.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
