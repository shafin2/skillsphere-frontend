import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeProvider.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Landing() {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <header className="border-b border-border bg-surface/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-semibold text-lg">SkillSphere</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-muted hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm text-muted hover:text-foreground">How it works</a>
            <a href="#testimonials" className="text-sm text-muted hover:text-foreground">Testimonials</a>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors text-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }} />
              {isDark ? 'Light' : 'Dark'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">Hi, {user.name}</span>
                <Link to="/dashboard" className="px-3 py-1.5 rounded-md bg-primary text-white text-sm hover:opacity-90">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-md text-sm text-muted hover:text-foreground">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="px-3 py-1.5 rounded-md text-sm text-muted hover:text-foreground">
                  Sign In
                </Link>
                <Link to="/auth/role-selection" className="px-3 py-1.5 rounded-md bg-primary text-white text-sm hover:opacity-90">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(29,78,216,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.15),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 py-24 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-border bg-surface/60 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" /> Now with AI suggestions and summaries
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight">
              Learn faster with 1:1 mentorship — on your schedule
            </h1>
            <p className="mt-4 text-lg text-muted">
              Book microlearning sessions with vetted mentors. Real-time booking, AI-powered guidance, and seamless feedback.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link to="/dashboard" className="px-5 py-3 rounded-md bg-primary text-white hover:opacity-90">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/auth/role-selection" className="px-5 py-3 rounded-md bg-primary text-white hover:opacity-90">
                  Create free account
                </Link>
              )}
              <a href="#features" className="px-5 py-3 rounded-md bg-surface border border-border text-foreground hover:bg-background">
                See how it works
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-success" /> Live availability</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-accent" /> AI suggestions</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-secondary" /> Session summaries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <ValueCard title="Find the right mentor" desc="Search by skill, rating, availability, and tags in a fast, filterable directory." iconBg="bg-primary/10" dot="bg-primary" />
          <ValueCard title="Book in minutes" desc="Timezone-aware scheduling, confirmations, and countdown to session start." iconBg="bg-secondary/10" dot="bg-secondary" />
          <ValueCard title="Learn with AI" desc="Personalized topic suggestions and automatic session summaries to accelerate progress." iconBg="bg-accent/10" dot="bg-accent" />
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold">How SkillSphere works</h2>
        <ol className="mt-6 grid md:grid-cols-3 gap-6">
          <Step num={1} title="Create your profile" desc="Choose your role, interests, and goals to get tailored recommendations." />
          <Step num={2} title="Book a session" desc="Pick a mentor and time slot that fits your schedule, across time zones." />
          <Step num={3} title="Grow with feedback" desc="Get AI-powered summaries, leave ratings, and track your progress." />
        </ol>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-2xl p-8 bg-surface border border-border">
          <h2 className="text-2xl font-semibold">What learners say</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <Testimonial quote="The 30-minute micro-sessions helped me grasp React hooks quickly." name="Aisha, Learner" />
            <Testimonial quote="Booking and teaching flow is smooth. Feedback helps me improve." name="Rohan, Mentor" />
            <Testimonial quote="We finally have visibility into mentor approvals and platform health." name="Priya, Admin" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-2xl p-10 bg-[linear-gradient(135deg,rgba(29,78,216,0.1),rgba(147,51,234,0.1))] border border-border text-center">
          <h3 className="text-2xl font-semibold">Start your learning journey today</h3>
          <p className="mt-2 text-muted">Sign up, pick your role, and book your first session in minutes.</p>
          <div className="mt-6 flex justify-center gap-3">
            {user ? (
              <Link to="/dashboard" className="px-6 py-3 rounded-md bg-primary text-white hover:opacity-90">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth/role-selection" className="px-6 py-3 rounded-md bg-primary text-white hover:opacity-90">
                  Create Account
                </Link>
                <Link to="/auth/login" className="px-6 py-3 rounded-md bg-surface border border-border text-foreground hover:bg-background">
                  Sign In
                </Link>
              </>
            )}
          </div>
          {!user && (
            <p className="mt-4 text-sm text-muted">
              Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign in here</Link>
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted">
          © {new Date().getFullYear()} SkillSphere. All rights reserved.
        </div>
      </footer>
    </main>
  )
}

function ValueCard({ title, desc, iconBg, dot }) {
  return (
    <div className="p-6 rounded-xl bg-surface border border-border">
      <div className={`h-10 w-10 rounded-md ${iconBg} flex items-center justify-center`}>
        <div className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </div>
  )
}

function Step({ num, title, desc }) {
  return (
    <li className="p-6 rounded-xl bg-surface border border-border">
      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border text-sm font-medium">{num}</div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </li>
  )
}

function Testimonial({ quote, name }) {
  return (
    <blockquote className="p-6 rounded-xl bg-background border border-border">
      <p className="">"{quote}"</p>
      <footer className="mt-2 text-sm text-muted">— {name}</footer>
    </blockquote>
  )
}
