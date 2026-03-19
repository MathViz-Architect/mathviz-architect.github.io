import React, { memo, useMemo } from 'react';
import katex from 'katex';
import { normalizeMathExpression } from './hooks/useMathInputLogic';

interface PreviewDisplayProps {
  value: string;
}

export const PreviewDisplay: React.FC<PreviewDisplayProps> = memo(({ value }) => {
  const html = useMemo(() => {
    const normalized = normalizeMathExpression(value);
    if (!normalized) return '';
    
    try {
      return katex.renderToString(normalized, {
        throwOnError: false,
        strict: false,
        displayMode: false,
      });
    } catch {
      return '';
    }
  }, [value]);

  if (!html) return null;

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
});

PreviewDisplay.displayName = 'PreviewDisplay';

export default PreviewDisplay;
