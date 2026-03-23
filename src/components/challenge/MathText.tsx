import React from 'react';
import 'katex/dist/katex.min.css';
import { normalizeMathExpression } from '../../lib/math/normalization';
import { renderKatex } from '../../lib/math/katexAdapter';

export interface TextSegment {
    type: 'text' | 'math';
    value: string;
    display?: boolean;
}

export function parseMathText(text: string): TextSegment[] {
    if (!text || typeof text !== 'string') return [];
    const segments: TextSegment[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.startsWith('$$')) {
            const endIndex = remaining.indexOf('$$', 2);
            if (endIndex === -1) { segments.push({ type: 'text', value: remaining }); break; }
            segments.push({ type: 'math', value: remaining.slice(2, endIndex), display: true });
            remaining = remaining.slice(endIndex + 2);
            continue;
        }

        if (remaining.startsWith('$')) {
            let endIndex = -1;
            for (let i = 1; i < remaining.length; i++) {
                if (remaining[i] === '$' && remaining[i + 1] !== '$') { endIndex = i; break; }
            }
            if (endIndex === -1) { segments.push({ type: 'text', value: remaining }); break; }
            segments.push({ type: 'math', value: remaining.slice(1, endIndex), display: false });
            remaining = remaining.slice(endIndex + 1);
            continue;
        }

        const next = remaining.indexOf('$');
        if (next === -1) { segments.push({ type: 'text', value: remaining }); break; }
        if (next > 0) segments.push({ type: 'text', value: remaining.slice(0, next) });
        remaining = remaining.slice(next);
    }

    return segments;
}

function normalizeText(text: string): string {
    return text
        .replace(/\.([A-Za-zА-Яа-я])/g, '. $1')
        .replace(/\?([A-Za-zА-Яа-я])/g, '? $1')
        .replace(/,([A-Za-zА-Яа-я])/g, ', $1')
        .replace(/([a-zA-Zа-яА-Я])\(/g, '$1 (')
        .replace(/\s+/g, ' ').trim();
}

function renderMath(math: string, displayMode: boolean): React.ReactNode {
    if (!math.trim()) return null;
    try {
        const html = renderKatex(math, { displayMode });
        return displayMode
            ? <div className="flex justify-center my-4" dangerouslySetInnerHTML={{ __html: html }} />
            : <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch { return <span className="text-red-500">{math}</span>; }
}

/**
 * Simple and stable fraction splitter.
 * Finds ALL fractions in one pass and splits text accordingly.
 */
function splitTextAndFractions(text: string): Array<{ type: 'text' | 'math', value: string }> {
    if (!text || !text.includes('/')) return [{ type: 'text', value: text }];

    const result: Array<{ type: 'text' | 'math', value: string }> = [];
    let i = 0;
    let lastIndex = 0;
    const len = text.length;

    while (i < len) {
        if (text[i] === '/') {
            i++;
            continue;
        }

        const remaining = text.slice(i);

        const digitMatch = remaining.match(/^(\d+)\s*\/\s*(\d+)/);
        const letterMatch = remaining.match(/^([a-zA-Z])\s*\/\s*([a-zA-Z])/);
        const exprMatch = remaining.match(/^(\d*[a-zA-Z]+)\s*\/\s*(\d*[a-zA-Z]+)/);

        let match = null;
        if (digitMatch) match = digitMatch;
        else if (letterMatch) match = letterMatch;
        else if (exprMatch && exprMatch[0].length > 2) match = exprMatch;

        if (match && match[0].length > 1) {
            // Text between previous match end and current match start
            const textBefore = text.slice(lastIndex, i).trim();
            if (textBefore) result.push({ type: 'text', value: textBefore });

            result.push({ type: 'math', value: `\\frac{${match[1]}}{${match[2]}}` });

            i += match[0].length;
            lastIndex = i;
        } else {
            i++;
        }
    }

    // If no fractions found, return original text
    if (result.length === 0) return [{ type: 'text', value: text }];

    // Remaining text after last match
    const tail = text.slice(lastIndex).trim();
    if (tail) result.push({ type: 'text', value: tail });

    return result;
}

export const MathText: React.FC<{ children: string; className?: string }> = ({ children, className = '' }) => {
    if (!children) return null;
    const segments = parseMathText(children);

    return (
        <div className={`text-xl md:text-2xl leading-relaxed ${className}`}>
            {segments.map((seg, i) => {
                if (seg.type === 'math') {
                    const normalized = normalizeMathExpression(seg.value);
                    return <span key={i} className="inline-block mx-1">{renderMath(normalized, seg.display ?? false)}</span>;
                }

                // If text segment contains raw LaTeX commands (\sqrt{}, \frac{}{} etc),
                // split on them and render each LaTeX fragment as inline math.
                if (/\\[a-zA-Z]+\{/.test(seg.value)) {
                    const parts: React.ReactNode[] = [];
                    let rest = seg.value;
                    let key = 0;
                    // Match \cmd{...} or \cmd{...}{...} (e.g. \frac{a}{b})
                    const latexRe = /\\[a-zA-Z]+(?:\{[^{}]*\})+/g;
                    let lastIndex = 0;
                    let m: RegExpExecArray | null;
                    latexRe.lastIndex = 0;
                    while ((m = latexRe.exec(seg.value)) !== null) {
                        if (m.index > lastIndex) {
                            parts.push(<span key={key++} className="text-slate-700">{seg.value.slice(lastIndex, m.index)}</span>);
                        }
                        const normalized = normalizeMathExpression(m[0]);
                        parts.push(<span key={key++} className="inline-block mx-0.5">{renderMath(normalized, false)}</span>);
                        lastIndex = m.index + m[0].length;
                    }
                    if (lastIndex < seg.value.length) {
                        parts.push(<span key={key++} className="text-slate-700">{seg.value.slice(lastIndex)}</span>);
                    }
                    return <span key={i}>{parts}</span>;
                }

                // Check for fractions in text
                const hasFractions = seg.value.includes('/');

                if (!hasFractions) {
                    return <span key={i} className="text-slate-700">{normalizeText(seg.value)}</span>;
                }

                // Split and render
                const subSegments = splitTextAndFractions(seg.value);

                return (
                    <span key={i}>
                        {subSegments.map((sub, j) => {
                            if (sub.type === 'math') {
                                return <span key={`${i}-${j}`} className="inline-block mx-0.5">{renderMath(sub.value, false)}</span>;
                            }
                            return <span key={`${i}-${j}`} className="text-slate-700">{normalizeText(sub.value)}</span>;
                        })}
                    </span>
                );
            })}
        </div>
    );
};

export default MathText;
