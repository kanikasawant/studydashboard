import { useState, useEffect } from 'react'
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

function App() {
  const [activeSection, setActiveSection] = useState('todo')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('studydash_theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('studydash_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'todo':
        return <TodoCard />
      case 'timetable':
        return <TimetableCard />
      case 'notes':
        return <NotesCard />
      case 'countdown':
        return <CountdownCard />
      case 'pomodoro':
        return <PomodoroCard />
      case 'analytics':
        return <AnalyticsCard />
      case 'calendar':
        return <CalendarCard />
      case 'streak':
        return <StreakCard />
      default:
        return <TodoCard />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <main className="main-content">
        <QuoteCard />
        <div key={activeSection} style={{ animation: 'slideUp 0.4s ease' }}>
          {renderActiveSection()}
        </div>
      </main>
    </div>
  )
}

export default App
