import { useState } from 'react'
import { Quote, RefreshCw } from 'lucide-react'
import quotes from '../data/quotes.json'
import './QuoteCard.css'

function getDailyQuoteIndex() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dayOfYear % quotes.length
}

function QuoteCard() {
  const [quoteIndex, setQuoteIndex] = useState(getDailyQuoteIndex)

  const quote = quotes[quoteIndex]

  const handleRefresh = () => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * quotes.length)
    } while (newIndex === quoteIndex && quotes.length > 1)
    setQuoteIndex(newIndex)
  }

  return (
    <div className="quote-card glass-card" id="quote-card">
      <div className="quote-decoration">
        <Quote size={48} />
      </div>
      <div className="quote-content">
        <p className="quote-text">{quote.text}</p>
        <span className="quote-author">— {quote.author}</span>
      </div>
      <button
        className="quote-refresh btn btn-icon btn-ghost"
        onClick={handleRefresh}
        title="New quote"
        id="quote-refresh-btn"
      >
        <RefreshCw size={16} />
      </button>
    </div>
  )
}

export default QuoteCard
