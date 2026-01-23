import React from 'react'
import { Link } from 'react-router-dom'
import { FaBasketballBall } from 'react-icons/fa'

export const About: React.FC = () => {
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
          <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-2">About Us</h2>
          <p className="text-gray-600">Learn more about our mission and what we offer</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none bg-white rounded-lg shadow-sm p-8 sm:p-12">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pretty Scoreboard was created to help teams and leagues run their games with confidence and professionalism. We believe that every game, from local youth leagues to national tournaments, deserves a modern, reliable scoreboard experience.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our platform makes it easy to track scores, manage game clocks, display live stats, and share real-time updates with fans—all from a single, intuitive dashboard. Whether you're a coach, league organizer, or volunteer, we're here to make game day management seamless.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h3>
            <div className="text-gray-700 leading-relaxed">
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Real-Time Score Tracking:</strong> Update scores instantly and see changes reflected across all connected devices</li>
                <li><strong>Game Clock Management:</strong> Control game time with precision, including quarter tracking and timeout management</li>
                <li><strong>Public View Links:</strong> Share a polished, public-facing scoreboard that works on any device</li>
                <li><strong>Team Collaboration:</strong> Assign roles and coordinate with volunteers in real-time</li>
                <li><strong>Professional Presentation:</strong> Display your games with a clean, modern interface that looks great on screens of any size</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ready to elevate your game day experience? Creating your first scoreboard takes just minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
              >
                Create Your First Scoreboard
              </Link>
              <a
                href="mailto:hello@scoreboard.app"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                Contact Sales
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
