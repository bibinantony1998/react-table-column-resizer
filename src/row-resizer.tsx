// Inspired by: Bibin Antony, Nik M
// https://github.com/bibinantony1998/react-table-column-resizer

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Props for the RowResizer component.
 */
interface RowResizerProps {
    /** Disables the resizer. */
    disabled?: boolean;
    /** Minimum height the row can be resized to (in pixels). Defaults to 0. */
    minHeight?: number;
    /** Maximum height the row can be resized to (in pixels). No limit by default. */
    maxHeight?: number;
    /** Custom CSS class name for the resizer element. */
    className?: string;
    /** Optional ID for the resizer element, useful for testing or specific styling. */
    id?: string | number;
    /** Callback function triggered when resizing starts. */
    resizeStart?: () => void;
    /** Callback function triggered when resizing ends, providing the new height. */
    resizeEnd?: (newHeight: number) => void;
    /** Default height for the row (in pixels). Applied on mount. */
    defaultHeight?: number;
    /** Colspan for the `<td>` element rendered by RowResizer. */
    colSpan?: number;
}

/**
 * A React component that renders as a `<td>` element and allows resizing
 * the height of its parent `<tr>` element.
 * It should be placed as a cell within the table row that needs to be resizable.
 */
const RowResizer: React.FC<RowResizerProps> = ({
    disabled = false,
    minHeight = 0,
    maxHeight,
    className = "",
    id, // Retained for consistency, though not critical for current core logic
    resizeStart,
    resizeEnd,
    defaultHeight,
    colSpan,
}) => {
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState(0); // Stores initial mouse Y position during drag
    const [startHeightPrev, setStartHeightPrev] = useState(0); // Stores initial height of the parent row
    const [lastDraggedHeight, setLastDraggedHeight] = useState(0); // Stores the last calculated height during drag

    const resizeRef = useRef<HTMLTableCellElement>(null); // Ref for the resizer's own <td> element

    /**
     * Initiates the dragging process.
     * Called on mousedown/touchstart on the resizer element.
     */
    const startDrag = useCallback((initialMouseY: number) => {
        if (disabled) {
            return;
        }
        if (resizeStart) {
            resizeStart();
        }
        setDragging(true);
        setStartPos(initialMouseY);

        setStartHeightPrev(0); // Reset before reading new height
        if (resizeRef.current) {
            const parentRow = resizeRef.current.closest('tr');
            if (parentRow) {
                setStartHeightPrev(parentRow.clientHeight);
            }
        }
    }, [disabled, resizeStart]);

    /**
     * Finalizes the dragging process.
     * Called on mouseup/touchend on the document.
     */
    const endDrag = useCallback(() => {
        if (disabled) { // Check disabled again in case it changed during drag
            setDragging(false); // Ensure dragging state is reset
            return;
        }
        if (dragging && resizeEnd) {
            resizeEnd(lastDraggedHeight);
        }
        setDragging(false);
    }, [disabled, resizeEnd, lastDraggedHeight, dragging]);

    /**
     * Handles mouse movement during dragging to resize the row.
     * Called on mousemove/touchmove on the document.
     */
    const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (disabled || !dragging) {
            return;
        }

        const currentMouseY = e instanceof TouchEvent ? e.touches[0].screenY : e.screenY;

        const parentRow = resizeRef.current?.closest('tr');
        if (!parentRow) return;

        const moveDiff = currentMouseY - startPos;
        let newHeight = startHeightPrev + moveDiff;

        // Apply min/max height constraints
        if (minHeight !== undefined && newHeight < minHeight) {
            newHeight = minHeight;
        }
        if (maxHeight !== undefined && newHeight > maxHeight) {
            newHeight = maxHeight;
        }

        parentRow.style.height = newHeight + 'px';
        setLastDraggedHeight(newHeight);

    }, [disabled, dragging, startPos, startHeightPrev, minHeight, maxHeight]);

    /**
     * Effect to apply initial height (defaultHeight or minHeight) to the parent row on mount
     * or when these props change.
     */
    useEffect(() => {
        const parentRow = resizeRef.current?.closest('tr');
        if (parentRow) {
            if (defaultHeight) {
                parentRow.style.height = defaultHeight + 'px';
            } else if (minHeight && !parentRow.style.height) { // Apply minHeight only if no height is already set
                parentRow.style.height = minHeight + 'px';
            }
        }
    }, [defaultHeight, minHeight]); // Dependencies: defaultHeight, minHeight

    /**
     * Effect to manage global event listeners for dragging.
     * Listeners are added when dragging starts and removed when dragging stops or component unmounts.
     */
    useEffect(() => {
        const addEventListenersToDocument = () => {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', endDrag);
            document.addEventListener("touchmove", onMouseMove as EventListener);
            document.addEventListener("touchend", endDrag as EventListener);
        };

        const removeEventListenersFromDocument = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener("touchmove", onMouseMove as EventListener);
            document.removeEventListener("touchend", endDrag as EventListener);
        };

        if (dragging && !disabled) { // Only add when dragging starts
            addEventListenersToDocument();
        }

        return () => { // Cleanup function
            removeEventListenersFromDocument(); // Always remove, covers cases where dragging stops or component unmounts
        };
    }, [dragging, disabled, onMouseMove, endDrag]);


    const style: React.CSSProperties = {
        userSelect: "none",
        touchAction: 'none', // Recommended for touch dragging
    };

    if (!disabled) {
        style.cursor = 'ns-resize'; // North-South resize cursor
    }

    if (className === "") {
        // Default visual style for the resizer TD if no custom class is provided
        // This makes the TD a thin, horizontal bar.
        style.width = '100%'; // Take full width of the cell it's in
        style.height = '6px'; // A thin horizontal bar
        style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    }

    // The RowResizer itself could be a <td>.
    // Or, it could be a <div> inside a <td>, or a <tr> itself (less common for this pattern).
    // For now, let's make it a <td>, similar to how ColumnResizer is a <th>.
    // This means it would occupy a cell in the row.
    // A more common UI might be a thin line *between* rows, or a handle on the row border.
    // If used as a TD, it implies the resizable TR has an extra cell for this handle.
    return (
        <td
            ref={resizeRef}
            style={style}
            colSpan={colSpan}
            className={`row_resizer_own_class ${disabled ? "disabled_row_resize" : ""} ${className}`}
            onMouseDown={!disabled ? (e) => startDrag(e.screenY) : undefined}
            onTouchStart={!disabled ? (e) => startDrag(e.touches[0].screenY) : undefined}
        >
            {/* Content for the resizer cell, if any. Could be empty or a grip icon. */}
        </td>
    );
};

export default RowResizer;
