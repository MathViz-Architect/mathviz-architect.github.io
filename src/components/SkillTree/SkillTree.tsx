// SkillTree.tsx — educational curriculum roadmap
// CSS Grid layout, no SVG, no graph rendering.
// UX-polished: next-topic highlight, sticky headers, responsive, accessible.

import React, { useState, useMemo, useEffect, useRef } from 'react'

// ─── CSS animations injected once ────────────────────────────────────────────

const KEYFRAMES = `
@keyframes st-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,159,39,0.5), 0 1px 4px rgba(0,0,0,0.08); }
  50%       { box-shadow: 0 0 0 5px rgba(239,159,39,0),  0 1px 4px rgba(0,0,0,0.08); }
}
@keyframes st-fadein {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes st-unlock {
  0%   { box-shadow: 0 0 0 0 rgba(239,159,39,0.7); }
  60%  { box-shadow: 0 0 0 8px rgba(239,159,39,0); }
  100% { box-shadow: 0 0 0 0 rgba(239,159,39,0); }
}
`

function useInjectStyles() {
  useEffect(() => {
    const id = 'skill-tree-styles'
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = KEYFRAMES
    document.head.appendChild(el)
  }, [])
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SkillTreeTopic {
  id: string
  title: string
  prerequisites: string[]
}

export interface SkillTreeProgress {
  [topicId: string]: 'locked' | 'unlocked' | 'completed'
}

interface SkillTreeProps {
  topics: SkillTreeTopic[]
  progress?: SkillTreeProgress
  onTopicClick?: (topicId: string) => void
  filterIds?: string[]
}

type NodeState = 'locked' | 'unlocked' | 'completed'

// ─── Lane definitions ─────────────────────────────────────────────────────────

const LANES: Array<{ id: string; label: string; color: string; topicIds: string[] }> = [
  {
    id: 'numbers', label: 'Числа', color: '#7F77DD',
    topicIds: [
      // Grade 5
      'comparison', 'arithmetic', 'divisors', 'patterns', 'magicSquare', 'olympiad',
      // Grade 6 — делимость
      'divisibility_rules', 'prime_factorization', 'gcd', 'lcm',
    ],
  },
  {
    id: 'fractions', label: 'Дроби и %', color: '#EF9F27',
    topicIds: [
      'fraction_property', 'fraction_reduction', 'common_denominator',
      'fraction_add_sub', 'fraction_mul', 'fraction_div',
      'ratios', 'proportions', 'direct_proportion',
      'percent_basics', 'percent_of_number', 'number_by_percent', 'percent_change',
    ],
  },
  {
    id: 'algebra', label: 'Алгебра', color: '#1D9E75',
    topicIds: [
      // Grade 6
      'linear_equations_basic', 'linear_equations_brackets', 'word_problems_equations',
      // Grade 7 — степени (entry topic для Grade 7)
      'powerOfNumber', 'productOfPowers', 'powerOfPower', 'divisionOfPowers', 'powers',
      // Grade 7 — одночлены
      'monomialStdForm', 'monomialMultiply', 'monomialPower', 'monomials',
      // Grade 7 — многочлены
      'likeTerms', 'polyAddition', 'polySubtraction', 'polyMultiply', 'polynomials',
      // Grade 7 — ФСУ
      'squareOfSum', 'squareOfDiff', 'diffOfSquares', 'factoringApply', 'factoring',
      // Grade 7 — уравнения
      'linearEqSimple', 'linearEqTranspose', 'linearEqBrackets', 'linearEquations7',
      // Grade 7 — функции (в одной колонке с алгеброй, цепочка не рвётся)
      'funcValue', 'funcCoefficients', 'linearFunctions',
      // Grade 7 — системы
      'systemsSubstitution', 'systemsElimination', 'systems',
      // Grade 8 — квадратный трёхчлен и уравнения
      'quadraticTrinomial', 'trinomialFactoring', 'quadraticIncomplete',
      'quadraticFormula', 'vietasTheorem', 'quadraticWordProblems',
    ],
  },
  {
    id: 'geometry', label: 'Геометрия', color: '#185FA5',
    topicIds: [
      // Grade 5–6
      'perimeter', 'area', 'triangles', 'circles', 'figureArea',
      'coordinate_plane', 'quadrants', 'distance_on_axis',
      // Grade 7
      'corrAngles', 'altAngles', 'coInteriorAngles', 'parallelLines',
      'triangleAngles', 'exteriorAngle',
      'congruenceSSS', 'congruenceSAS', 'congruenceASA',
      'triangleInequality', 'triangleCongruence',
      // Grade 8
      'pythagoreanTheorem', 'triangleSimilarityAA', 'quadrilateralArea',
      'inscribedAngle', 'distanceFormula',
    ],
  },
]

// ─── State derivation ─────────────────────────────────────────────────────────

function deriveState(topic: SkillTreeTopic, progress: SkillTreeProgress): NodeState {
  const explicit = progress[topic.id]
  if (explicit) return explicit
  // No prerequisites → entry topic, always unlocked
  if (topic.prerequisites.length === 0) return 'unlocked'
  // All prerequisites completed → unlocked
  const allMet = topic.prerequisites.every(p => progress[p] === 'completed')
  return allMet ? 'unlocked' : 'locked'
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SkillTree({ topics, progress = {}, onTopicClick, filterIds }: SkillTreeProps) {
  useInjectStyles()

  const [selected, setSelected] = useState<string | null>(null)
  const infoPanelRef = useRef<HTMLDivElement>(null)

  const filteredTopics = useMemo(
    () => filterIds ? topics.filter(t => filterIds.includes(t.id)) : topics,
    [topics, filterIds]
  )

  const topicById = useMemo(
    () => Object.fromEntries(filteredTopics.map(t => [t.id, t])),
    [filteredTopics]
  )

  const assignedIds = useMemo(() => new Set(LANES.flatMap(l => l.topicIds)), [])

  const activeLanes = useMemo(() =>
    LANES.map(lane => ({
      ...lane,
      topics: lane.topicIds.map(id => topicById[id]).filter(Boolean) as SkillTreeTopic[],
    })).filter(l => l.topics.length > 0),
    [topicById]
  )

  const unassigned = useMemo(
    () => filteredTopics.filter(t => !assignedIds.has(t.id)),
    [filteredTopics, assignedIds]
  )

  // "Next topic" = first unlocked topic across all lanes (left-to-right, top-to-bottom)
  const nextTopicId = useMemo(() => {
    for (const lane of activeLanes) {
      for (const topic of lane.topics) {
        if (deriveState(topic, progress) === 'unlocked') return topic.id
      }
    }
    return null
  }, [activeLanes, progress])

  // Global stats
  const completedCount = filteredTopics.filter(t => progress[t.id] === 'completed').length
  const totalCount = filteredTopics.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const selectedTopic = selected ? topicById[selected] : null
  const selectedState = selectedTopic ? deriveState(selectedTopic, progress) : null
  const titleOf = (id: string) => topicById[id]?.title ?? id

  // Scroll info panel into view when topic is selected on mobile
  useEffect(() => {
    if (selected && infoPanelRef.current) {
      infoPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  const handleSelect = (id: string) => {
    setSelected(prev => prev === id ? null : id)
    onTopicClick?.(id)
  }

  const colCount = activeLanes.length + (unassigned.length > 0 ? 1 : 0)

  return (
    <div style={{ width: '100%', fontFamily: 'inherit' }}>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        <ProgressBar pct={progressPct} completed={completedCount} total={totalCount} />
        <StateLegend />
      </div>

      {/* ── Scrollable grid container ─────────────────────────────────────── */}
      {/* overflow-x:auto enables horizontal scroll on narrow screens        */}
      <div
        style={{ overflowX: 'auto', paddingBottom: 4 }}
        role="region"
        aria-label="Карта навыков"
      >
        <div style={{
          display: 'grid',
          // minmax(160px,1fr) makes columns shrink gracefully on tablet/mobile
          gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`,
          gap: 10,
          alignItems: 'start',
          // Prevent the grid from squeezing below readable width
          minWidth: `${colCount * 170}px`,
        }}>
          {activeLanes.map(lane => (
            <LaneColumn
              key={lane.id}
              label={lane.label}
              color={lane.color}
              topics={lane.topics}
              progress={progress}
              selected={selected}
              nextTopicId={nextTopicId}
              onSelect={handleSelect}
            />
          ))}
          {unassigned.length > 0 && (
            <LaneColumn
              label="Другое"
              color="#888780"
              topics={unassigned}
              progress={progress}
              selected={selected}
              nextTopicId={nextTopicId}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>

      {/* ── Info panel ────────────────────────────────────────────────────── */}
      <div ref={infoPanelRef}>
        {selectedTopic ? (
          <InfoPanel
            topic={selectedTopic}
            state={selectedState!}
            titleOf={titleOf}
            onStart={() => onTopicClick?.(selectedTopic.id)}
          />
        ) : (
          <div style={{
            marginTop: 8, fontSize: 11,
            color: 'var(--color-text-tertiary)', textAlign: 'right',
          }}>
            Нажмите на тему, чтобы узнать подробности
          </div>
        )}
      </div>
    </div>
  )
}

// ─── LaneColumn ───────────────────────────────────────────────────────────────

interface LaneColumnProps {
  label: string
  color: string
  topics: SkillTreeTopic[]
  progress: SkillTreeProgress
  selected: string | null
  nextTopicId: string | null
  onSelect: (id: string) => void
}

function LaneColumn({ label, color, topics, progress, selected, nextTopicId, onSelect }: LaneColumnProps) {
  const completedCount = topics.filter(t => progress[t.id] === 'completed').length
  const unlockedCount  = topics.filter(t => deriveState(t, progress) === 'unlocked').length
  const pct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0
  const isComplete = completedCount === topics.length && topics.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--color-background-secondary)',
          borderRadius: 10,
          border: `1px solid ${color}50`,
          borderTop: `3px solid ${color}`,
          padding: '10px 12px 9px',
          marginBottom: 6,
          // Subtle backdrop so sticky header stays readable when scrolling
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        role="columnheader"
        aria-label={`${label}: ${completedCount} из ${topics.length} пройдено`}
      >
        {/* Subject name + completion badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {label}
          </span>
          {isComplete ? (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: '#EAF3DE', color: '#3B6D11',
              border: '1px solid #97C459',
              borderRadius: 10, padding: '2px 6px',
            }}>✓ Готово</span>
          ) : unlockedCount > 0 ? (
            <span style={{
              fontSize: 9, fontWeight: 600,
              background: '#FAEEDA', color: '#854F0B',
              border: '1px solid #EF9F27',
              borderRadius: 10, padding: '2px 6px',
            }}>{unlockedCount} открыто</span>
          ) : null}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            flex: 1, height: 5, borderRadius: 3,
            background: 'var(--color-border-tertiary)',
            overflow: 'hidden',
          }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% пройдено`}
          >
            <div style={{
              height: '100%', width: `${pct}%`,
              background: isComplete
                ? '#639922'
                : `linear-gradient(90deg, ${color}bb, ${color})`,
              borderRadius: 3,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{
            fontSize: 10, color: 'var(--color-text-tertiary)',
            flexShrink: 0, minWidth: 28, textAlign: 'right',
          }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* ── Topic nodes ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: 5,
          padding: '2px 2px 6px',
        }}
        role="list"
        aria-label={`Темы: ${label}`}
      >
        {topics.map(topic => {
          const state = deriveState(topic, progress)
          return (
            <TopicNode
              key={topic.id}
              topic={topic}
              state={state}
              accentColor={color}
              isSelected={selected === topic.id}
              isNext={topic.id === nextTopicId}
              onClick={() => onSelect(topic.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── TopicNode ────────────────────────────────────────────────────────────────

interface TopicNodeProps {
  topic: SkillTreeTopic
  state: NodeState
  accentColor: string
  isSelected: boolean
  isNext: boolean
  onClick: () => void
}

const STATE_CONFIG: Record<NodeState, {
  bg: string
  bgHover: string
  bgSelected: string
  border: string
  borderSelected: string
  text: string
  subText: string
  iconChar: string
  iconBg: string
  iconColor: string
  opacity: number
  ariaState: string
}> = {
  locked: {
    bg: 'var(--color-background-primary)',
    bgHover: 'var(--color-background-primary)',
    bgSelected: 'var(--color-background-secondary)',
    border: 'var(--color-border-tertiary)',
    borderSelected: 'var(--color-border-secondary)',
    text: 'var(--color-text-tertiary)',
    subText: 'var(--color-text-tertiary)',
    iconChar: '🔒',
    iconBg: '#E5E3DB',
    iconColor: '#B4B2A9',
    opacity: 0.65,
    ariaState: 'заблокировано',
  },
  unlocked: {
    bg: '#FAEEDA',
    bgHover: '#F5E3C4',
    bgSelected: '#F0D9B0',
    border: '#EF9F27',
    borderSelected: '#BA7517',
    text: '#633806',
    subText: '#854F0B',
    iconChar: '★',
    iconBg: '#FAC775',
    iconColor: '#633806',
    opacity: 1,
    ariaState: 'доступно',
  },
  completed: {
    bg: '#EAF3DE',
    bgHover: '#DFF0CF',
    bgSelected: '#D2EAC0',
    border: '#97C459',
    borderSelected: '#639922',
    text: '#27500A',
    subText: '#3B6D11',
    iconChar: '✓',
    iconBg: '#97C459',
    iconColor: '#173404',
    opacity: 1,
    ariaState: 'пройдено',
  },
}

function TopicNode({ topic, state, accentColor, isSelected, isNext, onClick }: TopicNodeProps) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATE_CONFIG[state]
  const interactive = state !== 'locked'

  // Choose background based on priority: selected > hovered > default
  const bg = isSelected ? cfg.bgSelected : hovered && interactive ? cfg.bgHover : cfg.bg
  const borderColor = isSelected ? cfg.borderSelected : isNext ? '#EF9F27' : cfg.border

  return (
    <div
      role="listitem"
      style={{ animation: state === 'unlocked' ? 'st-fadein 0.3s ease both' : 'none' }}
    >
      <button
        onClick={interactive ? onClick : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={state === 'locked'}
        aria-pressed={isSelected}
        aria-label={`${topic.title}, ${cfg.ariaState}${topic.prerequisites.length > 0 ? `, требуется: ${topic.prerequisites.join(', ')}` : ''}`}
        aria-disabled={state === 'locked'}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          width: '100%',
          // Generous padding for touch targets (min 44px height)
          padding: '10px 10px 10px 8px',
          background: bg,
          // Left accent stripe encodes the lane color
          borderLeft: `3px solid ${isNext ? '#EF9F27' : state === 'locked' ? 'var(--color-border-tertiary)' : accentColor}`,
          borderTop: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderRadius: 8,
          cursor: interactive ? 'pointer' : 'default',
          opacity: cfg.opacity,
          textAlign: 'left',
          transition: 'background 0.12s, border-color 0.12s, box-shadow 0.15s',
          // Elevation: selected > next > default
          boxShadow: isSelected
            ? `0 0 0 2px ${accentColor}60, 0 2px 6px rgba(0,0,0,0.08)`
            : isNext
              ? '0 0 0 0 rgba(239,159,39,0.5), 0 2px 6px rgba(0,0,0,0.06)'
              : '0 1px 2px rgba(0,0,0,0.04)',
          // Pulse animation only for the "next" topic — draws attention without overload
          animation: isNext ? 'st-pulse 2.4s ease-in-out infinite' : 'none',
          // Focus ring for keyboard navigation
          outline: 'none',
        }}
        onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}80` }}
        onBlur={e => {
          e.currentTarget.style.boxShadow = isSelected
            ? `0 0 0 2px ${accentColor}60, 0 2px 6px rgba(0,0,0,0.08)`
            : isNext
              ? '0 0 0 0 rgba(239,159,39,0.5), 0 2px 6px rgba(0,0,0,0.06)'
              : '0 1px 2px rgba(0,0,0,0.04)'
        }}
      >
        {/* Icon badge */}
        <span
          aria-hidden="true"
          style={{
            width: 26, height: 26,
            borderRadius: '50%',
            background: cfg.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: state === 'completed' ? 12 : 11,
            flexShrink: 0,
            color: cfg.iconColor,
            marginTop: 1,
          }}
        >
          {cfg.iconChar}
        </span>

        {/* Text content */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontSize: 12,
            fontWeight: state === 'locked' ? 400 : 600,
            color: cfg.text,
            lineHeight: 1.35,
            wordBreak: 'break-word',
          }}>
            {topic.title}
          </span>
          {/* "Следующая" label — only on the next topic */}
          {isNext && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              marginTop: 3,
              fontSize: 10, fontWeight: 700,
              color: '#854F0B',
              background: '#FAC775',
              borderRadius: 4,
              padding: '1px 5px',
            }}>
              → Следующая
            </span>
          )}
        </span>
      </button>
    </div>
  )
}

// ─── InfoPanel ────────────────────────────────────────────────────────────────

interface InfoPanelProps {
  topic: SkillTreeTopic
  state: NodeState
  titleOf: (id: string) => string
  onStart: () => void
}

function InfoPanel({ topic, state, titleOf, onStart }: InfoPanelProps) {
  const tagCfg: Record<NodeState, { bg: string; text: string; border: string; label: string }> = {
    locked:    { bg: '#F1EFE8', text: '#888780', border: '#D3D1C7', label: '🔒 Закрыто' },
    unlocked:  { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27', label: '★ Доступно' },
    completed: { bg: '#EAF3DE', text: '#3B6D11', border: '#639922', label: '✓ Пройдено' },
  }
  const tag = tagCfg[state]

  return (
    <div
      role="region"
      aria-label={`Информация о теме: ${topic.title}`}
      style={{
        marginTop: 12,
        padding: '14px 16px',
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-secondary)',
        borderRadius: 12,
        animation: 'st-fadein 0.2s ease both',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span style={{
          background: tag.bg, color: tag.text, border: `1px solid ${tag.border}`,
          fontSize: 11, fontWeight: 700,
          padding: '3px 9px', borderRadius: 8, flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          {tag.label}
        </span>
        <span style={{
          fontSize: 15, fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.3,
        }}>
          {topic.title}
        </span>
      </div>

      {/* Prerequisites */}
      {topic.prerequisites.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: 5,
          }}>
            Требуется:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {topic.prerequisites.map(id => (
              <span key={id} style={{
                fontSize: 12,
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-tertiary)',
                borderRadius: 6, padding: '3px 9px',
                color: 'var(--color-text-secondary)',
              }}>
                {titleOf(id)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action area */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {state === 'unlocked' && (
          <button
            onClick={onStart}
            aria-label={`Начать тему: ${topic.title}`}
            style={{
              padding: '8px 18px',
              background: '#EF9F27',
              color: '#412402',
              border: '1px solid #BA7517',
              borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#BA7517'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#EF9F27'; (e.currentTarget as HTMLElement).style.color = '#412402' }}
          >
            Начать →
          </button>
        )}
        {state === 'completed' && (
          <button
            onClick={onStart}
            aria-label={`Повторить тему: ${topic.title}`}
            style={{
              padding: '8px 18px',
              background: '#EAF3DE',
              color: '#27500A',
              border: '1px solid #639922',
              borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↺ Повторить
          </button>
        )}
        {state === 'locked' && (
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            Пройдите предыдущие темы, чтобы открыть
          </span>
        )}
      </div>
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ pct, completed, total }: { pct: number; completed: number; total: number }) {
  return (
    <div style={{
      flex: 1, minWidth: 200, maxWidth: 360,
      background: 'var(--color-background-secondary)',
      border: '1px solid var(--color-border-tertiary)',
      borderRadius: 12, padding: '8px 14px',
    }}
      role="progressbar"
      aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
      aria-label={`Общий прогресс: ${pct}%`}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 5,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Общий прогресс
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
          {completed} / {total} тем
        </span>
      </div>
      <div style={{
        height: 7, borderRadius: 4,
        background: 'var(--color-border-tertiary)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: pct === 100
            ? '#639922'
            : `linear-gradient(90deg, #639922 0%, #97C459 100%)`,
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// ─── StateLegend ──────────────────────────────────────────────────────────────

function StateLegend() {
  return (
    <div
      style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}
      aria-label="Обозначения"
      role="note"
    >
      {([
        { icon: '🔒', label: 'Закрыто',  color: '#B4B2A9' },
        { icon: '★',  label: 'Доступно', color: '#854F0B' },
        { icon: '✓',  label: 'Пройдено', color: '#3B6D11' },
      ] as const).map(({ icon, label, color }) => (
        <span key={label} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: 'var(--color-text-secondary)',
        }}>
          <span aria-hidden="true" style={{ color }}>{icon}</span>
          {label}
        </span>
      ))}
    </div>
  )
}
