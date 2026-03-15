import { AnyCanvasObject } from '../types';

export type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ResizeResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_SIZE = 40;

export function calculateResize(
  obj: AnyCanvasObject,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  preserveAspectRatio: boolean
): ResizeResult {
  let { x, y, width, height } = obj;

  const originalAspectRatio = width / height;

  switch (handle) {
    case 'bottom-right': {
      width = Math.max(MIN_SIZE, width + deltaX);
      height = Math.max(MIN_SIZE, height + deltaY);
      if (preserveAspectRatio) {
        const newAspectRatio = width / originalAspectRatio;
        height = width / originalAspectRatio;
        if (height < MIN_SIZE) {
          height = MIN_SIZE;
          width = height * originalAspectRatio;
        }
      }
      break;
    }
    case 'bottom-left': {
      const newWidth = Math.max(MIN_SIZE, width - deltaX);
      const newHeight = Math.max(MIN_SIZE, height + deltaY);
      
      if (preserveAspectRatio) {
        height = newWidth / originalAspectRatio;
        width = newWidth;
        if (height < MIN_SIZE) {
          height = MIN_SIZE;
          width = height * originalAspectRatio;
        }
      } else {
        width = newWidth;
        height = newHeight;
      }
      
      x = obj.x + obj.width - width;
      break;
    }
    case 'top-right': {
      const newWidth = Math.max(MIN_SIZE, width + deltaX);
      const newHeight = Math.max(MIN_SIZE, height - deltaY);
      
      if (preserveAspectRatio) {
        width = newHeight * originalAspectRatio;
        height = newHeight;
        if (width < MIN_SIZE) {
          width = MIN_SIZE;
          height = width / originalAspectRatio;
        }
      } else {
        width = newWidth;
        height = newHeight;
      }
      
      y = obj.y + obj.height - height;
      break;
    }
    case 'top-left': {
      const newWidth = Math.max(MIN_SIZE, width - deltaX);
      const newHeight = Math.max(MIN_SIZE, height - deltaY);
      
      if (preserveAspectRatio) {
        const smaller = Math.min(newWidth, newHeight * originalAspectRatio);
        width = smaller;
        height = smaller / originalAspectRatio;
        if (width < MIN_SIZE) {
          width = MIN_SIZE;
          height = width / originalAspectRatio;
        }
        if (height < MIN_SIZE) {
          height = MIN_SIZE;
          width = height * originalAspectRatio;
        }
      } else {
        width = newWidth;
        height = newHeight;
      }
      
      x = obj.x + obj.width - width;
      y = obj.y + obj.height - height;
      break;
    }
  }

  return { x, y, width, height };
}

export function getHandleCursor(handle: ResizeHandle): string {
  switch (handle) {
    case 'top-left':
    case 'bottom-right':
      return 'nwse-resize';
    case 'top-right':
    case 'bottom-left':
      return 'nesw-resize';
  }
}

export function getHandlePosition(
  objX: number,
  objY: number,
  objWidth: number,
  objHeight: number,
  handle: ResizeHandle
): { x: number; y: number } {
  switch (handle) {
    case 'top-left':
      return { x: objX, y: objY };
    case 'top-right':
      return { x: objX + objWidth, y: objY };
    case 'bottom-left':
      return { x: objX, y: objY + objHeight };
    case 'bottom-right':
      return { x: objX + objWidth, y: objY + objHeight };
  }
}
