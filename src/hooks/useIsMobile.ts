import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // matches Tailwind's `md:`

/**
 * Returns true when the viewport width is below the md breakpoint (768px).
 * Updates reactively on window resize.
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
    );

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        setIsMobile(mq.matches);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return isMobile;
}
