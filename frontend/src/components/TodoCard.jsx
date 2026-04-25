import { useState } from 'react'
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2, ListFilter } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './TodoCard.css'

function TodoCard() {
  const [todos, setTodos] = useLocalStorage('studydash_todos', [])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')

  const addTodo = (e) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text) return
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ])
    setInputValue('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed))
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const completedCount = todos.filter((t) => t.completed).length
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  return (
    <div className="todo-card glass-card" id="todo-card">
      <div className="section-header">
        <div className="section-icon">
          <CheckSquare size={20} />
        </div>
        <h2>To-Do List</h2>
        <span className="todo-count badge">{todos.length} tasks</span>
      </div>

      {/* Progress Bar */}
      {todos.length > 0 && (
        <div className="todo-progress" id="todo-progress">
          <div className="todo-progress-info">
            <span>{completedCount} of {todos.length} completed</span>
            <span className="todo-progress-pct">{progress}%</span>
          </div>
          <div className="todo-progress-bar">
            <div
              className="todo-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <form className="todo-form" onSubmit={addTodo} id="todo-form">
        <input
          type="text"
          className="input-field"
          placeholder="Add a new task..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          id="todo-input"
        />
        <button type="submit" className="btn btn-primary" id="todo-add-btn">
          <Plus size={18} />
          Add
        </button>
      </form>

      {/* Filters */}
      <div className="todo-filters" id="todo-filters">
        <div className="todo-filter-group">
          <ListFilter size={14} />
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`todo-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {completedCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearCompleted}>
            Clear done
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="todo-list" id="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={40} />
            <p>{filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}</p>
          </div>
        ) : (
          filteredTodos.map((todo, index) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <button
                className="todo-check"
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {todo.completed ? (
                  <CheckCircle2 size={20} className="todo-check-done" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <span className="todo-text">{todo.text}</span>
              <button
                className="todo-delete btn btn-icon"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoCard
