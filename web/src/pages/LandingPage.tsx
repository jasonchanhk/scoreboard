import React from 'react'
import { Link } from 'react-router-dom'

export const LandingPage: React.FC = () => {
  return (
    <>
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-gray-50" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 lg:flex-row lg:items-center lg:py-32">
          <div className="max-w-xl space-y-10">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium uppercase tracking-widest text-indigo-700">
              Real-time Game Management
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Elevate every game with a live, modern scoreboard experience.
              </h1>
              <p className="text-lg text-gray-600">
                Scoreboard helps leagues and teams run events with confidence. Track scores, manage
                rosters, display live stats, and share a polished public view—all from a single
                dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                Explore Features
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Built for teams of every size</p>
                <p>From local leagues to national tournaments</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Instant setup</p>
                <p>Create your free scoreboard in minutes</p>
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-xl">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Live Preview
              </p>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 text-sm text-gray-600">
                  <span>Scoreboard - Finals</span>
                  <span>04:32 Q3</span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-6 text-center">
                  <div className="space-y-2">
                    <p className="text-sm uppercase text-gray-500">Home</p>
                    <p className="text-4xl font-bold text-gray-900">68</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm uppercase text-gray-500">Away</p>
                    <p className="text-4xl font-bold text-gray-900">64</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">Live Stats</p>
                    <p>Track fouls, timeouts & momentum</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">Shareable Link</p>
                    <p>Let fans follow from anywhere</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">Instant Updates</p>
                    <p>Sync to displays & devices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="border-t border-gray-200 bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Why teams choose Scoreboard</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage games, engage fans, and showcase professional-grade
              presentation.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900">Game Control Center</h3>
              <p className="mt-3 text-gray-600">
                Update scores, track player stats, manage game clocks, and run every quarter with a
                modern, intuitive interface.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900">Real-Time Fan View</h3>
              <p className="mt-3 text-gray-600">
                Share live updates with fans and media through a polished public view that works on
                any device.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900">Team Collaboration</h3>
              <p className="mt-3 text-gray-600">
                Assign roles, coordinate volunteers, and keep everyone in sync with real-time
                updates and alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 px-6 lg:flex-row">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
              Ready to modernize your game day?
            </h2>
            <p className="text-lg text-gray-600">
              Join teams that deliver a professional-grade experience—start your first game in just
              a few clicks.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
            >
              Launch the Dashboard
            </Link>
            <a
              href="mailto:hello@scoreboard.app"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

