import { Sun, Moon } from 'lucide-react'
import './ThemeToggle.css'

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      id="theme-toggle-btn"
    >
      <div className={`theme-toggle-track ${theme}`}>
        <div className="theme-toggle-thumb">
          {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
        </div>
      </div>
    </button>
  )
}

export default ThemeToggle
