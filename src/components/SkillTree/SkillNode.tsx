// SkillNode.tsx
// Nodes use world-space coordinates. The camera transform handles all scaling.
// non-scaling-stroke keeps borders crisp at any zoom level.

import React, { useState } from 'react'

export type NodeState = 'locked' | 'unlocked' | 'completed'

export interface SkillNodeProps {
  id: string
  title: string
  state: NodeState
  /** Top-left corner x in world space */
  x: number
  /** Top-left corner y in world space */
  y: number
  onClick: (id: string) => void
  onDoubleClick?: (id: string) => void
  isSelected?: boolean
}

export const NODE_W = 148
export const NODE_H = 56
const NODE_R = 10

const THEMES: Record<NodeState, {
  fill: string
  fillHover: string
  stroke: string
  strokeSel: string
  textColor: string
  subColor: string
  iconBg: string
  iconColor: string
  icon: string
  shadowColor: string
  opacity: number
}> = {
  locked: {
    fill: '#F1EFE8', fillHover: '#EAE8E0',
    stroke: '#D3D1C7', strokeSel: '#B4B2A9',
    textColor: '#B4B2A9', subColor: '#CECCC3',
    iconBg: '#E5E3DB', iconColor: '#B4B2A9',
    icon: '🔒', shadowColor: 'transparent', opacity: 0.72,
  },
  unlocked: {
    fill: '#FAEEDA', fillHover: '#F5E5C8',
    stroke: '#EF9F27', strokeSel: '#BA7517',
    textColor: '#633806', subColor: '#854F0B',
    iconBg: '#FAC775', iconColor: '#633806',
    icon: '★', shadowColor: '#EF9F2730', opacity: 1,
  },
  completed: {
    fill: '#EAF3DE', fillHover: '#DEECD0',
    stroke: '#639922', strokeSel: '#3B6D11',
    textColor: '#27500A', subColor: '#3B6D11',
    iconBg: '#97C459', iconColor: '#173404',
    icon: '✓', shadowColor: '#63992230', opacity: 1,
  },
}

export function SkillNode({ id, title, state, x, y, onClick, onDoubleClick, isSelected }: SkillNodeProps) {
  const [hovered, setHovered] = useState(false)
  const t = THEMES[state]
  const interactive = state !== 'locked'

  // Two-line wrapping at word boundary ≤17 chars
  const words = title.split(' ')
  let line1 = ''
  let line2 = ''
  for (const w of words) {
    if (!line1) { line1 = w; continue }
    if ((line1 + ' ' + w).length <= 17) {
      line1 += ' ' + w
    } else {
      line2 += (line2 ? ' ' : '') + w
    }
  }
  if (line2.length > 17) line2 = line2.slice(0, 16) + '…'
  const twoLines = line2.length > 0

  const fill   = hovered && interactive ? t.fillHover : t.fill
  const stroke = isSelected ? t.strokeSel : t.stroke
  const sw     = isSelected ? 2 : 1

  const ICON_CX = 20     // icon circle center x (relative to node)
  const TEXT_X  = 38     // text start x

  return (
    <g
      className="skill-node"
      transform={`translate(${x}, ${y})`}
      onClick={() => interactive && onClick(id)}
      onDoubleClick={() => onDoubleClick?.(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: state === 'locked' ? 'default' : 'pointer',
        opacity: t.opacity,
      }}
    >
      {/* Subtle shadow for active nodes */}
      {state !== 'locked' && (
        <rect
          x={1} y={3}
          width={NODE_W} height={NODE_H}
          rx={NODE_R + 1}
          fill={t.shadowColor}
        />
      )}

      {/* Card */}
      <rect
        width={NODE_W} height={NODE_H} rx={NODE_R}
        fill={fill} stroke={stroke} strokeWidth={sw}
        style={{ transition: 'fill 0.15s' }}
        // non-scaling-stroke keeps the border 1px regardless of zoom
        vectorEffect="non-scaling-stroke"
      />

      {/* Left accent bar (flush inside the card) */}
      <rect
        x={0} y={0} width={4} height={NODE_H} rx={NODE_R / 2}
        fill={stroke}
        opacity={state === 'locked' ? 0.3 : 0.65}
        vectorEffect="non-scaling-stroke"
      />
      {/* Fill right half of bar — avoids corner gap */}
      <rect x={2} y={0} width={2} height={NODE_H} fill={stroke} opacity={state === 'locked' ? 0.3 : 0.65} />

      {/* Icon circle */}
      <circle cx={ICON_CX} cy={NODE_H / 2} r={12} fill={t.iconBg} opacity={0.6} />
      <text
        x={ICON_CX} y={NODE_H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={state === 'completed' ? 12 : 10}
        fill={t.iconColor} fontWeight="600"
        style={{ userSelect: 'none' }}
      >{t.icon}</text>

      {/* Title — 1 or 2 lines */}
      {twoLines ? (
        <>
          <text
            x={TEXT_X} y={NODE_H / 2 - 8}
            dominantBaseline="central"
            fill={t.textColor} fontSize={11} fontWeight={600} fontFamily="inherit"
            style={{ userSelect: 'none' }}
          >{line1}</text>
          <text
            x={TEXT_X} y={NODE_H / 2 + 8}
            dominantBaseline="central"
            fill={t.subColor} fontSize={10} fontWeight={500} fontFamily="inherit"
            style={{ userSelect: 'none' }}
          >{line2}</text>
        </>
      ) : (
        <text
          x={TEXT_X} y={NODE_H / 2}
          dominantBaseline="central"
          fill={t.textColor} fontSize={11} fontWeight={600} fontFamily="inherit"
          style={{ userSelect: 'none' }}
        >{line1}</text>
      )}

      {/* Selection ring */}
      {isSelected && (
        <rect
          x={-4} y={-4} width={NODE_W + 8} height={NODE_H + 8} rx={NODE_R + 4}
          fill="none" stroke="#EF9F27" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.8}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  )
}

// Backward-compat exports
export const NODE_W_CONST = NODE_W
export const NODE_H_CONST = NODE_H
