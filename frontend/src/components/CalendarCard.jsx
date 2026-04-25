import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, GraduationCap, CheckCircle2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './CalendarCard.css'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarCard() {
  const [todos] = useLocalStorage('studydash_todos', [])
  const [exams] = useLocalStorage('studydash_exams', [])
  const [pomodoroSessions] = useLocalStorage('studydash_pomodoro_sessions', [])

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(today.toDateString())
  }

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: null })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
      days.push({ day: i, isCurrentMonth: true, date })
    }

    // Next month leading days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, date: null })
    }

    return days
  }, [currentMonth, currentYear])

  // Events for a given date
  const getEventsForDate = (date) => {
    if (!date) return { exams: [], tasks: [], sessions: 0 }
    const dateStr = date.toDateString()

    const dayExams = exams.filter((e) => new Date(e.date).toDateString() === dateStr)
    const dayTasks = todos.filter(
      (t) => t.completed && t.createdAt && new Date(t.createdAt).toDateString() === dateStr
    )
    const daySessions = pomodoroSessions.filter(
      (s) => s.type === 'focus' && new Date(s.date).toDateString() === dateStr
    ).length

    return { exams: dayExams, tasks: dayTasks, sessions: daySessions }
  }

  const selectedEvents = selectedDate ? getEventsForDate(new Date(selectedDate)) : null

  return (
    <div className="calendar-card glass-card" id="calendar-card">
      <div className="section-header">
        <div className="section-icon">
          <Calendar size={20} />
        </div>
        <h2>Calendar</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={goToToday}
          style={{ marginLeft: 'auto' }}
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="cal-nav">
        <button className="btn btn-icon btn-ghost" onClick={prevMonth}>
          <ChevronLeft size={18} />
        </button>
        <h3 className="cal-month-title">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <button className="btn btn-icon btn-ghost" onClick={nextMonth}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="cal-grid" id="cal-grid">
        {/* Day headers */}
        {DAY_LABELS.map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}

        {/* Day cells */}
        {calendarDays.map((item, i) => {
          const isToday = item.date && item.date.toDateString() === today.toDateString()
          const isSelected = item.date && selectedDate === item.date.toDateString()
          const events = getEventsForDate(item.date)
          const hasExam = events.exams.length > 0
          const hasTask = events.tasks.length > 0
          const hasSession = events.sessions > 0

          return (
            <div
              key={i}
              className={`cal-day ${!item.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => item.date && setSelectedDate(item.date.toDateString())}
            >
              <span className="cal-day-num">{item.day}</span>
              {item.isCurrentMonth && (
                <div className="cal-day-dots">
                  {hasExam && <span className="cal-dot exam" />}
                  {hasTask && <span className="cal-dot task" />}
                  {hasSession && <span className="cal-dot session" />}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot exam" /> Exam</span>
        <span className="cal-legend-item"><span className="cal-dot task" /> Task done</span>
        <span className="cal-legend-item"><span className="cal-dot session" /> Study session</span>
      </div>

      {/* Selected Date Details */}
      {selectedEvents && (
        <div className="cal-details" id="cal-details">
          <h4 className="cal-details-title">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h4>
          {selectedEvents.exams.length === 0 && selectedEvents.tasks.length === 0 && selectedEvents.sessions === 0 ? (
            <p className="cal-details-empty">No activity on this day</p>
          ) : (
            <div className="cal-details-list">
              {selectedEvents.exams.map((ex) => (
                <div key={ex.id} className="cal-detail-item exam">
                  <GraduationCap size={14} />
                  <span>📝 Exam: {ex.name}</span>
                </div>
              ))}
              {selectedEvents.tasks.length > 0 && (
                <div className="cal-detail-item task">
                  <CheckCircle2 size={14} />
                  <span>{selectedEvents.tasks.length} task(s) completed</span>
                </div>
              )}
              {selectedEvents.sessions > 0 && (
                <div className="cal-detail-item session">
                  <Calendar size={14} />
                  <span>{selectedEvents.sessions} Pomodoro session(s)</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarCard
