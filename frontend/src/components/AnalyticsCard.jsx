import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Target, Clock, CheckCircle2, Flame } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './AnalyticsCard.css'

function AnalyticsCard() {
  const [todos] = useLocalStorage('studydash_todos', [])
  const [pomodoroSessions] = useLocalStorage('studydash_pomodoro_sessions', [])
  const [studyLog] = useLocalStorage('studydash_study_log', [])
  const [view, setView] = useState('week')

  // Get the last 7 days
  const last7Days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d)
    }
    return days
  }, [])

  // Aggregate data per day
  const dailyData = useMemo(() => {
    return last7Days.map((day) => {
      const dayStr = day.toDateString()
      const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short' })

      // Pomodoro focus minutes
      const focusMins = pomodoroSessions
        .filter((s) => s.type === 'focus' && new Date(s.date).toDateString() === dayStr)
        .reduce((sum, s) => sum + s.duration, 0)

      // Tasks completed
      const tasksCompleted = todos.filter(
        (t) => t.completed && t.createdAt && new Date(t.createdAt).toDateString() === dayStr
      ).length

      return { date: day, label: dayLabel, focusMins, tasksCompleted }
    })
  }, [last7Days, pomodoroSessions, todos])

  const maxMins = Math.max(...dailyData.map((d) => d.focusMins), 30)
  const maxTasks = Math.max(...dailyData.map((d) => d.tasksCompleted), 3)

  // Totals
  const totalFocusMins = dailyData.reduce((s, d) => s + d.focusMins, 0)
  const totalTasks = dailyData.reduce((s, d) => s + d.tasksCompleted, 0)
  const totalSessions = pomodoroSessions.filter((s) => {
    const sDate = new Date(s.date)
    return sDate >= last7Days[0] && s.type === 'focus'
  }).length
  const avgDaily = Math.round(totalFocusMins / 7)

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0
    const d = new Date()
    while (true) {
      const dayStr = d.toDateString()
      const hadActivity =
        pomodoroSessions.some((s) => s.type === 'focus' && new Date(s.date).toDateString() === dayStr) ||
        todos.some((t) => t.completed && t.createdAt && new Date(t.createdAt).toDateString() === dayStr)
      if (hadActivity) {
        count++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [pomodoroSessions, todos])

  return (
    <div className="analytics-card glass-card" id="analytics-card">
      <div className="section-header">
        <div className="section-icon">
          <BarChart3 size={20} />
        </div>
        <h2>Study Analytics</h2>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'var(--accent-violet-light)' }}>
            <Clock size={18} />
          </div>
          <div className="analytics-stat-info">
            <span className="analytics-stat-value">{totalFocusMins}</span>
            <span className="analytics-stat-label">Focus mins (7d)</span>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald-light)' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="analytics-stat-info">
            <span className="analytics-stat-value">{totalTasks}</span>
            <span className="analytics-stat-label">Tasks done (7d)</span>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber-light)' }}>
            <Target size={18} />
          </div>
          <div className="analytics-stat-info">
            <span className="analytics-stat-value">{totalSessions}</span>
            <span className="analytics-stat-label">Sessions (7d)</span>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose-light)' }}>
            <Flame size={18} />
          </div>
          <div className="analytics-stat-info">
            <span className="analytics-stat-value">{streak}</span>
            <span className="analytics-stat-label">Day streak 🔥</span>
          </div>
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="analytics-chart-header">
        <h3>Focus Minutes</h3>
        <span className="analytics-avg">Avg: {avgDaily} min/day</span>
      </div>

      {/* Bar Chart — Focus Minutes */}
      <div className="analytics-chart" id="analytics-focus-chart">
        <div className="analytics-bars">
          {dailyData.map((d, i) => (
            <div key={i} className="analytics-bar-col">
              <div className="analytics-bar-value">{d.focusMins > 0 ? d.focusMins : ''}</div>
              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill focus"
                  style={{ height: `${maxMins > 0 ? (d.focusMins / maxMins) * 100 : 0}%` }}
                />
              </div>
              <div className="analytics-bar-label">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart — Tasks */}
      <div className="analytics-chart-header" style={{ marginTop: 'var(--space-lg)' }}>
        <h3>Tasks Completed</h3>
      </div>
      <div className="analytics-chart" id="analytics-tasks-chart">
        <div className="analytics-bars">
          {dailyData.map((d, i) => (
            <div key={i} className="analytics-bar-col">
              <div className="analytics-bar-value">{d.tasksCompleted > 0 ? d.tasksCompleted : ''}</div>
              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill tasks"
                  style={{ height: `${maxTasks > 0 ? (d.tasksCompleted / maxTasks) * 100 : 0}%` }}
                />
              </div>
              <div className="analytics-bar-label">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCard
