import { useState, useEffect, useCallback } from 'react'

export function useZenMode() {
  const [zenMode, setZenMode] = useState(false)

  const toggle = useCallback(() => setZenMode(z => !z), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isEditable) return

      const isZ = e.code === 'KeyZ' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
      if (isZ) {
        e.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  return { zenMode, toggleZenMode: toggle }
}
