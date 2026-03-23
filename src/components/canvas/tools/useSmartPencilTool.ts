// src/components/canvas/tools/useSmartPencilTool.ts
//
// Smart Pencil drawing tool with stroke improvement pipeline.
// Architecturally mirrors useFreehandTool — all real-time logic runs off refs.
// Pipeline: downsample → RDP simplify → Chaikin corner-cutting smooth → Ink-to-Shape.

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnyCanvasObject } from '@/lib/types';

// ── Pipeline constants ────────────────────────────────────────────────────────
const SMOOTHING_TENSION = 0.5;
const MIN_POINTS = 3;
const RDP_EPSILON = 3;    // pixels
const MAX_POINTS = 2000;

interface UseSmartPencilToolOptions {
    penSettings: { width: number; color: string };
    onAddObject: (obj: AnyCanvasObject, skipSelection?: boolean) => void;
    publishState: () => void;
    /** Current app mode — used to abort drawing on tool switch */
    mode: string;
}

export interface SmartPencilOverlay {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

// ── RDP (Ramer-Douglas-Peucker) ───────────────────────────────────────────────
function rdpSimplify(
    points: { x: number; y: number }[],
    epsilon: number
): { x: number; y: number }[] {
    if (points.length <= 2) return points;

    const first = points[0];
    const last = points[points.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const lineLen = Math.hypot(dx, dy);

    let maxDist = 0;
    let maxIdx = 0;

    for (let i = 1; i < points.length - 1; i++) {
        let d: number;
        if (lineLen === 0) {
            d = Math.hypot(points[i].x - first.x, points[i].y - first.y);
        } else {
            d = Math.abs(dy * points[i].x - dx * points[i].y + last.x * first.y - last.y * first.x) / lineLen;
        }
        if (d > maxDist) { maxDist = d; maxIdx = i; }
    }

    if (maxDist > epsilon) {
        const left = rdpSimplify(points.slice(0, maxIdx + 1), epsilon);
        const right = rdpSimplify(points.slice(maxIdx), epsilon);
        return [...left.slice(0, -1), ...right];
    }
    return [first, last];
}

// ── Chaikin corner-cutting ────────────────────────────────────────────────────
function chaikinSmooth(
    points: { x: number; y: number }[],
    tension: number
): { x: number; y: number }[] {
    if (points.length < 2) return points;
    const iterations = tension <= 0.5 ? 1 : 2;
    let pts = points;
    for (let iter = 0; iter < iterations; iter++) {
        const next: { x: number; y: number }[] = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i], p1 = pts[i + 1];
            next.push(
                { x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 },
                { x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 }
            );
        }
        next.push(pts[pts.length - 1]);
        pts = next;
    }
    return pts;
}

// ── Downsample ────────────────────────────────────────────────────────────────
function downsample(
    points: { x: number; y: number }[],
    maxPoints: number
): { x: number; y: number }[] {
    if (points.length <= maxPoints) return points;
    const step = Math.ceil(points.length / maxPoints);
    const result = points.filter((_, i) => i % step === 0);
    const last = points[points.length - 1];
    if (result[result.length - 1] !== last) result.push(last);
    return result;
}

// ── Ink-to-Shape constants ────────────────────────────────────────────────────
const LINE_RMS_RATIO = 0.035;
const LINE_MIN_LENGTH = 20;
const CLOSURE_THRESHOLD = 0.20;
const CIRCLE_VARIANCE_RATIO = 0.38;
const RECT_ORTHO_TOLERANCE = 30;
const RECT_ORTHO_COVERAGE = 0.72;
const RECT_CONFIDENCE_THRESHOLD = 0.68;
const MIN_SHAPE_POINTS = 6;
const SHAPE_CONFIDENCE_MIN = 0.65;

// Polygon extraction: 3–6 vertices
const POLY_MIN_VERTICES = 3;
const POLY_MAX_VERTICES = 6;
// Angle tolerance for "right angle" (degrees)
const RIGHT_ANGLE_TOL = 22;
// Parallel tolerance (degrees)
const PARALLEL_TOL = 15;
// Side length equality tolerance (fraction)
const SIDE_EQ_TOL = 0.25;

type Pt = { x: number; y: number };

// ── Geometry helpers ──────────────────────────────────────────────────────────
function dist(a: Pt, b: Pt): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function perpendicularDist(p: Pt, a: Pt, b: Pt): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return dist(p, a);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

