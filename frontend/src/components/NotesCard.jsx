import { useState } from 'react'
import { FileText, Plus, Trash2, Save, PenLine } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './NotesCard.css'

function NotesCard() {
  const [notes, setNotes] = useLocalStorage('studydash_notes', [])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  const activeNote = notes.find((n) => n.id === activeNoteId)

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes([newNote, ...notes])
    setActiveNoteId(newNote.id)
    setEditTitle(newNote.title)
    setEditBody(newNote.body)
  }

  const selectNote = (note) => {
    setActiveNoteId(note.id)
    setEditTitle(note.title)
    setEditBody(note.body)
  }

  const saveNote = () => {
    if (!activeNoteId) return
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId
          ? { ...n, title: editTitle, body: editBody, updatedAt: new Date().toISOString() }
          : n
      )
    )
  }

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id))
    if (activeNoteId === id) {
      setActiveNoteId(null)
      setEditTitle('')
      setEditBody('')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="notes-card glass-card" id="notes-card">
      <div className="section-header">
        <div className="section-icon">
          <FileText size={20} />
        </div>
        <h2>Notes</h2>
        <span className="todo-count badge">{notes.length} notes</span>
      </div>

      <div className="notes-layout">
        {/* Note List */}
        <div className="notes-list" id="notes-list">
          <button className="notes-new-btn btn btn-primary" onClick={createNote} id="notes-new-btn">
            <Plus size={16} />
            New Note
          </button>
          <div className="notes-list-items">
            {notes.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 8px' }}>
                <FileText size={32} />
                <p>No notes yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`notes-list-item ${activeNoteId === note.id ? 'active' : ''}`}
                  onClick={() => selectNote(note)}
                >
                  <div className="notes-list-item-title">{note.title || 'Untitled'}</div>
                  <div className="notes-list-item-preview">
                    {note.body ? note.body.slice(0, 60) + (note.body.length > 60 ? '...' : '') : 'Empty note'}
                  </div>
                  <div className="notes-list-item-date">{formatDate(note.updatedAt)}</div>
                  <button
                    className="notes-list-item-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                    aria-label="Delete note"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="notes-editor" id="notes-editor">
          {activeNote ? (
            <>
              <div className="notes-editor-header">
                <PenLine size={16} className="notes-editor-icon" />
                <input
                  type="text"
                  className="notes-title-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title..."
                  id="notes-title-input"
                />
                <button className="btn btn-primary btn-sm" onClick={saveNote} id="notes-save-btn">
                  <Save size={14} />
                  Save
                </button>
              </div>
              <textarea
                className="notes-body-input"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Start writing your notes here..."
                id="notes-body-input"
              />
            </>
          ) : (
            <div className="empty-state">
              <PenLine size={48} />
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotesCard
