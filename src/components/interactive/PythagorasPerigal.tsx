/**
 * PythagorasPerigal.tsx — Доказательство теоремы Пифагора методом Перигаля (1873)
 *
 * Математика:
 *  · cutU = norm(B−A), cutW ⊥ cutU — базис разреза вдоль гипотенузы
 *  · b² режется через Ob → 4 куска
 *  · Сопоставление по квадрантам: V_outer (дальняя от Ob вершина куска)
 *    классифицируется в базисе (cutU,cutW) → ключ "su,sw" → вершина sqC
 *  · Vi = targetVertex − V_outer (чистый параллельный перенос)
 *  · sqA: поворот на (angSqC − angSqA) вокруг Oa + сдвиг центра в Oc
 *  · AnimPoly: stroke=fill, strokeWidth=1.5
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';

// ─── Vec2 ─────────────────────────────────────────────────────────────────────

interface Vec2 { x: number; y: number }
const V        = (x: number, y: number): Vec2 => ({ x, y });
const add      = (a: Vec2, b: Vec2): Vec2 => V(a.x + b.x, a.y + b.y);
const sub      = (a: Vec2, b: Vec2): Vec2 => V(a.x - b.x, a.y - b.y);
const scale    = (a: Vec2, s: number): Vec2 => V(a.x * s, a.y * s);
const dot      = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
const norm     = (a: Vec2): Vec2 => { const l = Math.hypot(a.x, a.y); return V(a.x / l, a.y / l); };
const lerp     = (a: Vec2, b: Vec2, t: number): Vec2 => add(a, scale(sub(b, a), t));
const centroid = (pts: Vec2[]): Vec2 =>
  V(pts.reduce((s, p) => s + p.x, 0) / pts.length,
    pts.reduce((s, p) => s + p.y, 0) / pts.length);
const toSVG    = (pts: Vec2[]): string =>
  pts.map(p => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ');
const lerpPoly = (src: Vec2[], dst: Vec2[], t: number): Vec2[] =>
  src.map((p, i) => lerp(p, dst[i], t));

// ─── rotateAround ─────────────────────────────────────────────────────────────

function rotateAround(p: Vec2, o: Vec2, cos: number, sin: number): Vec2 {
  const dx = p.x - o.x, dy = p.y - o.y;
  return V(o.x + dx * cos - dy * sin, o.y + dx * sin + dy * cos);
}

// ─── getSquareVertices ────────────────────────────────────────────────────────

function getSquareVertices(p1: Vec2, p2: Vec2, pOpposite: Vec2): Vec2[] {
  const e = sub(p2, p1);
  let n = V(-e.y, e.x);
  if (dot(sub(pOpposite, p1), n) > 0) n = V(-n.x, -n.y);
  return [p1, p2, add(p2, n), add(p1, n)];
}

// ─── Sutherland-Hodgman clip ──────────────────────────────────────────────────

function clipHalfPlane(poly: Vec2[], lA: Vec2, lB: Vec2): Vec2[] {
  const d = sub(lB, lA);
  const inside    = (p: Vec2) => d.x * (p.y - lA.y) - d.y * (p.x - lA.x) >= -1e-9;
  const intersect = (a: Vec2, b: Vec2): Vec2 => {
    const ab = sub(b, a);
    const denom = ab.x * d.y - ab.y * d.x;
    if (Math.abs(denom) < 1e-10) return a;
    const t = ((lA.x - a.x) * d.y - (lA.y - a.y) * d.x) / denom;
    return add(a, scale(ab, t));
  };
  const out: Vec2[] = [];
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const cur = poly[i], prev = poly[(i + n - 1) % n];
    const ci = inside(cur), pi = inside(prev);
    if (ci) { if (!pi) out.push(intersect(prev, cur)); out.push(cur); }
    else if (pi) out.push(intersect(prev, cur));
  }
  return out;
}

/**
 * Разрезает полигон двумя перпендикулярными линиями через center.
 * Возвращает 4 части: [−u−w], [+u−w], [+u+w], [−u+w]
 */
