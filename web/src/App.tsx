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
import { About } from './pages/About'
import { WhatsNew } from './pages/WhatsNew'
import { Settings } from './pages/Settings'
import { Subscription } from './pages/Subscription'
import { CheckoutSuccess } from './pages/CheckoutSuccess'
import { CheckoutCancel } from './pages/CheckoutCancel'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ScrollToTop } from './components/ScrollToTop'
import { PublicPageLayout } from './components/PublicPageLayout'

// Inner component that uses Router and auth context
const AppRoutes: React.FC = () => {
  // Components that use auth context - must be inside AuthProvider
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
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
            <Route path="/" element={
              <PublicPageLayout showBreadcrumb={false}>
                <LandingPage />
              </PublicPageLayout>
            } />
            <Route path="/auth" element={
                <AuthPage />
            } />
            <Route path="/about" element={
              <PublicPageLayout>
                <About />
              </PublicPageLayout>
            } />
            <Route path="/whats-new" element={
              <PublicPageLayout>
                <WhatsNew />
              </PublicPageLayout>
            } />
            <Route path="/privacy" element={
              <PublicPageLayout>
                <PrivacyPolicy />
              </PublicPageLayout>
            } />
            <Route path="/terms" element={
              <PublicPageLayout>
                <TermsOfService />
              </PublicPageLayout>
            } />
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
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App