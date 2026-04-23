import { useState, useEffect, useCallback, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Volume2, VolumeX, Zap } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './PomodoroCard.css'

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, icon: BookOpen, color: 'var(--accent-violet)' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, icon: Coffee, color: 'var(--accent-emerald)' },
  longBreak: { label: 'Long Break', duration: 15 * 60, icon: Coffee, color: 'var(--accent-cyan)' },
}

function playBeep(frequency = 800, duration = 200, count = 3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = frequency
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.3)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + duration / 1000)
      osc.start(ctx.currentTime + i * 0.3)
      osc.stop(ctx.currentTime + i * 0.3 + duration / 1000)
    }
  } catch (e) {
    // Audio not supported
  }
}

function PomodoroCard() {
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [sessions, setSessions] = useLocalStorage('studydash_pomodoro_sessions', [])
  const intervalRef = useRef(null)

  const currentMode = MODES[mode]
  const totalDuration = currentMode.duration
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100
  const circumference = 2 * Math.PI * 130

  // Today's sessions
  const today = new Date().toDateString()
  const todaySessions = sessions.filter((s) => new Date(s.date).toDateString() === today)
  const todayFocusMinutes = todaySessions
    .filter((s) => s.type === 'focus')
    .reduce((sum, s) => sum + s.duration, 0)

  const switchMode = useCallback((newMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(MODES[newMode].duration)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            clearInterval(intervalRef.current)

            // Record session
            if (mode === 'focus') {
              setSessions((prev) => [
                ...prev,
                { date: new Date().toISOString(), type: 'focus', duration: MODES.focus.duration / 60 },
              ])
            }

            if (soundEnabled) playBeep()

            // Auto switch
            if (mode === 'focus') {
              const completedFocus = todaySessions.filter((s) => s.type === 'focus').length + 1
              if (completedFocus % 4 === 0) {
                switchMode('longBreak')
              } else {
                switchMode('shortBreak')
              }
            } else {
              switchMode('focus')
            }

            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode, soundEnabled, switchMode, todaySessions, setSessions])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(currentMode.duration)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="pomodoro-card glass-card" id="pomodoro-card">
      <div className="section-header">
        <div className="section-icon">
          <Timer size={20} />
        </div>
        <h2>Pomodoro Timer</h2>
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute' : 'Unmute'}
          style={{ marginLeft: 'auto' }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="pomo-modes">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            className={`pomo-mode-btn ${mode === key ? 'active' : ''}`}
            onClick={() => switchMode(key)}
            data-mode={key}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div className="pomo-timer-container">
        <svg className="pomo-timer-svg" viewBox="0 0 280 280">
          <circle
            className="pomo-timer-bg"
            cx="140"
            cy="140"
            r="130"
            fill="none"
            strokeWidth="6"
          />
          <circle
            className="pomo-timer-progress"
            cx="140"
            cy="140"
            r="130"
            fill="none"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            style={{ stroke: currentMode.color }}
          />
        </svg>
        <div className="pomo-timer-display">
          <div className="pomo-timer-time">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="pomo-timer-label">{currentMode.label}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="pomo-controls">
        <button className="btn btn-ghost btn-icon" onClick={resetTimer} title="Reset">
          <RotateCcw size={18} />
        </button>
        <button
          className={`pomo-play-btn ${isRunning ? 'running' : ''}`}
          onClick={toggleTimer}
          id="pomo-play-btn"
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
        </button>
        <div style={{ width: 34 }} /> {/* Spacer */}
      </div>

      {/* Today's Stats */}
      <div className="pomo-stats">
        <div className="pomo-stat">
          <Zap size={14} />
          <span>{todaySessions.filter((s) => s.type === 'focus').length}</span>
          <span className="pomo-stat-label">Sessions</span>
        </div>
        <div className="pomo-stat">
          <Timer size={14} />
          <span>{todayFocusMinutes}</span>
          <span className="pomo-stat-label">Minutes</span>
        </div>
      </div>
    </div>
  )
}

export default PomodoroCard
