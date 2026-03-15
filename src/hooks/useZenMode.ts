import { useState, useEffect, useCallback } from 'react'

export function useZenMode() {
  const [zenMode, setZenMode] = useState(false)

  const toggle = useCallback(() => setZenMode(z => !z), [])

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch (err) {
      console.warn('Failed to enter fullscreen:', err)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.warn('Failed to exit fullscreen:', err)
    }
  }, [])

  const toggleWithFullscreen = useCallback(async () => {
    const newState = !zenMode
    setZenMode(newState)
    
    if (newState) {
      await enterFullscreen()
    } else {
      await exitFullscreen()
    }
  }, [zenMode, enterFullscreen, exitFullscreen])

  // Handle Z key for toggle (without fullscreen)
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
        toggleWithFullscreen()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleWithFullscreen])

  // Sync with browser fullscreen (e.g., user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen = !!document.fullscreenElement
      if (!isInFullscreen && zenMode) {
        setZenMode(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [zenMode])

  return { zenMode, toggleZenMode: toggleWithFullscreen }
}