function strokePerimeter(pts: Pt[]): number {
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
    return len;
}

/** Angle at vertex B formed by A→B→C, in degrees [0, 180] */
function angleDeg(a: Pt, b: Pt, c: Pt): number {
    const ax = a.x - b.x, ay = a.y - b.y;
    const cx = c.x - b.x, cy = c.y - b.y;
    const dot = ax * cx + ay * cy;
    const mag = Math.hypot(ax, ay) * Math.hypot(cx, cy);
    if (mag === 0) return 0;
    return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

/** Direction of segment A→B in degrees [-180, 180] */
function segmentDir(a: Pt, b: Pt): number {
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** Absolute angular difference between two directions, normalized to [0, 90] */
function angularDiff(d1: number, d2: number): number {
    let diff = Math.abs(d1 - d2) % 180;
    if (diff > 90) diff = 180 - diff;
    return diff;
}

/** Shoelace area of a polygon */
function polygonArea(pts: Pt[]): number {
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += pts[i].x * pts[j].y;
        area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
}

// ── extractPolygon ────────────────────────────────────────────────────────────
// Applies RDP with a larger epsilon to get polygon vertices.
// Returns null if vertex count is outside [POLY_MIN_VERTICES, POLY_MAX_VERTICES].
function extractPolygon(points: Pt[]): Pt[] | null {
    if (points.length < MIN_SHAPE_POINTS) return null;

    // Use a larger epsilon to get coarse corners
    const epsilon = Math.max(8, strokePerimeter(points) * 0.025);
    let verts = rdpSimplify(points, epsilon);

    // Remove near-duplicate endpoints (closed stroke)
    if (verts.length > 1 && dist(verts[0], verts[verts.length - 1]) < epsilon * 1.5) {
        verts = verts.slice(0, -1);
    }

    if (verts.length < POLY_MIN_VERTICES || verts.length > POLY_MAX_VERTICES) return null;
    return verts;
}

// ── analyzePolygon ────────────────────────────────────────────────────────────
interface PolygonAnalysis {
    angles: number[];       // interior angles at each vertex (degrees)
    sideLengths: number[];  // length of each side
    directions: number[];   // direction of each side (degrees)
    isClosed: boolean;
}

function analyzePolygon(verts: Pt[], rawPoints: Pt[]): PolygonAnalysis {
    const n = verts.length;
    const sideLengths: number[] = [];
    const directions: number[] = [];
    const angles: number[] = [];

    for (let i = 0; i < n; i++) {
        const a = verts[i];
        const b = verts[(i + 1) % n];
        sideLengths.push(dist(a, b));
        directions.push(segmentDir(a, b));
    }

    for (let i = 0; i < n; i++) {
        const prev = verts[(i - 1 + n) % n];
        const curr = verts[i];
        const next = verts[(i + 1) % n];
        angles.push(angleDeg(prev, curr, next));
    }

    const perim = strokePerimeter(rawPoints);
    const gap = dist(rawPoints[0], rawPoints[rawPoints.length - 1]);
    const isClosed = gap < perim * CLOSURE_THRESHOLD;

    return { angles, sideLengths, directions, isClosed };
}

// ── detectLine ────────────────────────────────────────────────────────────────
function detectLine(pts: Pt[]): { kind: 'line'; x1: number; y1: number; x2: number; y2: number; confidence: number } | null {
    if (pts.length < 2) return null;
    const first = pts[0], last = pts[pts.length - 1];
    const strokeLen = dist(first, last);
    if (strokeLen < LINE_MIN_LENGTH) return null;

    let sumSq = 0;
    for (const p of pts) {
        const d = perpendicularDist(p, first, last);
        sumSq += d * d;
    }
    const rms = Math.sqrt(sumSq / pts.length);
    const ratio = rms / strokeLen;
    if (ratio >= LINE_RMS_RATIO) return null;

    const confidence = 1 - ratio / LINE_RMS_RATIO;
    return { kind: 'line', x1: first.x, y1: first.y, x2: last.x, y2: last.y, confidence };
}

// ── detectCircle ──────────────────────────────────────────────────────────────
// Uses bounding-box center instead of centroid — more robust to uneven point density.
// Has a separate (looser) closure threshold since people rarely close circles perfectly.
const CIRCLE_CLOSURE_THRESHOLD = 0.30; // looser than polygon closure

function detectCircle(pts: Pt[]): { kind: 'circle'; cx: number; cy: number; r: number; confidence: number } | null {
    if (pts.length < MIN_SHAPE_POINTS) return null;

    // Closure check — use looser threshold specific to circles
    const perim = strokePerimeter(pts);
    const gap = dist(pts[0], pts[pts.length - 1]);
    if (gap > perim * CIRCLE_CLOSURE_THRESHOLD) return null;

    // Use bounding-box center — robust to uneven point density during drawing
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const radii = pts.map(p => dist(p, { x: cx, y: cy }));
    const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
    if (mean < 8) return null;

    // Check that the stroke actually spans ≥ 270° around the center
    // (prevents arcs / C-shapes from being recognized as circles)
    const angles = pts.map(p => Math.atan2(p.y - cy, p.x - cx));
    angles.sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < angles.length; i++) maxGap = Math.max(maxGap, angles[i] - angles[i - 1]);
    maxGap = Math.max(maxGap, angles[0] + 2 * Math.PI - angles[angles.length - 1]);
    const coverage = 2 * Math.PI - maxGap;
    if (coverage < (270 / 180) * Math.PI) return null;

    const variance = radii.reduce((s, r) => s + (r - mean) ** 2, 0) / radii.length;
    const stdDev = Math.sqrt(variance);
    const ratio = stdDev / mean;
    if (ratio >= CIRCLE_VARIANCE_RATIO) return null;

    // Use the bounding-box radius (more visually accurate than mean)
    const r = (Math.max(maxX - minX, maxY - minY)) / 2;

    const confidence = 1 - ratio / CIRCLE_VARIANCE_RATIO;
    return { kind: 'circle', cx, cy, r, confidence };
}

// ── detectRectangle (legacy, direction-clustering) ────────────────────────────
// Kept as a fast path for axis-aligned rectangles drawn with many points.
function detectRectangleFast(pts: Pt[]): { kind: 'rectangle'; x: number; y: number; w: number; h: number; confidence: number } | null {
    if (pts.length < MIN_SHAPE_POINTS) return null;

    const perim = strokePerimeter(pts);
    if (perim < 40) return null;
    const closureGap = dist(pts[0], pts[pts.length - 1]);
    const closureScore = Math.max(0, 1 - closureGap / (perim * CLOSURE_THRESHOLD));
    if (closureGap > perim * CLOSURE_THRESHOLD) return null;

    const windowSize = Math.max(3, Math.floor(pts.length / 20));
    type Seg = { angleDeg: number; len: number };
    const segments: Seg[] = [];

    for (let i = 0; i < pts.length - windowSize; i += Math.max(1, Math.floor(windowSize / 2))) {
        const a = pts[i], b = pts[i + windowSize];
        const len = dist(a, b);
        if (len < 2) continue;
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        segments.push({ angleDeg: angle, len });
    }
    if (segments.length < 4) return null;

    let hLen = 0, vLen = 0, otherLen = 0;
    for (const seg of segments) {
        const a = ((seg.angleDeg % 180) + 180) % 180;
        const distH = Math.min(a, 180 - a);
        const distV = Math.abs(a - 90);
        const minDist = Math.min(distH, distV);
        if (minDist > RECT_ORTHO_TOLERANCE) { otherLen += seg.len; }
        else if (distH < distV) { hLen += seg.len; }
        else { vLen += seg.len; }
    }

    const totalLen = hLen + vLen + otherLen;
    const orthoCoverage = (hLen + vLen) / totalLen;
    if (orthoCoverage < RECT_ORTHO_COVERAGE) return null;

    const hFrac = hLen / (hLen + vLen);
    const vFrac = vLen / (hLen + vLen);
    if (hFrac < 0.15 || vFrac < 0.15) return null;

    const balanceScore = 1 - Math.abs(hFrac - vFrac) * 0.5;
    const confidence = orthoCoverage * 0.6 + balanceScore * 0.2 + closureScore * 0.2;
    if (confidence < RECT_CONFIDENCE_THRESHOLD) return null;

    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);

    return { kind: 'rectangle', x: minX, y: minY, w: maxX - minX, h: maxY - minY, confidence };
}

