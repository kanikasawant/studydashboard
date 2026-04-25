import { useState } from 'react'
import { CalendarDays, Plus, X, Clock } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './TimetableCard.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SUBJECT_COLORS = [
  '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e',
  '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
]

function TimetableCard() {
  const [entries, setEntries] = useLocalStorage('studydash_timetable', [])
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [day, setDay] = useState('Monday')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  // Assign consistent colors to subjects
  const subjectColorMap = {}
  const uniqueSubjects = [...new Set(entries.map((e) => e.subject))]
  uniqueSubjects.forEach((sub, i) => {
    subjectColorMap[sub] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]
  })

  const addEntry = (e) => {
    e.preventDefault()
    const subjectText = subject.trim()
    if (!subjectText) return
    setEntries([
      ...entries,
      {
        id: Date.now(),
        subject: subjectText,
        day,
        startTime,
        endTime,
      },
    ])
    setSubject('')
    setShowForm(false)
  }

  const deleteEntry = (id) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const getEntriesForDay = (dayName) => {
    return entries
      .filter((e) => e.day === dayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <div className="timetable-card glass-card" id="timetable-card">
      <div className="section-header">
        <div className="section-icon">
          <CalendarDays size={20} />
        </div>
        <h2>Timetable</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
          id="timetable-add-toggle"
          style={{ marginLeft: 'auto' }}
        >
          <Plus size={16} />
          Add Class
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form className="timetable-form" onSubmit={addEntry} id="timetable-form">
          <div className="timetable-form-row">
            <input
              type="text"
              className="input-field"
              placeholder="Subject name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoFocus
              id="timetable-subject-input"
            />
            <select
              className="input-field"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              id="timetable-day-select"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="timetable-form-row">
            <div className="timetable-time-group">
              <label>Start</label>
              <input
                type="time"
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                id="timetable-start-time"
              />
            </div>
            <div className="timetable-time-group">
              <label>End</label>
              <input
                type="time"
                className="input-field"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                id="timetable-end-time"
              />
            </div>
            <button type="submit" className="btn btn-primary" id="timetable-submit-btn">
              Add
            </button>
          </div>
        </form>
      )}

      {/* Weekly Grid */}
      <div className="timetable-grid" id="timetable-grid">
        {DAYS.map((dayName) => {
          const dayEntries = getEntriesForDay(dayName)
          return (
            <div key={dayName} className="timetable-day">
              <div className="timetable-day-header">
                <span className="timetable-day-name">{dayName.slice(0, 3)}</span>
                <span className="timetable-day-count">{dayEntries.length}</span>
              </div>
              <div className="timetable-day-entries">
                {dayEntries.length === 0 ? (
                  <div className="timetable-empty">—</div>
                ) : (
                  dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="timetable-entry"
                      style={{
                        borderLeftColor: subjectColorMap[entry.subject] || '#7c3aed',
                        background: `${subjectColorMap[entry.subject] || '#7c3aed'}11`,
                      }}
                    >
                      <div className="timetable-entry-subject">{entry.subject}</div>
                      <div className="timetable-entry-time">
                        <Clock size={11} />
                        {entry.startTime} – {entry.endTime}
                      </div>
                      <button
                        className="timetable-entry-delete"
                        onClick={() => deleteEntry(entry.id)}
                        aria-label="Delete entry"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Subject Legend */}
      {uniqueSubjects.length > 0 && (
        <div className="timetable-legend">
          {uniqueSubjects.map((sub) => (
            <span key={sub} className="timetable-legend-item">
              <span
                className="timetable-legend-dot"
                style={{ background: subjectColorMap[sub] }}
              />
              {sub}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimetableCard
