import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Auth pages
import RoleSelection from './pages/auth/RoleSelection.jsx'
import Signup from './pages/auth/Signup.jsx'
import Login from './pages/auth/Login.jsx'
import VerifyEmail from './pages/auth/VerifyEmail.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import OAuthSuccess from './pages/auth/OAuthSuccess.jsx'

// App pages
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PendingApproval from './pages/PendingApproval.jsx'
import VerifyEmailRequired from './pages/VerifyEmailRequired.jsx'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth routes - only accessible when not logged in */}
            <Route path="/auth/role-selection" element={
              <ProtectedRoute requireAuth={false}>
                <RoleSelection />
              </ProtectedRoute>
            } />
            <Route path="/auth/signup" element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } />
            <Route path="/auth/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/auth/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            <Route path="/auth/reset-password" element={
              <ProtectedRoute requireAuth={false}>
                <ResetPassword />
              </ProtectedRoute>
            } />
            
            {/* Special auth routes - accessible regardless of auth status */}
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/verify-email-required" element={<VerifyEmailRequired />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