// ── Polygon shape classifiers ─────────────────────────────────────────────────

type PolyKind = 'triangle' | 'rectangle' | 'parallelogram' | 'trapezoid' | 'diamond';

interface PolyShapeResult {
    kind: PolyKind;
    vertices: Pt[];
    confidence: number;
}

/** Are two side directions parallel (within PARALLEL_TOL)? */
function areParallel(d1: number, d2: number): boolean {
    return angularDiff(d1, d2) < PARALLEL_TOL;
}

/** Are two lengths approximately equal (within SIDE_EQ_TOL fraction)? */
function approxEqual(a: number, b: number): boolean {
    const avg = (a + b) / 2;
    return avg > 0 && Math.abs(a - b) / avg < SIDE_EQ_TOL;
}

// ── Triangle ──────────────────────────────────────────────────────────────────
function classifyTriangle(verts: Pt[], analysis: PolygonAnalysis): PolyShapeResult | null {
    if (verts.length !== 3) return null;
    if (!analysis.isClosed) return null;

    const area = polygonArea(verts);
    const perimSq = analysis.sideLengths.reduce((s, l) => s + l, 0) ** 2;
    // Degenerate check: area must be > 2% of bounding square
    if (area / perimSq < 0.005) return null;

    // Confidence: penalize very flat triangles (min angle < 10°)
    const minAngle = Math.min(...analysis.angles);
    const angleScore = Math.min(1, minAngle / 20);

    // Penalize if angles deviate a lot from ideal (60° equilateral)
    const angleSpread = Math.max(...analysis.angles) - Math.min(...analysis.angles);
    const spreadScore = Math.max(0, 1 - angleSpread / 120);

    const confidence = 0.5 + angleScore * 0.3 + spreadScore * 0.2;
    return { kind: 'triangle', vertices: verts, confidence };
}

// ── Rectangle (polygon path) ──────────────────────────────────────────────────
function classifyRectanglePoly(verts: Pt[], analysis: PolygonAnalysis): PolyShapeResult | null {
    if (verts.length !== 4) return null;
    if (!analysis.isClosed) return null;

    // All 4 angles ≈ 90°
    const angleErrors = analysis.angles.map(a => Math.abs(a - 90));
    if (angleErrors.some(e => e > RIGHT_ANGLE_TOL)) return null;

    const avgAngleError = angleErrors.reduce((s, e) => s + e, 0) / 4;
    const angleScore = 1 - avgAngleError / RIGHT_ANGLE_TOL;

    // Opposite sides ≈ equal
    const [s0, s1, s2, s3] = analysis.sideLengths;
    const sideScore = (approxEqual(s0, s2) && approxEqual(s1, s3)) ? 1 : 0.4;

    const confidence = angleScore * 0.7 + sideScore * 0.3;
    if (confidence < SHAPE_CONFIDENCE_MIN) return null;

    return { kind: 'rectangle', vertices: verts, confidence };
}

// ── Diamond / Rhombus ─────────────────────────────────────────────────────────
function classifyDiamond(verts: Pt[], analysis: PolygonAnalysis): PolyShapeResult | null {
    if (verts.length !== 4) return null;
    if (!analysis.isClosed) return null;

    // All 4 sides ≈ equal
    const [s0, s1, s2, s3] = analysis.sideLengths;
    if (!approxEqual(s0, s1) || !approxEqual(s1, s2) || !approxEqual(s2, s3)) return null;

    // Angles NOT all ≈ 90° (otherwise it's a square)
    const allRight = analysis.angles.every(a => Math.abs(a - 90) < RIGHT_ANGLE_TOL);
    if (allRight) return null;

    // Confidence: how equal are the sides?
    const meanSide = (s0 + s1 + s2 + s3) / 4;
    const sideVariance = [s0, s1, s2, s3].reduce((s, l) => s + (l - meanSide) ** 2, 0) / 4;
    const sideStd = Math.sqrt(sideVariance);
    const sideScore = Math.max(0, 1 - sideStd / (meanSide * SIDE_EQ_TOL));

    const confidence = 0.5 + sideScore * 0.5;
    if (confidence < SHAPE_CONFIDENCE_MIN) return null;

    return { kind: 'diamond', vertices: verts, confidence };
}