function cutBy2Lines(poly: Vec2[], center: Vec2, u: Vec2, w: Vec2): Vec2[][] {
  const F  = 1e5;
  const ua = add(center, scale(u, -F)), ub = add(center, scale(u,  F));
  const wa = add(center, scale(w, -F)), wb = add(center, scale(w,  F));
  return [
    clipHalfPlane(clipHalfPlane(poly, ub, ua), wb, wa),  // −u −w
    clipHalfPlane(clipHalfPlane(poly, ua, ub), wb, wa),  // +u −w
    clipHalfPlane(clipHalfPlane(poly, ua, ub), wa, wb),  // +u +w
    clipHalfPlane(clipHalfPlane(poly, ub, ua), wa, wb),  // −u +w
  ];
}

// ─── computeGeo ───────────────────────────────────────────────────────────────

interface PerigalGeo {
  A: Vec2; B: Vec2; C: Vec2;
  sqA: Vec2[]; sqB: Vec2[]; sqC: Vec2[];
  Ob: Vec2; Oc: Vec2; Oa: Vec2;
  cutU: Vec2; cutW: Vec2;
  pieces: Vec2[][];
  pieceTargets: Vec2[][];
  smallSrc: Vec2[];
  smallTarget: Vec2[];
  smallTargetTranslate: Vec2;
  smallTargetRotationDeg: number;
  aLen: number; bLen: number; cLen: number;
}

