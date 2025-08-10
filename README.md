# SkillSphere Frontend

A modern React frontend for the SkillSphere mentorship platform built with Vite, Tailwind CSS, and React Router.

## 🎬 Demo & Documentation

- **📽️ Demo Video**: [Watch the full platform demo](./Demo.mp4)
- **📋 Project Overview**: [View detailed project documentation](./SkillSphere_Project_Overview.docx)

## Features

- ✅ **Authentication System**: Complete auth flow with email/password and Google OAuth
- ✅ **Role-based Access**: Learner, Mentor, and Admin roles with appropriate guards
- ✅ **Booking System**: Learners can book sessions with mentors
- ✅ **Real-time Chat**: Stream Chat integration for confirmed bookings
- ✅ **Theme System**: Dark/light mode with localStorage persistence
- ✅ **Reusable Components**: Semantic UI components with consistent design tokens
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Auto-refresh Tokens**: Automatic token refresh on 401 responses

## Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Stream Chat React** - Real-time messaging components

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── FormField.jsx
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx  # Authentication state
│   └── ThemeProvider.jsx # Theme management
├── lib/
│   └── http.js          # Axios configuration
├── pages/
│   ├── auth/            # Authentication pages
│   │   ├── RoleSelection.jsx
│   │   ├── Signup.jsx
│   │   ├── Login.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── OAuthSuccess.jsx
│   ├── Landing.jsx      # Marketing landing page
│   ├── Dashboard.jsx    # Main app dashboard
│   ├── MentorSearch.jsx # Browse available mentors
│   ├── MyBookings.jsx   # Learner's bookings with chat access
│   ├── MentorBookings.jsx # Mentor's booking requests
│   └── Chat.jsx         # Real-time chat interface
└── App.jsx              # Root component with routing
```

## Authentication Flow

1. **Role Selection** → Choose learner or mentor role
2. **Signup/Login** → Email/password or Google OAuth
3. **Email Verification** → Required for email/password users
4. **Dashboard** → Role-based dashboard with appropriate features

### User Roles

- **Learner**: Browse mentors, book sessions, track progress
- **Mentor**: Manage availability, conduct sessions (requires admin approval)
- **Admin**: Approve mentors, view analytics, moderate content

## Environment Setup

Create a `.env` file:

```env
VITE_APP_NAME=SkillSphere
VITE_API_URL=http://localhost:5000
VITE_STREAM_API_KEY=your_stream_api_key
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The frontend integrates with the Node.js backend using:

- **HTTP Client**: Axios with automatic token refresh
- **Auth Endpoints**: `/auth/signup`, `/auth/login`, `/auth/logout`, etc.
- **Google OAuth**: Backend redirects to `/oauth-success?token=...`
- **Email Links**: `/verify-email?token=...`, `/reset-password?token=...`

## Components

### UI Components

All UI components use semantic design tokens:

```jsx
import Button from './components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card.jsx'
import FormField from './components/ui/FormField.jsx'

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// Form field with validation
<FormField
  label="Email"
  type="email"
  error={errors.email}
  required
/>
```

### Theme System

```jsx
import { useTheme } from './context/ThemeProvider.jsx'

function MyComponent() {
  const { isDark, theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? 'light' : 'dark'} mode
    </button>
  )
}
```

### Authentication

```jsx
import { useAuth } from './context/AuthContext.jsx'

function MyComponent() {
  const { user, login, logout, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return user ? (
    <div>Welcome, {user.name}!</div>
  ) : (
    <button onClick={() => login(email, password)}>Login</button>
  )
}
```

## Routes

- `/` - Landing page
- `/auth/role-selection` - Choose user role
- `/auth/signup` - Create account
- `/auth/login` - Sign in
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Reset password with token
- `/verify-email` - Verify email with token
- `/oauth-success` - Google OAuth callback
- `/dashboard` - Main authenticated page
- `/mentors` - Browse available mentors
- `/mentors/:id` - Mentor profile and booking
- `/bookings` - Learner's bookings
- `/mentor-bookings` - Mentor's booking requests
- `/chat/:channelId` - Real-time chat for confirmed bookings

## Chat System

Real-time chat is available for confirmed bookings using Stream Chat.

### Features
- **Secure Access**: Only available for confirmed bookings between mentor and learner
- **Real-time Messaging**: Instant message delivery and read receipts
- **File Sharing**: Upload and share files within chat
- **Message History**: Persistent chat history
- **Mobile Responsive**: Works seamlessly on all devices

### How to use
1. **Book a Session**: Learner books a session with a mentor
2. **Mentor Confirms**: Mentor confirms the booking request
3. **Chat Access**: Both parties see "💬 Open Chat" button on their booking pages
4. **Start Chatting**: Click the button to open the real-time chat interface

### Technical Implementation
- Uses Stream Chat React components
- Backend creates secure channels with format `booking_{bookingId}`
- Authentication handled via Stream tokens from backend
- Channel access restricted to booking participants only

## Next Steps

The SkillSphere platform is now feature-complete with authentication, booking system, and real-time chat!

To continue development:
1. Start the backend server on `localhost:5000`
2. Set up your Stream Chat account and add API keys to `.env`
3. Test the complete flow: signup → book session → confirm → chat
4. Add advanced features like video calls, payment integration, or mentor ratings
