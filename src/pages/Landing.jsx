import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeProvider.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/ui/Logo.jsx'
import { useState, useEffect } from 'react'

export default function Landing() {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg via-surface to-bg">
      {/* Enhanced Navbar */}
      <header className={`border-b border-border sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-surface/95 backdrop-blur-xl shadow-lg' 
          : 'bg-surface/70 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="transform hover:scale-105 transition-transform duration-200">
            <Logo size="sm" showText={true} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted hover:text-primary transition-colors duration-200 font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-muted hover:text-primary transition-colors duration-200 font-medium">How it works</a>
            <a href="#testimonials" className="text-sm text-muted hover:text-primary transition-colors duration-200 font-medium">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-surface transition-all duration-200 text-sm hover:shadow-md"
            >
              <span className="h-2.5 w-2.5 rounded-full transition-colors duration-200" 
                style={{ backgroundColor: isDark ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }} />
              {isDark ? 'Light' : 'Dark'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">Hi, <span className="text-primary font-medium">{user.name}</span></span>
                <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-all duration-200">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-all duration-200 font-medium">
                  Sign In
                </Link>
                <Link to="/auth/role-selection" className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-primary/20 bg-primary/10 backdrop-blur text-primary font-medium mb-6">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 
                ✨ Now with AI-powered learning suggestions
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent animate-fade-in-up delay-100">
              Learn faster with
              <span className="block text-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                1:1 mentorship
              </span>
            </h1>
            
            <p className="mt-6 text-xl md:text-2xl text-muted max-w-3xl mx-auto animate-fade-in-up delay-200">
              Connect with expert mentors, book microlearning sessions, and accelerate your growth with 
              <span className="text-primary font-semibold"> AI-powered insights</span> and 
              <span className="text-secondary font-semibold"> real-time feedback</span>.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              {user ? (
                <Link to="/dashboard" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300">
                  <span className="flex items-center gap-2">
                    Go to Dashboard 
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </Link>
              ) : (
                <Link to="/auth/role-selection" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300">
                  <span className="flex items-center gap-2">
                    Start Learning Today 
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </Link>
              )}
              <a href="#features" className="px-8 py-4 rounded-xl bg-surface/80 backdrop-blur border-2 border-border text-foreground font-semibold text-lg hover:bg-surface hover:border-primary/30 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                See How It Works
              </a>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm animate-fade-in-up delay-400">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" /> 
                <span className="text-success font-medium">Live Availability</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" /> 
                <span className="text-primary font-medium">AI Suggestions</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" /> 
                <span className="text-secondary font-medium">Smart Summaries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
            Why Choose SkillSphere?
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Experience the future of personalized learning with our cutting-edge platform designed for modern learners and mentors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <EnhancedValueCard 
            title="Find Perfect Mentors" 
            desc="Advanced AI matching based on skills, ratings, availability, and learning style compatibility." 
            iconBg="bg-gradient-to-br from-primary/20 to-primary/10" 
            icon="🎯"
            features={["Smart filtering", "Real-time availability", "Verified profiles"]}
          />
          <EnhancedValueCard 
            title="Instant Booking" 
            desc="Seamless scheduling across time zones with automated confirmations and smart reminders." 
            iconBg="bg-gradient-to-br from-secondary/20 to-secondary/10" 
            icon="⚡"
            features={["Timezone sync", "Auto confirmations", "Calendar integration"]}
          />
          <EnhancedValueCard 
            title="AI-Powered Learning" 
            desc="Personalized recommendations, intelligent session summaries, and progress tracking." 
            iconBg="bg-gradient-to-br from-accent/20 to-accent/10" 
            icon="🤖"
            features={["Smart suggestions", "Auto summaries", "Progress analytics"]}
          />
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-br from-surface/50 to-background py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent mb-6">
              How SkillSphere Works
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Get started in minutes with our streamlined process designed for maximum learning efficiency.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <EnhancedStep 
              num={1} 
              title="Create Your Profile" 
              desc="Set up your personalized learning profile with AI-powered goal recommendations and skill assessments." 
              icon="👤"
              color="primary"
            />
            <EnhancedStep 
              num={2} 
              title="Book Smart Sessions" 
              desc="Choose from AI-recommended mentors and time slots that perfectly match your schedule and learning needs." 
              icon="📅"
              color="secondary"
            />
            <EnhancedStep 
              num={3} 
              title="Accelerate Growth" 
              desc="Learn with real-time feedback, automatic summaries, and personalized progress tracking to maximize results." 
              icon="🚀"
              color="accent"
            />
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent mb-6">
            Loved by Our Community
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Join thousands of learners and mentors who are transforming their careers with SkillSphere.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <EnhancedTestimonial 
            quote="The 30-minute micro-sessions helped me master React hooks in just two weeks. The AI suggestions were spot-on!" 
            name="Aisha Rahman" 
            role="Frontend Developer"
            avatar="👩‍💻"
            rating={5}
          />
          <EnhancedTestimonial 
            quote="Teaching on SkillSphere has been amazing. The platform makes it so easy to connect with learners and track progress." 
            name="Rohan Sharma" 
            role="Senior Mentor"
            avatar="👨‍🏫"
            rating={5}
          />
          <EnhancedTestimonial 
            quote="Finally, we have complete visibility into platform health and mentor performance. The admin tools are fantastic!" 
            name="Priya Patel" 
            role="Platform Admin"
            avatar="👩‍💼"
            rating={5}
          />
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard number="10,000+" label="Active Learners" />
          <StatCard number="2,500+" label="Expert Mentors" />
          <StatCard number="50,000+" label="Sessions Completed" />
          <StatCard number="4.9/5" label="Average Rating" />
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section id="get-started" className="max-w-7xl mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 text-center">
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              Join our growing community of learners and mentors. Start your personalized learning journey today with AI-powered insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {user ? (
                <Link to="/dashboard" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300">
                  <span className="flex items-center gap-2">
                    Access Dashboard 
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </Link>
              ) : (
                <>
                  <Link to="/auth/role-selection" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300">
                    <span className="flex items-center gap-2">
                      Start Free Today 
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </span>
                  </Link>
                  <Link to="/auth/login" className="px-8 py-4 rounded-xl bg-surface/80 backdrop-blur border-2 border-border text-foreground font-semibold text-lg hover:bg-surface hover:border-primary/30 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Sign In Instead
                  </Link>
                </>
              )}
            </div>
            
            {!user && (
              <p className="text-sm text-muted">
                Already have an account? <Link to="/auth/login" className="text-primary hover:text-secondary font-medium transition-colors duration-200">Sign in here</Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="sm" showText={true} />
              <p className="mt-4 text-sm text-muted">
                Empowering learners worldwide with personalized mentorship and AI-driven insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-muted">
                <a href="#features" className="block hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="block hover:text-primary transition-colors">How it Works</a>
                <a href="#testimonials" className="block hover:text-primary transition-colors">Testimonials</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <div className="space-y-2 text-sm text-muted">
                <Link to="/auth/role-selection" className="block hover:text-primary transition-colors">Become a Mentor</Link>
                <Link to="/auth/role-selection" className="block hover:text-primary transition-colors">Find a Mentor</Link>
                <a href="#" className="block hover:text-primary transition-colors">Success Stories</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted">
                <a href="#" className="block hover:text-primary transition-colors">Help Center</a>
                <a href="#" className="block hover:text-primary transition-colors">Contact Us</a>
                <a href="#" className="block hover:text-primary transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted">
            © {new Date().getFullYear()} SkillSphere. All rights reserved. Made with 💜 for learners worldwide.
          </div>
        </div>
      </footer>
    </main>
  )
}

// Enhanced Components
function EnhancedValueCard({ title, desc, iconBg, icon, features }) {
  return (
    <div className="group p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2">
      <div className={`h-16 w-16 rounded-2xl ${iconBg} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
      <p className="text-muted mb-6 leading-relaxed">{desc}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-muted">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EnhancedStep({ num, title, desc, icon, color }) {
  const colorClasses = {
    primary: 'from-primary to-primary/70',
    secondary: 'from-secondary to-secondary/70',
    accent: 'from-accent to-accent/70'
  }
  
  return (
    <div className="relative group">
      <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold flex items-center justify-center">
          {num}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
        <p className="text-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function EnhancedTestimonial({ quote, name, role, avatar, rating }) {
  return (
    <div className="group p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-4">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-accent text-lg">⭐</span>
        ))}
      </div>
      <blockquote className="text-foreground mb-6 leading-relaxed font-medium">
        "{quote}"
      </blockquote>
      <footer className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-foreground">{name}</div>
          <div className="text-sm text-muted">{role}</div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ number, label }) {
  return (
    <div className="text-center p-6 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all duration-300">
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-muted font-medium">{label}</div>
    </div>
  )
}

// Legacy Components (keeping for backward compatibility)
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
