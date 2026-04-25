import { useState, useEffect } from 'react'

function getAuthScope() {
  try {
    const token = window.sessionStorage.getItem('study_token')

    if (!token || typeof token !== 'string') {
      return 'guest'
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return 'guest'
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(window.atob(padded))

    return payload.sub ? String(payload.sub) : 'guest'
  } catch {
    return 'guest'
  }
}

export function useLocalStorage(key, initialValue) {
  const scopedKey = `${key}::${getAuthScope()}`

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(scopedKey)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(scopedKey, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [scopedKey, key, storedValue])

  return [storedValue, setStoredValue]
}
