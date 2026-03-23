import React, { memo, useMemo } from 'react';
import { renderKatex } from '../../lib/math/katexAdapter';

interface PreviewDisplayProps {
  value: string;
}

export const PreviewDisplay: React.FC<PreviewDisplayProps> = memo(({ value }) => {
  const html = useMemo(() => {
    if (!value) return '';
    try {
      return renderKatex(value, { displayMode: false });
    } catch {
      return '';
    }
  }, [value]);

  if (!html) return null;

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
});

PreviewDisplay.displayName = 'PreviewDisplay';

export default PreviewDisplay;
