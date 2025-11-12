import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { Scoreboard } from './pages/Scoreboard'
import { PublicView } from './pages/PublicView'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

// Component to handle invalid URLs and redirect based on authentication status
const InvalidUrlRedirect: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // If user is authenticated, redirect to dashboard
  // If not authenticated, redirect to auth page
  return <Navigate to={user ? "/dashboard" : "/"} replace />
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scoreboard/:id"
              element={
                <ProtectedRoute>
                  <Scoreboard />
                </ProtectedRoute>
              }
            />
            <Route path="/scoreboard/:id/view" element={<PublicView />} />
            {/* Catch-all route for invalid URLs */}
            <Route path="*" element={<InvalidUrlRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App