import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ProfileCompletionModal from './components/ProfileCompletionModal.jsx'
import Layout from './components/Layout.jsx'

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
import Profile from './pages/Profile.jsx'
import MentorSearch from './pages/MentorSearch.jsx'
import MentorDetails from './pages/MentorDetails.jsx'
import MyBookings from './pages/MyBookings.jsx'
import MentorBookings from './pages/MentorBookings.jsx'
import Messages from './pages/Messages.jsx'
import ChatPage from './pages/Chat.jsx'
import Meeting from './pages/Meeting.jsx'
import Transcript from './pages/Transcript.jsx'
import AILearningAssistant from './pages/AILearningAssistant.jsx'
import AIMentors from './pages/AIMentors.jsx'

function AppContent() {
  const { user, showProfileModal, updateUserProfile } = useAuth()

  return (
    <Router>
      {/* Profile completion modal */}
      {showProfileModal && user && (
        <ProfileCompletionModal
          user={user}
          onComplete={updateUserProfile}
          onClose={() => {}} // Modal cannot be closed until profile is complete
        />
      )}
      
      <Routes>
            {/* Landing page - redirect to dashboard if authenticated */}
            <Route path="/" element={
              user ? <Navigate to="/dashboard" replace /> : <Landing />
            } />
            
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

            <Route path="/mentors" element={
              <Layout>
                <MentorSearch />
              </Layout>
            } />
            <Route path="/mentors/:id" element={
              <Layout>
                <MentorDetails />
              </Layout>
            } />

            <Route path="/profile" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/ai-assistant" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <AILearningAssistant />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/ai-mentors" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <AIMentors />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <MyBookings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/mentor-bookings" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <MentorBookings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/messages" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <Messages />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/chat/:channelId" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <ChatPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/call/:bookingId" element={
              <ProtectedRoute requireAuth={true}>
                <Meeting />
              </ProtectedRoute>
            } />

            <Route path="/transcript/:bookingId" element={
              <ProtectedRoute requireAuth={true}>
                <Layout>
                  <Transcript />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to dashboard if authenticated, otherwise landing */}
            <Route path="*" element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
            } />
          </Routes>
        </Router>
    )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
