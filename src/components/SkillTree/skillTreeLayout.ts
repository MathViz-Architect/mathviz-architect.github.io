// skillTreeLayout.ts
// Lane-based layout: topics are grouped into subject columns (lanes),
// then ordered top-to-bottom by dependency depth within each lane.
// This creates a curriculum-like grid instead of a chaotic graph.

export interface RawNode {
  id: string
  prerequisites: string[]
}

export interface PositionedNode extends RawNode {
  x: number
  y: number
  layer: number
  col: number
  lane: number
}

export interface LaneConfig {
  index: number
  label: string
  color: string
  ids: Set<string>
}

const DEFAULT_LANE_GROUPS: Array<{ label: string; color: string; patterns: string[] }> = [
  {
    label: 'Числа и арифметика',
    color: '#7F77DD',
    patterns: [
      'comparison', 'arithmetic', 'divisors', 'patterns', 'magicSquare', 'olympiad',
      'divisibility_rules', 'prime_factorization', 'gcd', 'lcm',
      'powerOfNumber', 'productOfPowers', 'powerOfPower', 'divisionOfPowers',
      'powers',
    ],
  },
  {
    label: 'Дроби и пропорции',
    color: '#EF9F27',
    patterns: [
      'fraction_property', 'fraction_reduction', 'common_denominator',
      'fraction_add_sub', 'fraction_mul', 'fraction_div',
      'ratios', 'proportions', 'direct_proportion',
      'percent_basics', 'percent_of_number', 'number_by_percent', 'percent_change',
    ],
  },
  {
    label: 'Алгебра',
    color: '#1D9E75',
    patterns: [
      'linear_equations_basic', 'linear_equations_brackets', 'word_problems_equations',
      'monomialStdForm', 'monomialMultiply', 'monomialPower', 'monomials',
      'likeTerms', 'polyAddition', 'polySubtraction', 'polyMultiply', 'polynomials',
      'squareOfSum', 'squareOfDiff', 'diffOfSquares', 'factoringApply', 'factoring',
      'linearEqSimple', 'linearEqTranspose', 'linearEqBrackets', 'linearEquations7',
      'systemsSubstitution', 'systemsElimination', 'systems',
    ],
  },
  {
    label: 'Функции',
    color: '#D85A30',
    patterns: [
      'funcValue', 'funcCoefficients', 'linearFunctions',
    ],
  },
  {
    label: 'Геометрия',
    color: '#185FA5',
    patterns: [
      'perimeter', 'area', 'triangles', 'circles', 'figureArea',
      'coordinate_plane', 'quadrants', 'distance_on_axis',
      'corrAngles', 'altAngles', 'coInteriorAngles', 'parallelLines',
      'triangleAngles', 'exteriorAngle',
      'congruenceSSS', 'congruenceSAS', 'congruenceASA',
      'triangleInequality', 'triangleCongruence',
    ],
  },
]

export function buildLanes(nodeIds: string[]): Map<string, LaneConfig> {
  const map = new Map<string, LaneConfig>()
  const laneConfigs: LaneConfig[] = DEFAULT_LANE_GROUPS.map((g, i) => ({
    index: i,
    label: g.label,
    color: g.color,
    ids: new Set(g.patterns.filter(p => nodeIds.includes(p))),
  }))

  // Fallback lane for unknown IDs
  const fallbackLane: LaneConfig = {
    index: laneConfigs.length,
    label: 'Другое',
    color: '#888780',
    ids: new Set<string>(),
  }

  for (const id of nodeIds) {
    let assigned = false
    for (const lc of laneConfigs) {
      if (lc.ids.has(id)) {
        map.set(id, lc)
        assigned = true
        break
      }
    }
    if (!assigned) {
      fallbackLane.ids.add(id)
      map.set(id, fallbackLane)
    }
  }
  return map
}

const ROW_HEIGHT   = 96
const NODE_H_CONST = 56
const LANE_WIDTH   = 192
const LANE_PADDING = 24

