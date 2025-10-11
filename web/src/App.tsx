import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/LoginForm'
import { SignUpForm } from './components/SignUpForm'
import { Dashboard } from './components/Dashboard'
import { Scoreboard } from './components/Scoreboard'
import { PublicView } from './components/PublicView'

const AuthPage: React.FC = () => {
  // const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()

  // Redirect to dashboard if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <LoginForm onToggleMode={() => {}} />
      {/* {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignUpForm onToggleMode={() => setIsLogin(true)} />
      )} */}
    </div>
  )
}

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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
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
            <Route path="/view/:shareCode" element={<PublicView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
