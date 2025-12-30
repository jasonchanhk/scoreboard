import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { ScoreboardController } from './pages/ScoreboardController'
import { ScoreboardDisplay } from './pages/ScoreboardDisplay'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'
import { Settings } from './pages/Settings'
import { Subscription } from './pages/Subscription'
import { CheckoutSuccess } from './pages/CheckoutSuccess'
import { CheckoutCancel } from './pages/CheckoutCancel'
import { LoadingSpinner } from './components/LoadingSpinner'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

// Component to handle invalid URLs and redirect based on authentication status
const InvalidUrlRedirect: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
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
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/success"
              element={
                <ProtectedRoute>
                  <CheckoutSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/cancel"
              element={
                <ProtectedRoute>
                  <CheckoutCancel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scoreboard/:id"
              element={
                <ProtectedRoute>
                  <ScoreboardController />
                </ProtectedRoute>
              }
            />
            <Route path="/scoreboard/:id/view" element={<ScoreboardDisplay />} />
            {/* Catch-all route for invalid URLs */}
            <Route path="*" element={<InvalidUrlRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App