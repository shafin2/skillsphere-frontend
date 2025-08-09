import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-semibold text-lg">SkillSphere</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              Welcome, {user?.name}
            </span>
            <a href="/profile" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors text-sm">
              Edit Profile
            </a>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors text-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }} />
              {isDark ? 'Light' : 'Dark'}
            </button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted mt-2">Welcome to your SkillSphere dashboard</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {user?.name}</p>
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Role:</span> {user?.roles?.join(', ')}</p>
                {user?.roles?.includes('mentor') && (
                  <p><span className="font-medium">Status:</span> 
                    <span className={user?.isApproved ? 'text-success' : 'text-warning'}>
                      {user?.isApproved ? ' Approved' : ' Pending Approval'}
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {user?.roles?.includes('learner') && (
            <Card>
              <CardHeader>
                <CardTitle>Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-4">Find mentors and book sessions</p>
                <div className="space-y-2">
                  <a href="/mentors" className="inline-flex w-full items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:opacity-90">Browse Mentors</a>
                  <a href="/bookings" className="inline-flex w-full items-center justify-center px-4 py-2 rounded-md border border-border hover:bg-background">My Bookings</a>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.roles?.includes('mentor') && user?.isApproved && (
            <Card>
              <CardHeader>
                <CardTitle>Teaching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-4">Manage your sessions and availability</p>
                <a href="/mentor-bookings" className="inline-flex w-full items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:opacity-90">Booking Requests</a>
              </CardContent>
            </Card>
          )}

          {user?.roles?.includes('admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-4">Manage mentors and platform</p>
                <Button className="w-full">Admin Panel</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
} 