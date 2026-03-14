// src/components/room/RemoteCursors.tsx
//
// Renders cursor overlays for all connected peers.
// Place this as a sibling overlay inside your canvas container:
//
//   <div style={{ position: 'relative' }}>
//     <Canvas ... />
//     <RemoteCursors />
//   </div>
//
// Cursors are positioned in canvas-space coordinates.
// If your canvas uses a zoom/pan transform, pass `zoom` and `offset` props.

import React from 'react';
import { useCollaborationContext } from '@/hooks/useCollaborationContext';

interface RemoteCursorsProps {
  /** Current zoom level of the canvas (default: 1). */
  zoom?: number;
  /** Canvas pan offset in pixels (default: { x: 0, y: 0 }). */
  offset?: { x: number; y: number };
}

export function RemoteCursors({ zoom = 1, offset = { x: 0, y: 0 } }: RemoteCursorsProps) {
  const { peers } = useCollaborationContext();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {peers.map(peer => {
        if (!peer.cursor) return null;

        // Convert canvas coordinates → screen coordinates.
        const screenX = peer.cursor.x * zoom + offset.x;
        const screenY = peer.cursor.y * zoom + offset.y;

        return (
          <div
            key={peer.clientId}
            style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              transform: 'translate(-2px, -2px)',
              transition: 'left 50ms linear, top 50ms linear',
            }}
          >
            {/* SVG cursor arrow */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
            >
              <path
                d="M3 2L17 10L10 12L7 18L3 2Z"
                fill={peer.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {/* Name label */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 8,
                background: peer.color,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                userSelect: 'none',
              }}
            >
              {peer.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
