// SkillEdge.tsx
// Edges use world-space coordinates (same as nodes).
// vectorEffect="non-scaling-stroke" keeps stroke width visually constant at any zoom.

import React from 'react'
import type { NodeState } from './SkillNode'

interface SkillEdgeProps {
  /** Center-bottom of parent node (world space) */
  x1: number
  y1: number
  /** Center-top of child node (world space) */
  x2: number
  y2: number
  fromState: NodeState
  toState: NodeState
  crossLane?: boolean
}

export function SkillEdge({ x1, y1, x2, y2, fromState, toState, crossLane }: SkillEdgeProps) {
  const isCompleted = fromState === 'completed' && toState === 'completed'
  const isActive    = fromState === 'completed' && toState === 'unlocked'
  const isCrossLane = crossLane === true

  // Smooth cubic bezier: control points pull vertically out of each endpoint
  const dy = Math.abs(y2 - y1)
  const tension = Math.min(dy * 0.45, 64)
  const d = `M ${x1} ${y1} C ${x1} ${y1 + tension}, ${x2} ${y2 - tension}, ${x2} ${y2}`

  const stroke = isCompleted ? '#639922'
    : isActive    ? '#EF9F27'
    : '#D3D1C7'

  // Visual width in screen pixels (constant regardless of zoom due to vectorEffect)
  const strokeWidth = isCompleted || isActive ? 1.5 : 1

  const opacity = isCompleted ? 0.55
    : isActive    ? 0.60
    : isCrossLane ? 0.18
    : 0.25

  const dash = toState === 'locked'
    ? '4 5'
    : isCrossLane
      ? '3 7'
      : undefined

  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
      strokeLinecap="round"
      opacity={opacity}
      // This is the key fix: stroke renders at constant screen width regardless of SVG scale
      vectorEffect="non-scaling-stroke"
      style={{ transition: 'stroke 0.25s, opacity 0.25s' }}
    />
  )
}
