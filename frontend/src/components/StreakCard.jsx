import { useMemo } from 'react'
import { Trophy, Flame, Target, Star, BookOpen, Zap, Award, Clock, CheckCircle2, Calendar } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './StreakCard.css'

const BADGES = [
  { id: 'first_task', icon: CheckCircle2, label: 'First Task', desc: 'Complete your first task', check: (data) => data.totalTasks >= 1, color: '#10b981' },
  { id: 'five_tasks', icon: Target, label: 'Task Master', desc: 'Complete 5 tasks', check: (data) => data.totalTasks >= 5, color: '#3b82f6' },
  { id: 'twenty_tasks', icon: Star, label: 'Achiever', desc: 'Complete 20 tasks', check: (data) => data.totalTasks >= 20, color: '#f59e0b' },
  { id: 'first_pomo', icon: Clock, label: 'First Focus', desc: 'Complete a Pomodoro session', check: (data) => data.totalSessions >= 1, color: '#7c3aed' },
  { id: 'ten_pomos', icon: Zap, label: 'Focus Fighter', desc: '10 Pomodoro sessions', check: (data) => data.totalSessions >= 10, color: '#06b6d4' },
  { id: 'fifty_pomos', icon: Award, label: 'Study Hero', desc: '50 Pomodoro sessions', check: (data) => data.totalSessions >= 50, color: '#ec4899' },
  { id: 'streak_3', icon: Flame, label: '3-Day Streak', desc: 'Study 3 days in a row', check: (data) => data.streak >= 3, color: '#f97316' },
  { id: 'streak_7', icon: Flame, label: 'Week Warrior', desc: '7-day study streak', check: (data) => data.streak >= 7, color: '#ef4444' },
  { id: 'streak_30', icon: Trophy, label: 'Monthly Master', desc: '30-day study streak', check: (data) => data.streak >= 30, color: '#eab308' },
  { id: 'hour_study', icon: BookOpen, label: 'Hour Scholar', desc: '60 minutes of focus', check: (data) => data.totalMinutes >= 60, color: '#14b8a6' },
  { id: 'five_hour', icon: BookOpen, label: 'Deep Diver', desc: '5 hours of focus', check: (data) => data.totalMinutes >= 300, color: '#8b5cf6' },
  { id: 'ten_hour', icon: Trophy, label: 'Legend', desc: '10 hours of total focus', check: (data) => data.totalMinutes >= 600, color: '#f59e0b' },
]

function StreakCard() {
  const [todos] = useLocalStorage('studydash_todos', [])
  const [pomodoroSessions] = useLocalStorage('studydash_pomodoro_sessions', [])

  const data = useMemo(() => {
    const totalTasks = todos.filter((t) => t.completed).length
    const totalSessions = pomodoroSessions.filter((s) => s.type === 'focus').length
    const totalMinutes = pomodoroSessions
      .filter((s) => s.type === 'focus')
      .reduce((sum, s) => sum + s.duration, 0)

    // Calculate streak
    let streak = 0
    const d = new Date()
    while (true) {
      const dayStr = d.toDateString()
      const hadActivity =
        pomodoroSessions.some((s) => s.type === 'focus' && new Date(s.date).toDateString() === dayStr) ||
        todos.some((t) => t.completed && t.createdAt && new Date(t.createdAt).toDateString() === dayStr)
      if (hadActivity) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    return { totalTasks, totalSessions, totalMinutes, streak }
  }, [todos, pomodoroSessions])

  const unlockedBadges = BADGES.filter((b) => b.check(data))
  const lockedBadges = BADGES.filter((b) => !b.check(data))

  // Streak fire visualization (last 7 days)
  const streakDays = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toDateString()
      const active =
        pomodoroSessions.some((s) => s.type === 'focus' && new Date(s.date).toDateString() === dayStr) ||
        todos.some((t) => t.completed && t.createdAt && new Date(t.createdAt).toDateString() === dayStr)
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        date: d.getDate(),
        active,
      })
    }
    return days
  }, [pomodoroSessions, todos])

  return (
    <div className="streak-card glass-card" id="streak-card">
      <div className="section-header">
        <div className="section-icon">
          <Trophy size={20} />
        </div>
        <h2>Achievements</h2>
        <span className="todo-count badge" style={{ marginLeft: 'auto' }}>
          {unlockedBadges.length}/{BADGES.length}
        </span>
      </div>

      {/* Streak Hero */}
      <div className="streak-hero">
        <div className="streak-flame">
          <Flame size={48} />
        </div>
        <div className="streak-info">
          <div className="streak-count">{data.streak}</div>
          <div className="streak-label">Day Streak</div>
        </div>
      </div>

      {/* Streak Calendar (7 days) */}
      <div className="streak-calendar" id="streak-calendar">
        {streakDays.map((d, i) => (
          <div key={i} className={`streak-day ${d.active ? 'active' : ''}`} title={`Day ${d.date}`}>
            <span className="streak-day-label">{d.label}</span>
            <div className="streak-day-circle">
              {d.active && <Flame size={12} />}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="streak-stats">
        <div className="streak-stat">
          <span className="streak-stat-value">{data.totalTasks}</span>
          <span className="streak-stat-label">Tasks Done</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat-value">{data.totalSessions}</span>
          <span className="streak-stat-label">Sessions</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat-value">{Math.round(data.totalMinutes / 60 * 10) / 10}h</span>
          <span className="streak-stat-label">Study Time</span>
        </div>
      </div>

      {/* Badges — Unlocked */}
      {unlockedBadges.length > 0 && (
        <>
          <h3 className="streak-section-title">
            <Star size={16} /> Unlocked
          </h3>
          <div className="streak-badges">
            {unlockedBadges.map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="streak-badge unlocked" title={badge.desc}>
                  <div className="streak-badge-icon" style={{ background: `${badge.color}22`, color: badge.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="streak-badge-info">
                    <span className="streak-badge-label">{badge.label}</span>
                    <span className="streak-badge-desc">{badge.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Badges — Locked */}
      {lockedBadges.length > 0 && (
        <>
          <h3 className="streak-section-title locked-title">
            🔒 Locked
          </h3>
          <div className="streak-badges">
            {lockedBadges.map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="streak-badge locked" title={badge.desc}>
                  <div className="streak-badge-icon locked">
                    <Icon size={20} />
                  </div>
                  <div className="streak-badge-info">
                    <span className="streak-badge-label">{badge.label}</span>
                    <span className="streak-badge-desc">{badge.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default StreakCard
