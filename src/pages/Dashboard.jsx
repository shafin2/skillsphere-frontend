import { useAuth } from '../context/AuthContext.jsx'
import LearnerDashboard from './LearnerDashboard.jsx'
import MentorDashboard from './MentorDashboard.jsx'
import Layout from '../components/Layout.jsx'

export default function Dashboard() {
  const { user } = useAuth()

  // If user is both mentor and learner, prioritize mentor role if approved
  const showMentorDashboard = user?.roles?.includes('mentor') && user?.isApproved
  const showLearnerDashboard = user?.roles?.includes('learner') && !showMentorDashboard

  return (
    <Layout>
      {showMentorDashboard && <MentorDashboard />}
      {showLearnerDashboard && <LearnerDashboard />}
      {!showMentorDashboard && !showLearnerDashboard && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to SkillSphere!</h1>
            <p className="text-muted mb-6">
              {user?.roles?.includes('mentor') && !user?.isApproved 
                ? 'Your mentor application is being reviewed. You\'ll receive an email once approved.'
                : 'Please complete your profile to get started.'
              }
            </p>
            <a 
              href="/profile" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Complete Profile
            </a>
          </div>
        </div>
      )}
    </Layout>
  )
} 