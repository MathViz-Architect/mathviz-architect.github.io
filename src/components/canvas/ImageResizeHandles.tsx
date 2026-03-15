import React from 'react';
import { ResizeHandle, getHandleCursor, getHandlePosition } from '@/lib/canvas/resizeImage';

interface ImageResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

const HANDLE_SIZE = 10;
const HANDLES: ResizeHandle[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export const ImageResizeHandles: React.FC<ImageResizeHandlesProps> = ({
  x,
  y,
  width,
  height,
  zoom,
  onResizeStart,
}) => {
  const scaledHandleSize = HANDLE_SIZE / zoom;

  return (
    <>
      {HANDLES.map((handle) => {
        const pos = getHandlePosition(x, y, width, height, handle);
        const cursor = getHandleCursor(handle);
        
        return (
          <rect
            key={handle}
            x={pos.x - scaledHandleSize / 2}
            y={pos.y - scaledHandleSize / 2}
            width={scaledHandleSize}
            height={scaledHandleSize}
            fill="#FFFFFF"
            stroke="#3B82F6"
            strokeWidth={2 / zoom}
            style={{ cursor }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart(handle, e);
            }}
          />
        );
      })}
      
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={1.5 / zoom}
        strokeDasharray={`${4 / zoom} ${4 / zoom}`}
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
};