// ── Parallelogram ─────────────────────────────────────────────────────────────
function classifyParallelogram(verts: Pt[], analysis: PolygonAnalysis): PolyShapeResult | null {
    if (verts.length !== 4) return null;
    if (!analysis.isClosed) return null;

    const [d0, d1, d2, d3] = analysis.directions;

    // Opposite sides must be parallel: side0‖side2, side1‖side3
    const pair1Parallel = areParallel(d0, d2);
    const pair2Parallel = areParallel(d1, d3);
    if (!pair1Parallel || !pair2Parallel) return null;

    // Opposite sides ≈ equal length
    const [s0, s1, s2, s3] = analysis.sideLengths;
    if (!approxEqual(s0, s2) || !approxEqual(s1, s3)) return null;

    // Must NOT be a rectangle (angles not all ≈ 90°)
    const allRight = analysis.angles.every(a => Math.abs(a - 90) < RIGHT_ANGLE_TOL);
    if (allRight) return null;

    // Confidence: how parallel are the pairs?
    const parallelScore1 = 1 - angularDiff(d0, d2) / PARALLEL_TOL;
    const parallelScore2 = 1 - angularDiff(d1, d3) / PARALLEL_TOL;
    const confidence = 0.4 + (parallelScore1 + parallelScore2) * 0.3;
    if (confidence < SHAPE_CONFIDENCE_MIN) return null;

    return { kind: 'parallelogram', vertices: verts, confidence };
}

// ── Trapezoid ─────────────────────────────────────────────────────────────────
function classifyTrapezoid(verts: Pt[], analysis: PolygonAnalysis): PolyShapeResult | null {
    if (verts.length !== 4) return null;
    if (!analysis.isClosed) return null;

    const [d0, d1, d2, d3] = analysis.directions;

    const pair1Parallel = areParallel(d0, d2);
    const pair2Parallel = areParallel(d1, d3);

    // Exactly ONE pair parallel
    if (pair1Parallel === pair2Parallel) return null;

    const parallelDiff = pair1Parallel
        ? angularDiff(d0, d2)
        : angularDiff(d1, d3);
    const parallelScore = 1 - parallelDiff / PARALLEL_TOL;

    const confidence = 0.4 + parallelScore * 0.5;
    if (confidence < SHAPE_CONFIDENCE_MIN) return null;

    return { kind: 'trapezoid', vertices: verts, confidence };
}

// ── detectPolygonShapes ───────────────────────────────────────────────────────
// Extracts polygon vertices and runs all classifiers.
// Returns the highest-confidence polygon result, or null.
function detectPolygonShapes(rawPoints: Pt[]): PolyShapeResult | null {
    const verts = extractPolygon(rawPoints);
    if (!verts) return null;

    const analysis = analyzePolygon(verts, rawPoints);

    const candidates: PolyShapeResult[] = [];

    if (verts.length === 3) {
        const t = classifyTriangle(verts, analysis);
        if (t) candidates.push(t);
    } else if (verts.length === 4) {
        // Order matters: diamond before parallelogram (diamond is more specific)
        const rect = classifyRectanglePoly(verts, analysis);
        if (rect) candidates.push(rect);

        const diamond = classifyDiamond(verts, analysis);
        if (diamond) candidates.push(diamond);

        const para = classifyParallelogram(verts, analysis);
        if (para) candidates.push(para);

        const trap = classifyTrapezoid(verts, analysis);
        if (trap) candidates.push(trap);
    }

    if (candidates.length === 0) return null;
    return candidates.reduce((best, c) => c.confidence > best.confidence ? c : best);
}

// ── ShapeResult union ─────────────────────────────────────────────────────────
type ShapeResult =
    | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; confidence: number }
    | { kind: 'rectangle'; x: number; y: number; w: number; h: number; confidence: number }
    | { kind: 'circle'; cx: number; cy: number; r: number; confidence: number }
    | { kind: 'triangle' | 'parallelogram' | 'trapezoid' | 'diamond'; vertices: Pt[]; confidence: number };

