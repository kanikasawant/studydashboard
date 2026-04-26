import { useState, useEffect } from 'react'
import { BookOpen, LogOut } from 'lucide-react'
// Your existing imports
import Sidebar from './components/Sidebar'
import QuoteCard from './components/QuoteCard'
import TodoCard from './components/TodoCard'
import TimetableCard from './components/TimetableCard'
import NotesCard from './components/NotesCard'
import CountdownCard from './components/CountdownCard'
import PomodoroCard from './components/PomodoroCard'
import AnalyticsCard from './components/AnalyticsCard'
import CalendarCard from './components/CalendarCard'
import StreakCard from './components/StreakCard'

// New Auth imports
import LoginCard from './components/logincard'
import SignupCard from './components/signupcard'
import ThemeToggle from './components/ThemeToggle'

function isValidStoredToken(token) {
  if (!token || typeof token !== 'string') {
    return false
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(window.atob(padded))

    if (!payload.exp || typeof payload.exp !== 'number') {
      return false
    }

    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

function App() {
  const [activeSection, setActiveSection] = useState('todo')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studydash_theme') || 'dark'
  })

  // --- NEW AUTH STATE ---
  const [token, setToken] = useState(() => {
    const storedToken = sessionStorage.getItem('study_token')
    if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
      return null
    }

    if (!isValidStoredToken(storedToken)) {
      sessionStorage.removeItem('study_token')
      return null
    }

    return storedToken
  })
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('studydash_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // --- NEW LOGOUT HANDLER ---
  const handleLogout = () => {
    sessionStorage.removeItem('study_token')
    setToken(null)
    setAuthMode('login')
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'todo': return <TodoCard />
      case 'timetable': return <TimetableCard />
      case 'notes': return <NotesCard />
      case 'countdown': return <CountdownCard />
      case 'pomodoro': return <PomodoroCard />
      case 'analytics': return <AnalyticsCard />
      case 'calendar': return <CalendarCard />
      case 'streak': return <StreakCard />
      default: return <TodoCard />
    }
  }

  // --- 1. AUTH CHECK ---
  // If there is no token, show the Login or Signup card
  if (!token) {
    return (
      <div className="auth-page-wrapper">
        {authMode === 'login' ? (
          <LoginCard 
            onLoginSuccess={(newToken) => setToken(newToken)} 
            onSwitchToSignup={() => setAuthMode('signup')} 
          />
        ) : (
          <SignupCard 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        )}
      </div>
    )
  }

  // --- 2. DASHBOARD (Only shown if token exists) ---
  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        theme={theme}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <div className="mobile-topbar glass-card" id="mobile-topbar">
          <div className="mobile-topbar-brand">
            <div className="mobile-topbar-logo">
              <BookOpen size={18} />
            </div>
            <div className="mobile-topbar-text">
              <h3>StudyDash</h3>
              <span>Your study companion</span>
            </div>
          </div>

          <div className="mobile-topbar-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <span className="mobile-topbar-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <button type="button" className="mobile-topbar-logout" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        <QuoteCard />
        <div key={activeSection} style={{ animation: 'slideUp 0.4s ease' }}>
          {renderActiveSection()}
        </div>
      </main>
    </div>
  )
}

export default App