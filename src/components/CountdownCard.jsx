import { useState, useEffect } from 'react'
import { Timer, Plus, Trash2, AlertTriangle, CalendarClock } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './CountdownCard.css'

function CountdownCard() {
  const [exams, setExams] = useLocalStorage('studydash_exams', [])
  const [showForm, setShowForm] = useState(false)
  const [examName, setExamName] = useState('')
  const [examDate, setExamDate] = useState('')
  const [now, setNow] = useState(Date.now())

  // Live countdown tick
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const addExam = (e) => {
    e.preventDefault()
    const name = examName.trim()
    if (!name || !examDate) return
    setExams([
      ...exams,
      {
        id: Date.now(),
        name,
        date: examDate,
      },
    ])
    setExamName('')
    setExamDate('')
    setShowForm(false)
  }

  const deleteExam = (id) => {
    setExams(exams.filter((ex) => ex.id !== id))
  }

  const getCountdown = (dateStr) => {
    const target = new Date(dateStr).getTime()
    const diff = target - now

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, total: diff }
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
      total: diff,
    }
  }

  const getUrgencyClass = (countdown) => {
    if (countdown.expired) return 'urgency-expired'
    if (countdown.days <= 1) return 'urgency-critical'
    if (countdown.days <= 3) return 'urgency-high'
    if (countdown.days <= 7) return 'urgency-medium'
    return 'urgency-low'
  }

  // Sort by nearest first
  const sortedExams = [...exams].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="countdown-card glass-card" id="countdown-card">
      <div className="section-header">
        <div className="section-icon">
          <Timer size={20} />
        </div>
        <h2>Exam Countdown</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
          id="countdown-add-toggle"
          style={{ marginLeft: 'auto' }}
        >
          <Plus size={16} />
          Add Exam
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form className="countdown-form" onSubmit={addExam} id="countdown-form">
          <input
            type="text"
            className="input-field"
            placeholder="Exam name (e.g. Math Final)"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            autoFocus
            id="countdown-name-input"
          />
          <input
            type="date"
            className="input-field"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            min={today}
            id="countdown-date-input"
          />
          <button type="submit" className="btn btn-primary" id="countdown-submit-btn">
            Add
          </button>
        </form>
      )}

      {/* Exam List */}
      <div className="countdown-list" id="countdown-list">
        {sortedExams.length === 0 ? (
          <div className="empty-state">
            <CalendarClock size={48} />
            <p>No upcoming exams. Add one to start the countdown!</p>
          </div>
        ) : (
          sortedExams.map((exam, index) => {
            const countdown = getCountdown(exam.date)
            const urgencyClass = getUrgencyClass(countdown)
            return (
              <div
                key={exam.id}
                className={`countdown-item ${urgencyClass}`}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="countdown-item-info">
                  <h3 className="countdown-item-name">{exam.name}</h3>
                  <span className="countdown-item-date">
                    <CalendarClock size={13} />
                    {new Date(exam.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {countdown.expired && (
                    <span className="countdown-expired-badge">
                      <AlertTriangle size={12} />
                      Exam passed
                    </span>
                  )}
                </div>

                <div className="countdown-timer">
                  {countdown.expired ? (
                    <div className="countdown-done">Done</div>
                  ) : (
                    <>
                      <div className="countdown-unit">
                        <span className="countdown-value">{String(countdown.days).padStart(2, '0')}</span>
                        <span className="countdown-label">days</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                        <span className="countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                        <span className="countdown-label">hrs</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                        <span className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                        <span className="countdown-label">min</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                        <span className="countdown-value countdown-seconds">{String(countdown.seconds).padStart(2, '0')}</span>
                        <span className="countdown-label">sec</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="countdown-delete btn btn-icon"
                  onClick={() => deleteExam(exam.id)}
                  aria-label="Delete exam"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CountdownCard
