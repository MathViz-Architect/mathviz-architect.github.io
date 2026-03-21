/**
 * MobileBottomSheet — vaul-based drawer for mobile screens.
 *
 * On md+ (≥768px) renders nothing — the desktop sidebar handles layout.
 * On <768px renders a bottom sheet that covers ~40vh, leaving the canvas visible.
 *
 * The sheet has a drag handle and can be dismissed by dragging down.
 * `modal={false}` keeps the canvas interactive while the sheet is open.
 */
import React from 'react';
import { Drawer } from 'vaul';

interface MobileBottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    /** Label shown in the drag-handle area */
    title?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
    open,
    onOpenChange,
    children,
    title,
}) => {
    return (
        <Drawer.Root
            open={open}
            onOpenChange={onOpenChange}
            // modal=false → canvas stays interactive, no backdrop pointer-events block
            modal={false}
            // Snap to 40% of screen height; user can drag to dismiss
            snapPoints={[0.4]}
            activeSnapPoint={0.4}
            // Prevent the body from being scaled/shifted on open
            shouldScaleBackground={false}
        >
            <Drawer.Portal>
                {/* Translucent overlay — pointer-events-none so canvas stays usable */}
                <Drawer.Overlay className="fixed inset-0 bg-black/20 pointer-events-none z-40" />

                <Drawer.Content
                    className="
            fixed bottom-0 left-0 right-0 z-50
            flex flex-col
            bg-white rounded-t-2xl shadow-2xl
            max-h-[40vh]
            outline-none
          "
                    // Prevent touch events from propagating to canvas while interacting with sheet
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    {/* Drag handle */}
                    <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0">
                        <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>

                    {/* Optional title */}
                    {title && (
                        <div className="px-4 pb-2 flex-shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
                        </div>
                    )}

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default MobileBottomSheet;