// ── detectShape ───────────────────────────────────────────────────────────────
function detectShape(pts: Pt[]): ShapeResult | null {
    if (pts.length < MIN_SHAPE_POINTS) return null;

    const candidates: ShapeResult[] = [];

    const line = detectLine(pts);
    if (line) candidates.push(line);

    const circle = detectCircle(pts);
    if (circle) candidates.push(circle);

    // Fast rectangle (direction-clustering, works well for axis-aligned)
    const rectFast = detectRectangleFast(pts);
    if (rectFast) candidates.push(rectFast);

    // Polygon-based classifiers (triangle, rectangle, parallelogram, trapezoid, diamond)
    const poly = detectPolygonShapes(pts);
    if (poly) {
        if (poly.kind === 'rectangle') {
            // Convert to bounding-box rectangle for consistency
            const xs = poly.vertices.map(p => p.x), ys = poly.vertices.map(p => p.y);
            candidates.push({
                kind: 'rectangle',
                x: Math.min(...xs), y: Math.min(...ys),
                w: Math.max(...xs) - Math.min(...xs),
                h: Math.max(...ys) - Math.min(...ys),
                confidence: poly.confidence,
            });
        } else {
            candidates.push(poly as ShapeResult);
        }
    }

    if (candidates.length === 0) return null;
    const best = candidates.reduce((b, c) => c.confidence > b.confidence ? c : b);
    if (best.confidence < SHAPE_CONFIDENCE_MIN) return null;
    return best;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSmartPencilTool({ penSettings, onAddObject, publishState, mode }: UseSmartPencilToolOptions) {
    const isDrawingRef = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [overlay, setOverlay] = useState<SmartPencilOverlay | null>(null);

    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const penRef = useRef(penSettings);
    penRef.current = penSettings;

    const abort = useCallback(() => {
        if (!isDrawingRef.current) return;
        console.log('[smart-pencil] CANCEL / ABORT');
        isDrawingRef.current = false;
        setIsDrawing(false);
        setOverlay(null);
        pointsRef.current = [];
        lastPointRef.current = null;
    }, []);

    const finalize = useCallback(() => {
        if (!isDrawingRef.current) return;
        console.log('[smart-pencil] DRAW END, points:', pointsRef.current.length);

        const rawPoints = pointsRef.current;

        if (rawPoints.length === 0) {
            isDrawingRef.current = false;
            setIsDrawing(false);
            setOverlay(null);
            pointsRef.current = [];
            lastPointRef.current = null;
            return;
        }

        let totalLength = 0;
        for (let i = 1; i < rawPoints.length; i++) {
            totalLength += Math.hypot(rawPoints[i].x - rawPoints[i - 1].x, rawPoints[i].y - rawPoints[i - 1].y);
        }

        let pts: { x: number; y: number }[];

        if (totalLength < 2 || rawPoints.length === 1) {
            pts = [rawPoints[0], { ...rawPoints[0] }];
        } else if (rawPoints.length >= MIN_POINTS) {
            let working = rawPoints;
            if (working.length > MAX_POINTS) working = downsample(working, MAX_POINTS);
            let simplified = rdpSimplify(working, RDP_EPSILON);
            if (simplified.length < 2) simplified = [rawPoints[0], rawPoints[rawPoints.length - 1]];
            pts = chaikinSmooth(simplified, SMOOTHING_TENSION);
            if (pts.length < 2) pts = [rawPoints[0], rawPoints[rawPoints.length - 1]];
        } else {
            pts = rawPoints;
        }

        // Reset state BEFORE creating object
        isDrawingRef.current = false;
        setIsDrawing(false);
        setOverlay(null);
        pointsRef.current = [];
        lastPointRef.current = null;

        // ── Ink-to-Shape detection ────────────────────────────────────────────
        const shape = rawPoints.length >= MIN_SHAPE_POINTS ? detectShape(rawPoints) : null;
        console.log('[smart-pencil] shape:', shape?.kind ?? 'none', shape ? `(confidence: ${shape.confidence.toFixed(2)})` : '');

        let objectCreated = false;

        if (shape) {
            const id = crypto.randomUUID();
            const strokeColor = penRef.current.color;
            const strokeWidth = penRef.current.width;
            let shapeObj: AnyCanvasObject | null = null;

            switch (shape.kind) {
                case 'line':
                    shapeObj = {
                        id, type: 'line',
                        x: Math.min(shape.x1, shape.x2), y: Math.min(shape.y1, shape.y2),
                        width: Math.max(Math.abs(shape.x2 - shape.x1), 1),
                        height: Math.max(Math.abs(shape.y2 - shape.y1), 1),
                        rotation: 0, opacity: 1, visible: true, locked: false,
                        data: { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2, color: strokeColor, strokeWidth },
                    };
                    break;

                case 'rectangle':
                    shapeObj = {
                        id, type: 'rectangle',
                        x: shape.x, y: shape.y,
                        width: Math.max(shape.w, 1), height: Math.max(shape.h, 1),
                        rotation: 0, opacity: 1, visible: true, locked: false,
                        data: { fill: 'transparent', stroke: strokeColor, strokeWidth, cornerRadius: 0 },
                    };
                    break;

                case 'circle':
                    shapeObj = {
                        id, type: 'circle',
                        x: shape.cx - shape.r, y: shape.cy - shape.r,
                        width: shape.r * 2, height: shape.r * 2,
                        rotation: 0, opacity: 1, visible: true, locked: false,
                        data: { fill: 'transparent', stroke: strokeColor, strokeWidth },
                    };
                    break;

                case 'triangle':
                case 'parallelogram':
                case 'trapezoid':
                case 'diamond': {
                    // All polygon kinds carry vertices — guard defensively
                    const verts: Pt[] = (shape as { vertices: Pt[] }).vertices;
                    console.log('[smart-pencil] vertices:', verts);
                    if (verts && verts.length >= 3) {
                        const xs = verts.map(v => v.x), ys = verts.map(v => v.y);
                        const minX = Math.min(...xs), minY = Math.min(...ys);
                        const maxX = Math.max(...xs), maxY = Math.max(...ys);
                        const w = Math.max(maxX - minX, 1);
                        const h = Math.max(maxY - minY, 1);
                        // Normalize to 0..1 relative to bounding box — required by ObjectRenderer
                        const normalizedPoints = verts.map(v => ({
                            x: (v.x - minX) / w,
                            y: (v.y - minY) / h,
                        }));
                        shapeObj = {
                            id, type: 'polygon',
                            x: minX, y: minY,
                            width: w, height: h,
                            rotation: 0, opacity: 1, visible: true, locked: false,
                            data: {
                                points: normalizedPoints,
                                fill: 'transparent',
                                stroke: strokeColor,
                                strokeWidth,
                                label: shape.kind,
                            },
                        };
                    } else {
                        console.warn('[smart-pencil] polygon vertices missing or < 3, falling back to freehand');
                    }
                    break;
                }
            }

            console.log('[smart-pencil] created:', shapeObj !== null, '| kind:', shape.kind);

            if (shapeObj !== null) {
                console.log('[smart-pencil] INK-TO-SHAPE →', shape.kind, `(confidence: ${shape.confidence.toFixed(2)})`);
                onAddObject(shapeObj, true);
                publishState();
                objectCreated = true;
            }
        }

        if (objectCreated) return;

        // ── Fallback: freehand with smoothing ─────────────────────────────────
        const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
        const minX = Math.min(...xs), minY = Math.min(...ys);
        const maxX = Math.max(...xs), maxY = Math.max(...ys);

        const newPath: AnyCanvasObject = {
            id: crypto.randomUUID(),
            type: 'freehand',
            x: minX, y: minY,
            width: Math.max(maxX - minX, 1), height: Math.max(maxY - minY, 1),
            rotation: 0, opacity: 1, visible: true, locked: false,
            data: { points: pts, color: penRef.current.color, width: penRef.current.width },
        };

        console.log('[smart-pencil] CREATE OBJECT', pts.length, 'pts at', minX, minY);
        onAddObject(newPath, true);
        publishState();
    }, [onAddObject, publishState]);

    const onMouseDown = useCallback((x: number, y: number) => {
        if (isDrawingRef.current) finalize();
        console.log('[smart-pencil] DRAW START at', x, y);
        const firstPoint = { x, y };
        isDrawingRef.current = true;
        setIsDrawing(true);
        pointsRef.current = [firstPoint];
        lastPointRef.current = firstPoint;
        setOverlay({ points: [firstPoint], color: penRef.current.color, width: penRef.current.width });
    }, [finalize]);

    const onMouseMove = useCallback((x: number, y: number) => {
        if (!isDrawingRef.current) return;
        const last = lastPointRef.current;
        if (!last || Math.hypot(x - last.x, y - last.y) > 2) {
            const pt = { x, y };
            pointsRef.current = [...pointsRef.current, pt];
            lastPointRef.current = pt;
            setOverlay({ points: pointsRef.current, color: penRef.current.color, width: penRef.current.width });
        }
    }, []);

    const onMouseUp = finalize;
    const onCancel = abort;

    useEffect(() => {
        if (mode !== 'smart-pencil' && isDrawingRef.current) abort();
    }, [mode, abort]);

    return { isDrawing, isDrawingRef, onMouseDown, onMouseMove, onMouseUp, onCancel, overlay };
}
