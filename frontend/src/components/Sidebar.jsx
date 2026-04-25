import { CheckSquare, CalendarDays, FileText, Timer, BookOpen, Clock, BarChart3, Calendar, Trophy, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import './Sidebar.css'

const navItems = [
  { id: 'todo', label: 'To-Do List', icon: CheckSquare },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'countdown', label: 'Exam Timer', icon: Timer },
  { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'streak', label: 'Achievements', icon: Trophy },
]

function Sidebar({ activeSection, onNavigate, theme, onThemeToggle, onLogout }) {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <BookOpen size={24} />
        </div>
        <div className="sidebar-brand-text">
          <h1>StudyDash</h1>
          <span>Your study companion</span>
        </div>
      </div>

      <div className="sidebar-auth-actions">
        <button type="button" className="sidebar-logout sidebar-logout-primary" onClick={onLogout}>
          <LogOut size={14} />
          Logout
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={20} />
              <span className="sidebar-nav-label">{item.label}</span>
              {activeSection === item.id && <div className="nav-indicator" />}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <div className="sidebar-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
