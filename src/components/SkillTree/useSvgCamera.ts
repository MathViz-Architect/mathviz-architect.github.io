// useSvgCamera.ts
// Manages pan + zoom for an SVG canvas using an internal <g> transform.
// The SVG element itself stays fixed (width/height = container size).
// All world-space coordinates remain stable — only the camera matrix changes.

import { useState, useRef, useCallback, useEffect, RefObject } from 'react'

export interface Camera {
  /** World-space x of the viewport top-left corner */
  x: number
  /** World-space y of the viewport top-left corner */
  y: number
  /** Scale factor (1 = 100%) */
  scale: number
}

export interface UseSvgCameraReturn {
  camera: Camera
  /** SVG <g> transform attribute string — apply to the scene root group */
  transform: string
  /** Attach to the SVG element as event handlers */
  handlers: {
    onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void
    onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
    onMouseUp:   (e: React.MouseEvent<SVGSVGElement>) => void
    onMouseLeave:(e: React.MouseEvent<SVGSVGElement>) => void
    onWheel:     (e: WheelEvent) => void
  }
  /** Fit all content into view */
  fitToContent: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void
  /** Zoom to a specific world-space point */
  zoomToPoint: (worldX: number, worldY: number, targetScale: number) => void
  /** Reset to fit */
  reset: () => void
  /** Container ref — attach to the wrapper div */
  containerRef: RefObject<HTMLDivElement>
}

const MIN_SCALE = 0.2
const MAX_SCALE = 3.0
const ZOOM_SPEED = 0.001  // per pixel of deltaY

export function useSvgCamera(
  initialFit?: { minX: number; minY: number; maxX: number; maxY: number }
): UseSvgCameraReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 })
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  // Convert screen coords to world coords
  const screenToWorld = useCallback((
    screenX: number,
    screenY: number,
    cam: Camera,
    rect: DOMRect
  ): { x: number; y: number } => {
    const svgX = screenX - rect.left
    const svgY = screenY - rect.top
    return {
      x: svgX / cam.scale + cam.x,
      y: svgY / cam.scale + cam.y,
    }
  }, [])

  // Fit bounds into the container viewport
  const fitToContent = useCallback((
    bounds: { minX: number; minY: number; maxX: number; maxY: number }
  ) => {
    const container = containerRef.current
    if (!container) return

    const vw = container.clientWidth
    const vh = container.clientHeight
    const contentW = bounds.maxX - bounds.minX
    const contentH = bounds.maxY - bounds.minY
    if (contentW <= 0 || contentH <= 0) return

    const MARGIN = 40
    const scaleX = (vw - MARGIN * 2) / contentW
    const scaleY = (vh - MARGIN * 2) / contentH
    const scale = Math.min(scaleX, scaleY, 1.0)  // never zoom in > 100% on initial fit

    // Center the content
    const visibleW = vw / scale
    const visibleH = vh / scale
    const x = bounds.minX - (visibleW - contentW) / 2
    const y = bounds.minY - (visibleH - contentH) / 2

    setCamera({ x, y, scale })
  }, [])

  // Fit on mount if bounds provided
  useEffect(() => {
    if (initialFit) {
      // Small delay to let the container measure itself
      const id = requestAnimationFrame(() => fitToContent(initialFit))
      return () => cancelAnimationFrame(id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const zoomToPoint = useCallback((worldX: number, worldY: number, targetScale: number) => {
    const container = containerRef.current
    if (!container) return
    const vw = container.clientWidth
    const vh = container.clientHeight
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, targetScale))
    // Keep worldX/Y under the screen center
    const x = worldX - vw / 2 / clampedScale
    const y = worldY - vh / 2 / clampedScale
    setCamera({ x, y, scale: clampedScale })
  }, [])

  const reset = useCallback(() => {
    if (initialFit) {
      fitToContent(initialFit)
    } else {
      setCamera({ x: 0, y: 0, scale: 1 })
    }
  }, [fitToContent, initialFit])

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Only pan on middle-button or when not clicking a node
    if ((e.target as Element).closest('.skill-node')) return
    if (e.button === 0 || e.button === 1) {
      isPanning.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
      e.currentTarget.style.cursor = 'grabbing'
    }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = { x: e.clientX, y: e.clientY }
    setCamera(cam => ({
      ...cam,
      // In world space, moving screen by dx pixels = moving camera by dx/scale world units
      x: cam.x - dx / cam.scale,
      y: cam.y - dy / cam.scale,
    }))
  }, [])

  const onMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    isPanning.current = false
    e.currentTarget.style.cursor = 'grab'
  }, [])

  const onMouseLeave = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    isPanning.current = false
    e.currentTarget.style.cursor = 'grab'
  }, [])

  // Wheel handler — must be native (not React synthetic) to call preventDefault
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()

    setCamera(cam => {
      // Pinch/trackpad uses ctrlKey + small deltaY
      const delta = e.ctrlKey ? e.deltaY * 3 : e.deltaY
      const factor = Math.exp(-delta * ZOOM_SPEED)
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, cam.scale * factor))

      // Zoom centered on cursor: keep the world point under cursor fixed
      const svgX = e.clientX - rect.left
      const svgY = e.clientY - rect.top
      const worldX = svgX / cam.scale + cam.x
      const worldY = svgY / cam.scale + cam.y

      const newX = worldX - svgX / newScale
      const newY = worldY - svgY / newScale

      return { x: newX, y: newY, scale: newScale }
    })
  }, [])

  // Attach wheel listener as non-passive so we can preventDefault
  useEffect(() => {
    const el = containerRef.current?.querySelector('svg') as SVGSVGElement | null
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // Build the transform string for the scene <g>
  // translate(-camera.x * scale, -camera.y * scale) scale(scale)
  // Equivalent: first scale world coords, then shift viewport
  const transform = `scale(${camera.scale}) translate(${-camera.x}, ${-camera.y})`

  return {
    camera,
    transform,
    handlers: { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel },
    fitToContent,
    zoomToPoint,
    reset,
    containerRef,
  }
}