export function computeLayout(nodes: RawNode[]): PositionedNode[] {
  if (nodes.length === 0) return []

  const ids = new Set(nodes.map(n => n.id))

  const prereqsOf: Record<string, string[]> = {}
  for (const n of nodes) {
    prereqsOf[n.id] = n.prerequisites.filter(p => ids.has(p))
  }

  const depth: Record<string, number> = {}
  const computing = new Set<string>()

  function getDepth(id: string): number {
    if (depth[id] !== undefined) return depth[id]
    if (computing.has(id)) return 0
    computing.add(id)
    const prereqs = prereqsOf[id] || []
    depth[id] = prereqs.length === 0
      ? 0
      : Math.max(...prereqs.map(p => getDepth(p))) + 1
    computing.delete(id)
    return depth[id]
  }
  for (const n of nodes) getDepth(n.id)

  const laneMap = buildLanes(Array.from(ids))

  const activeLanes = DEFAULT_LANE_GROUPS
    .map((g, i) => ({ ...g, index: i }))
    .filter(g => nodes.some(n => laneMap.get(n.id)?.label === g.label))

  // Check for fallback lane
  const hasFallback = Array.from(laneMap.values()).some(l => l.label === 'Другое')
  if (hasFallback) {
    activeLanes.push({ label: 'Другое', color: '#888780', patterns: [], index: activeLanes.length })
  }

  const laneIndexMap = new Map(activeLanes.map((l, i) => [l.label, i]))

  const slots: Map<string, string[]> = new Map()
  for (const n of nodes) {
    const lane = laneMap.get(n.id)
    const laneIdx = laneIndexMap.get(lane?.label ?? '') ?? 0
    const d = depth[n.id]
    const key = `${laneIdx}-${d}`
    if (!slots.has(key)) slots.set(key, [])
    slots.get(key)!.push(n.id)
  }

  for (const [, nodeIds] of slots) {
    nodeIds.sort((a, b) => prereqsOf[a].length - prereqsOf[b].length)
  }

  const position: Record<string, { x: number; y: number; col: number }> = {}

  for (const [key, nodeIds] of slots) {
    const [laneIdxStr, depthStr] = key.split('-')
    const laneIdx = parseInt(laneIdxStr)
    const d = parseInt(depthStr)

    const laneX = laneIdx * LANE_WIDTH + LANE_PADDING
    const baseY = d * ROW_HEIGHT

    nodeIds.forEach((id, slotRow) => {
      const subOffset = slotRow * (NODE_H_CONST + 12)
      position[id] = {
        x: laneX,
        y: baseY + subOffset,
        col: slotRow,
      }
    })
  }

  return nodes.map(n => {
    const pos = position[n.id] ?? { x: 0, y: 0, col: 0 }
    const lane = laneMap.get(n.id)
    const laneIdx = laneIndexMap.get(lane?.label ?? '') ?? 0
    return {
      ...n,
      prerequisites: prereqsOf[n.id],
      x: pos.x,
      y: pos.y,
      layer: depth[n.id],
      col: pos.col,
      lane: laneIdx,
    }
  })
}

export function getLaneMetadata(nodes: RawNode[]): Array<{
  label: string
  color: string
  laneIndex: number
  x: number
  width: number
  minY: number
  maxY: number
}> {
  if (nodes.length === 0) return []

  const ids = new Set(nodes.map(n => n.id))
  const laneMap = buildLanes(Array.from(ids))
  const positioned = computeLayout(nodes)

  const activeLanes = DEFAULT_LANE_GROUPS
    .map((g, i) => ({ ...g, index: i }))
    .filter(g => nodes.some(n => laneMap.get(n.id)?.label === g.label))

  const laneIndexMap = new Map(activeLanes.map((l, i) => [l.label, i]))

  return activeLanes.map((lane, i) => {
    const laneNodes = positioned.filter(p => {
      const l = laneMap.get(p.id)
      return laneIndexMap.get(l?.label ?? '') === i
    })
    const ys = laneNodes.map(p => p.y)
    return {
      label: lane.label,
      color: lane.color,
      laneIndex: i,
      x: i * LANE_WIDTH,
      width: LANE_WIDTH,
      minY: ys.length ? Math.min(...ys) : 0,
      maxY: ys.length ? Math.max(...ys) + NODE_H_CONST : NODE_H_CONST,
    }
  })
}

export const NODE_W_LAYOUT = 148
export const NODE_H_LAYOUT = NODE_H_CONST
export const LANE_WIDTH_EXPORT = LANE_WIDTH