function computeGeo(rawA: number, rawB: number, vpW: number, vpH: number): PerigalGeo {
  const aLen = rawA;   // a — катет по вертикали (ось Y), без сортировки
  const bLen = rawB;   // b — катет по горизонтали (ось X), всегда разрезается
  const cLen = Math.sqrt(aLen * aLen + bLen * bLen);

  const MARGIN = 56;
  // A = (0, -aPx), B = (bPx, 0), sqA уходит влево, sqB — вниз, sqC — вверх-вправо
  // Горизонталь: sqA слева (до -aLen), B справа (bLen), sqC правее — ≈ bLen + cLen
  // Вертикаль: sqB снизу (до bLen), A сверху (aLen), sqC выше — ≈ aLen + cLen
  const scaleH = (vpW - MARGIN * 2) / (aLen + bLen + cLen * 0.9);
  const scaleV = (vpH - MARGIN * 2) / (aLen + bLen + cLen * 0.9);
  const sc = Math.min(scaleH, scaleV, 30);
  const aPx = aLen * sc, bPx = bLen * sc;

  // Треугольник: прямой угол в C, A вверх, B вправо
  const C0 = V(0, 0), A0 = V(0, -aPx), B0 = V(bPx, 0);
  const sqA0 = getSquareVertices(C0, A0, B0);
  const sqB0 = getSquareVertices(C0, B0, A0);
  const sqC0 = getSquareVertices(A0, B0, C0);

  // Центрируем в viewport
  const all = [...sqA0, ...sqB0, ...sqC0];
  const xs = all.map(p => p.x), ys = all.map(p => p.y);
  const ox = (vpW - (Math.max(...xs) - Math.min(...xs))) / 2 - Math.min(...xs);
  const oy = (vpH - (Math.max(...ys) - Math.min(...ys))) / 2 - Math.min(...ys);
  const sh  = (pts: Vec2[]) => pts.map(p => V(p.x + ox, p.y + oy));
  const shP = (p:   Vec2)   => V(p.x + ox, p.y + oy);

  const sqA = sh(sqA0), sqB = sh(sqB0), sqC = sh(sqC0);
  const A = shP(A0), B = shP(B0), C = shP(C0);

  const Ob = centroid(sqB);
  const Oc = centroid(sqC);

  // ── Шаг 1: базис разреза ──────────────────────────────────────────────────
  const cutU = norm(sub(B, A));          // вдоль гипотенузы A→B
  const cutW = V(-cutU.y, cutU.x);      // перпендикуляр (влево от A→B)

  // ── Шаг 2: разрезаем b² и находим vOuter для каждого куска ──────────────
  const pieces = cutBy2Lines(sqB, Ob, cutU, cutW);

  // Для каждого куска вычисляем vOuter (внешний угол, дальше всего от Ob)
  const partsB = pieces.map(piece => {
    let vOuter = piece[0];
    let maxD = -1;
    for (const pv of piece) {
      const d = (pv.x - Ob.x) ** 2 + (pv.y - Ob.y) ** 2;
      if (d > maxD) { maxD = d; vOuter = pv; }
    }
    return { poly: piece, vOuter };
  });

  // ── Шаг 3: карта вершин sqC + вычисление целевых полигонов ───────────────
  // Строим динамическую карту вершин целевого квадрата (относительно его центра Oc)
  const sqCMap = new Map<string, Vec2>();
  for (const v of sqC) {
    const su = dot(sub(v, Oc), cutU) > 0 ? 1 : -1;
    const sw = dot(sub(v, Oc), cutW) > 0 ? 1 : -1;
    sqCMap.set(`${su},${sw}`, v);
  }

  // Рассчитываем векторы сдвига для каждого из 4-х кусков
  const pieceShifts = partsB.map(part => {
    // Вычисляем квадрант "внешней" вершины куска относительно центра исходного квадрата (Ob)
    const su = dot(sub(part.vOuter, Ob), cutU) > 0 ? 1 : -1;
    const sw = dot(sub(part.vOuter, Ob), cutW) > 0 ? 1 : -1;

    const targetCorner = sqCMap.get(`${su},${sw}`);
    if (!targetCorner) return V(0, 0); // fallback

    // Вектор чистого параллельного переноса: от внешней вершины исходника к углу цели
    return sub(targetCorner, part.vOuter);
  });

  // Применяем сдвиги — получаем целевые полигоны
  const pieceTargets = partsB.map((part, i) =>
    part.poly.map(pt => add(pt, pieceShifts[i]))
  );

  // ── Шаг 4: smallTarget — a² сдвигается центром в Oc и поворачивается ─────
  const Oa = centroid(sqA);

  // Вектор сдвига для малого квадрата - это просто разница между центрами
  const smallTargetTranslate = sub(Oc, Oa);

  // Угол поворота: разница между углом гипотенузы (вектор A->B) и углом катета a (вектор C->A)
  const angHypotenuse = Math.atan2(B.y - A.y, B.x - A.x);
  const angLegA = Math.atan2(A.y - C.y, A.x - C.x);
  const smallTargetRotationDeg = (angHypotenuse - angLegA) * (180 / Math.PI);

  // lerpPoly-версия для AnimPoly stroke overlay
  const cosR = Math.cos(angHypotenuse - angLegA), sinR = Math.sin(angHypotenuse - angLegA);
  const smallTarget = sqA
    .map(pt => rotateAround(pt, Oa, cosR, sinR))
    .map(pt => add(pt, smallTargetTranslate));

  return {
    A, B, C, sqA, sqB, sqC, Ob, Oc, Oa, cutU, cutW,
    pieces, pieceTargets,
    smallSrc: sqA, smallTarget,
    smallTargetTranslate, smallTargetRotationDeg,
    aLen, bLen, cLen,
  };
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const CLR = {
  tri:      '#EDE9FE', triStroke:  '#7C3AED',
  sqA:      '#FEF3C7', sqAStroke:  '#D97706',
  sqB:      '#DBEAFE', sqBStroke:  '#2563EB',
  sqC:      '#D1FAE5', sqCStroke:  '#059669',
  pieces: ['#93C5FD', '#6EE7B7', '#FCA5A5', '#C4B5FD'] as const,
} as const;

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Треугольник', 'Три квадрата', 'Линии разреза', 'Анимация', 'a²+b²=c²'] as const;

const STEP_DESC = [
  'Прямоугольный треугольник ABC. Прямой угол при C. Катет a — вертикальный, катет b — горизонтальный.',
  'На каждой стороне строится квадрат наружу: жёлтый a², синий b² и зелёный c² на гипотенузе.',
  'Через центр Ob квадрата b² проводятся две линии, параллельные сторонам c². Квадрат делится на 4 части.',
  'Каждый фрагмент b² сдвигается в угол c² (corner-to-corner). a² поворачивается и занимает центральную позицию.',
  'Пять фигур покрывают c² без зазоров. a² + b² = c².',
];

// ─── AnimPoly ─────────────────────────────────────────────────────────────────

function AnimPoly({ src, dst, t, fill }: {
  src: Vec2[]; dst: Vec2[]; t: number; fill: string;
}) {
  return (
    <polygon
      points={toSVG(lerpPoly(src, dst, t))}
      fill={fill}
      stroke={fill}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const PythagorasPerigal: React.FC<{
  onInsert?: (p: { a: number; b: number }) => void;
}> = ({ onInsert }) => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [step, setStep]         = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rafRef = useRef<number>(0);

  const SVG_W = 580, SVG_H = 480;
  const geo = useMemo(() => computeGeo(a, b, SVG_W, SVG_H), [a, b]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const stopAnim = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsAnimating(false);
  }, []);

  const runAnimation = useCallback(() => {
    stopAnim();
    const DURATION = 2400;
    const start = performance.now();
    setProgress(0);
    setIsAnimating(true);
    const tick = (now: number) => {
      const raw   = Math.min((now - start) / DURATION, 1);
      const eased = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;
      setProgress(eased);
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
      else setIsAnimating(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnim]);

  const goNext = useCallback(() => {
    const next = step + 1;
    setStep(next);
    if (next === 3) runAnimation();
    else setProgress(next >= 4 ? 1 : 0);
  }, [step, runAnimation]);

  const goPrev = useCallback(() => {
    stopAnim(); setStep(s => s - 1); setProgress(0);
  }, [stopAnim]);

  const handleReset = () => { stopAnim(); setStep(0); setProgress(0); setA(3); setB(5); };

  const handleSlider = (setter: (v: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(parseFloat(e.target.value));
      stopAnim(); setStep(0); setProgress(0);
    };

  const t = step === 3 ? progress : step >= 4 ? 1 : 0;

  const {
    A, B, C, sqA, sqB, sqC, Ob, cutU, cutW,
    pieces, pieceTargets, smallSrc, smallTarget,
    Oa, smallTargetTranslate, smallTargetRotationDeg,
    aLen, bLen, cLen,
  } = geo;

  const cutExt = cLen * 30 * 0.9;
  const cutL1a = add(Ob, scale(cutU, -cutExt)), cutL1b = add(Ob, scale(cutU,  cutExt));
  const cutL2a = add(Ob, scale(cutW, -cutExt)), cutL2b = add(Ob, scale(cutW,  cutExt));

  const showCutLines    = step === 2 || (step === 3 && t < 0.18);
  const cutOpacity      = step === 2 ? 1 : Math.max(0, 1 - t * 6);
  const bOutlineOpacity = step >= 2  ? Math.max(0, 1 - t * 2.5) : 0;
  const formulaOpacity  = step >= 3 && t > 0.9 ? Math.min((t - 0.9) / 0.1, 1) : 0;

  const sqACentroid = centroid(sqA);
  const sqBCentroid = centroid(sqB);
  const sqCCentroid = centroid(sqC);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b">
        <ModuleInstructions
          title="Доказательство Перигаля (1873)"
          instructions={[
            'Настройте катеты a и b слайдерами',
            'Нажимайте «→» для перехода по шагам доказательства',
            'На шаге 4 наблюдайте, как 5 фигур заполняют c² без зазоров',
          ]}
          defaultExpanded={false}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SVG canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-3 min-w-0">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-auto max-h-full border border-gray-200 rounded-xl bg-white shadow-md"
            style={{ maxWidth: SVG_W }}
          >
            <defs>
              <pattern id="pg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0L0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="url(#pg-grid)" />

            {/* c² — фон */}
            {step >= 1 && (
              <polygon
                points={toSVG(sqC)}
                fill={step >= 3 ? CLR.sqC : 'none'}
                fillOpacity={step >= 3 ? Math.min(t * 2, 0.55) : 1}
                stroke={CLR.sqCStroke} strokeWidth="2"
              />
            )}

            {/* b² статичный */}
            {step === 1 && (
              <polygon points={toSVG(sqB)} fill={CLR.sqB} fillOpacity={0.85}
                stroke={CLR.sqBStroke} strokeWidth="2" />
            )}

            {/* b² пунктирный контур */}
            {step >= 2 && bOutlineOpacity > 0.01 && (
              <polygon points={toSVG(sqB)} fill="none"
                stroke={CLR.sqBStroke} strokeWidth="1.5"
                strokeDasharray="6,3" opacity={bOutlineOpacity} />
            )}

            {/* Линии разреза + цветной превью */}
            {showCutLines && (
              <g opacity={cutOpacity}>
                {step === 2 && pieces.map((poly, i) => (
                  <polygon key={i} points={toSVG(poly)}
                    fill={CLR.pieces[i]} fillOpacity={0.75}
                    stroke={CLR.pieces[i]} strokeWidth="0.5" />
                ))}
                <line x1={cutL1a.x} y1={cutL1a.y} x2={cutL1b.x} y2={cutL1b.y}
                  stroke="#1D4ED8" strokeWidth="2" strokeDasharray="7,3" />
                <line x1={cutL2a.x} y1={cutL2a.y} x2={cutL2b.x} y2={cutL2b.y}
                  stroke="#1D4ED8" strokeWidth="2" strokeDasharray="7,3" />
                <circle cx={Ob.x} cy={Ob.y} r="3.5" fill="#1D4ED8" />
              </g>
            )}

            {/* 4 анимированных фрагмента b² */}
            {step >= 2 && pieces.map((src, i) => (
              <AnimPoly key={i} src={src} dst={pieceTargets[i]} t={t} fill={CLR.pieces[i]} />
            ))}

            {/* a² анимированный — SVG transform: rotate вокруг Oa + translate */}
            {step >= 1 && (() => {
              const animT = step >= 3 ? t : 0;
              // Интерполируем translate и rotation
              const tx = smallTargetTranslate.x * animT;
              const ty = smallTargetTranslate.y * animT;
              const rot = smallTargetRotationDeg * animT;
              // transform-origin = Oa (центр квадрата a²)
              const transform = `translate(${tx.toFixed(3)},${ty.toFixed(3)}) rotate(${rot.toFixed(4)},${Oa.x.toFixed(3)},${Oa.y.toFixed(3)})`;
              return (
                <g transform={transform}>
                  <polygon
                    points={toSVG(smallSrc)}
                    fill={CLR.sqA}
                    stroke={CLR.sqA}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {animT < 0.9 && (
                    <polygon
                      points={toSVG(smallSrc)}
                      fill="none"
                      stroke={CLR.sqAStroke}
                      strokeWidth="1.5"
                      opacity={Math.max(0, 1 - animT * 1.3)}
                    />
                  )}
                </g>
              );
            })()}

            {/* Треугольник */}
            <polygon points={toSVG([C, A, B])}
              fill={CLR.tri} fillOpacity={0.92}
              stroke={CLR.triStroke} strokeWidth="2.5" strokeLinejoin="round" />

            {/* Маркер прямого угла */}
            {(() => {
              const sz = 12;
              const dCA = norm(sub(A, C)), dCB = norm(sub(B, C));
              const P1 = add(C, scale(dCA, sz));
              const P2 = add(P1, scale(dCB, sz));
              const P3 = add(C, scale(dCB, sz));
              return (
                <path d={`M${P1.x},${P1.y} L${P2.x},${P2.y} L${P3.x},${P3.y}`}
                  fill="none" stroke={CLR.triStroke} strokeWidth="1.5" />
              );
            })()}

            {/* Подписи */}
            <text x={(C.x + A.x) / 2 - 16} y={(C.y + A.y) / 2 + 4}
              fontSize="13" fontWeight="bold" fill={CLR.triStroke}>Катет a</text>
            <text x={(C.x + B.x) / 2} y={C.y + 22}
              textAnchor="middle" fontSize="13" fontWeight="bold" fill={CLR.triStroke}>Катет b</text>
            <text x={(A.x + B.x) / 2 + 18} y={(A.y + B.y) / 2 - 10}
              textAnchor="middle" fontSize="13" fontWeight="bold" fill={CLR.sqCStroke}>c</text>

            {step >= 1 && step <= 2 && (
              <>
                <text x={sqACentroid.x} y={sqACentroid.y + 5}
                  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#92400E">a²</text>
                <text x={sqBCentroid.x} y={sqBCentroid.y + 5}
                  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E3A8A">b²</text>
              </>
            )}
            {step >= 1 && (
              <text x={sqCCentroid.x} y={sqCCentroid.y + 5}
                textAnchor="middle" fontSize="13" fontWeight="bold" fill="#065F46"
                opacity={step >= 3 ? 0.5 + Math.min(t * 0.5, 0.5) : 0.85}>c²</text>
            )}

            {/* Финальная формула */}
            {formulaOpacity > 0 && (
              <g opacity={formulaOpacity}>
                <rect x={SVG_W / 2 - 160} y={SVG_H - 68} width={320} height={58}
                  rx={13} fill="#F0FDF4" stroke="#059669" strokeWidth="1.5" />
                <text x={SVG_W / 2} y={SVG_H - 41}
                  textAnchor="middle" fontSize="24" fontWeight="bold" fill="#065F46"
                >a² + b² = c²</text>
                <text x={SVG_W / 2} y={SVG_H - 20}
                  textAnchor="middle" fontSize="10" fill="#059669" letterSpacing="0.5"
                >Доказательство Перигаля завершено</text>
              </g>
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="w-72 border-l bg-white flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Метод Перигаля</h3>
              <p className="text-xs text-gray-400 mt-0.5">Генри Перигаль, 1873</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {([
                { l: 'a', val: aLen,            sq: (aLen**2).toFixed(0), bg: 'bg-amber-50',  border: 'border-amber-100',  txt: 'text-amber-600'  },
                { l: 'b', val: bLen,            sq: (bLen**2).toFixed(0), bg: 'bg-blue-50',   border: 'border-blue-100',   txt: 'text-blue-600'   },
                { l: 'c', val: cLen.toFixed(2), sq: (cLen**2).toFixed(1), bg: 'bg-green-50',  border: 'border-green-100',  txt: 'text-green-600'  },
              ] as const).map(({ l, val, sq, bg, border, txt }) => (
                <div key={l} className={`p-2 ${bg} rounded-lg text-center border ${border}`}>
                  <div className="text-xs text-gray-400">{l}</div>
                  <div className={`text-base font-bold ${txt}`}>{val}</div>
                  <div className="text-xs text-gray-400">{l}²={sq}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-2 text-center text-xs font-mono text-gray-700">
              {(aLen**2).toFixed(0)} + {(bLen**2).toFixed(0)}{' = '}
              <span className="font-bold text-green-700">{(cLen**2).toFixed(1)}</span>
            </div>

            <div className="space-y-3">
              {([['Катет a', a, setA], ['Катет b', b, setB]] as const).map(([label, val, setter]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{label} = {val}</span>
                    <span className="text-gray-400">1 – 8</span>
                  </div>
                  <input type="range" min="1" max="8" step="0.5" value={val}
                    onChange={handleSlider(setter)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Шаг {step + 1}/{STEPS.length}</span>
                <span className="font-medium text-gray-700">{STEPS[step]}</span>
              </div>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-gray-700 leading-relaxed min-h-[68px]">
              {STEP_DESC[step]}
            </div>

            <div className="flex gap-2">
              <button disabled={step === 0 || isAnimating} onClick={goPrev}
                className="flex items-center justify-center w-10 h-9 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button disabled={step >= STEPS.length - 1 || isAnimating} onClick={goNext}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {step === 2
                  ? <><Play size={14} />Запустить анимацию</>
                  : <>{STEPS[step + 1]}<ChevronRight size={14} /></>}
              </button>
            </div>

            <button onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <RotateCcw size={13} /> Сбросить
            </button>

            {onInsert && (
              <button onClick={() => onInsert({ a, b })}
                className="w-full py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200">
                Добавить на холст
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythagorasPerigal;
