import React from 'react';
import { 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Layers,
  X
} from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

interface ActionSectionProps {
  object: AnyCanvasObject;
  onDelete: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

const ACTION_BUTTON_STYLE = "flex-1 flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all text-gray-600 hover:text-gray-800";

export const ActionSection: React.FC<ActionSectionProps> = ({
  object,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
        <Layers size={12} /> Actions
      </h4>

      {/* Primary Actions Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {onDuplicate && (
          <button
            type="button"
            onClick={onDuplicate}
            className={ACTION_BUTTON_STYLE}
            title="Duplicate"
          >
            <Copy size={16} />
            <span className="text-xs">Duplicate</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className={`${ACTION_BUTTON_STYLE} text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50`}
          title="Delete"
        >
          <Trash2 size={16} />
          <span className="text-xs">Delete</span>
        </button>
      </div>

      {/* Layer Actions Row */}
      <div className="grid grid-cols-2 gap-2">
        {onBringToFront && (
          <button
            type="button"
            onClick={onBringToFront}
            className={ACTION_BUTTON_STYLE}
            title="Bring to Front"
          >
            <ArrowUp size={16} />
            <span className="text-xs">Front</span>
          </button>
        )}
        {onSendToBack && (
          <button
            type="button"
            onClick={onSendToBack}
            className={ACTION_BUTTON_STYLE}
            title="Send to Back"
          >
            <ArrowDown size={16} />
            <span className="text-xs">Back</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionSection;
