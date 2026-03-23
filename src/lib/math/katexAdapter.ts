import katex from 'katex';
import { isNormalized, stripMarker, normalizeMathExpression } from './normalization';

/**
 * Single entry point for all KaTeX rendering in the application.
 *
 * Guarantees:
 *   - The idempotency marker is always stripped before reaching KaTeX.
 *   - If the string hasn't been through normalizeMathExpression yet,
 *     it is normalised here as a safety fallback.
 *   - KaTeX config (displayMode, throwOnError, strict) is centralised.
 */
export function renderKatex(
    math: string,
    options?: { displayMode?: boolean }
): string {
    const displayMode = options?.displayMode ?? false;

    const safe = isNormalized(math)
        ? stripMarker(math)
        : stripMarker(normalizeMathExpression(math));

    return katex.renderToString(`\\displaystyle ${safe}`, {
        displayMode,
        throwOnError: false,
        strict: false,
    });
}
