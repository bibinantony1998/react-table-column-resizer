// Inspired by: Bibin Antony, Nik M
// https://github.com/bibinantony1998/react-table-column-resizer

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Props for the RowResizer component.
 * Extends standard HTML <tr> attributes. Specific props control the behavior and appearance
 * of the inner <td> handle.
 */
interface RowResizerProps extends Omit<React.TrHTMLAttributes<HTMLTableRowElement>, 'onResize'> {
    /** Disables the resizer's drag functionality. */
    disabled?: boolean;
    /** Minimum height the target (previous sibling) row can be resized to (in pixels). Defaults to 0. */
    minHeight?: number;
    /** Maximum height the target (previous sibling) row can be resized to (in pixels). No limit by default. */
    maxHeight?: number;
    /** Callback function triggered when resizing starts. */
    resizeStart?: () => void;
    /** Callback function triggered when resizing ends, providing the new height of the target row. */
    resizeEnd?: (newHeight: number) => void;
    /** Default height for the target (previous sibling) row (in pixels). */
    defaultHeight?: number;
    /** `colSpan` for the inner `<td>` handle element. Should typically span all columns of the table. */
    colSpanTD?: number;
    /** Optional CSS class name for the inner `<td>` handle element. */
    handleClassName?: string;
    /** Optional inline styles for the inner `<td>` handle element. */
    handleStyle?: React.CSSProperties;
    // className, id, etc. passed to RowResizer will apply to the outer <tr> element.
}

/**
 * A React component that renders as a `<tr>` element, containing a `<td>` handle.
 * It is designed to be placed directly within a `<tbody>` (or `<thead>`/`<tfoot>`).
 * Dragging the handle resizes the height of the `<tr>` element immediately preceding this component.
 */
const RowResizer: React.FC<RowResizerProps> = ({
    // Logical props
    disabled = false,
    minHeight = 0,
    maxHeight,
    resizeStart,
    resizeEnd,
    defaultHeight,
    // Props for the inner <td> handle
    colSpanTD,
    handleClassName,
    handleStyle,
    // Standard <tr> attributes (className, id, data-testid, etc.) are captured by ...restTrProps
    ...restTrProps
}) => {
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [startHeightTarget, setStartHeightTarget] = useState(0);
    const [lastDraggedHeight, setLastDraggedHeight] = useState(0);

    // Ref for the inner <td> element which is the draggable handle
    const handleRef = useRef<HTMLTableCellElement>(null);

    const getTargetRow = useCallback((): HTMLTableRowElement | null => {
        if (handleRef.current) {
            // The RowResizer component renders a <tr>. handleRef is the <td> inside it.
            // So, handleRef.current.closest('tr') is the RowResizer's own <tr>.
            const resizerOwnTr = handleRef.current.closest('tr');
            if (resizerOwnTr && resizerOwnTr.previousElementSibling instanceof HTMLTableRowElement) {
                return resizerOwnTr.previousElementSibling;
            }
        }
        return null;
    }, []);

    /**
     * Initiates the dragging process.
     * Called on mousedown/touchstart on the resizer element.
     */
    const startDrag = useCallback((initialMouseY: number) => {
        if (disabled) {
            return;
        }

        const targetRow = getTargetRow();
        if (!targetRow) {
            console.warn("RowResizer: No previous sibling TR element found to resize.");
            return;
        }

        if (resizeStart) {
            resizeStart();
        }
        setDragging(true);
        setStartPos(initialMouseY);
        setStartHeightTarget(targetRow.clientHeight);

    }, [disabled, resizeStart, getTargetRow]); // Use the actual 'disabled' prop from component scope

    /**
     * Finalizes the dragging process.
     * Called on mouseup/touchend on the document.
     */
    const endDrag = useCallback(() => {
        if (disabled) {
            setDragging(false);
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
        const targetRow = getTargetRow();

        if (!targetRow) return;

        const moveDiff = currentMouseY - startPos;
        let newHeight = startHeightTarget + moveDiff;

        // Apply min/max height constraints
        if (minHeight !== undefined && newHeight < minHeight) {
            newHeight = minHeight;
        }
        if (maxHeight !== undefined && newHeight > maxHeight) {
            newHeight = maxHeight;
        }

        targetRow.style.height = newHeight + 'px';
        setLastDraggedHeight(newHeight);

    }, [disabled, dragging, startPos, startHeightTarget, minHeight, maxHeight, getTargetRow]);

    /**
     * Effect to apply initial height (defaultHeight or minHeight) to the target (previous sibling) row
     * on mount or when these props change.
     */
    useEffect(() => {
        const targetRow = getTargetRow();
        if (targetRow) {
            if (defaultHeight) {
                targetRow.style.height = defaultHeight + 'px';
            } else if (minHeight && !targetRow.style.height) { // Apply minHeight only if no height is already set
                // Make sure minHeight is not undefined before using it. Default is 0.
                targetRow.style.height = `${minHeight}px`;
            }
        }
    }, [defaultHeight, minHeight, getTargetRow]);

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

        if (dragging && !disabled) {
            addEventListenersToDocument();
        }

        return () => {
            removeEventListenersFromDocument();
        };
    }, [dragging, disabled, onMouseMove, endDrag]);

    // Styles for the inner <td> handle
    const tdHandleStyle: React.CSSProperties = {
        userSelect: "none",
        touchAction: 'none',
        padding: 0, // Remove padding for a thin line
        ...(handleStyle || {}), // Merge custom handle styles
    };

    if (!disabled) {
        tdHandleStyle.cursor = 'ns-resize';
    }

    // Apply default visual styles to the handle <td> if no custom handleClassName is provided
    // These styles make the handle appear as a thin bar.
    if (!handleClassName && !handleStyle?.height) { // Only apply default height if not overridden
        tdHandleStyle.height = '6px';
    }
    if (!handleClassName && !handleStyle?.backgroundColor) { // Only apply default bg if not overridden
         tdHandleStyle.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    }
    // Width is controlled by colSpan on the TD, and table layout.

    const tdHandleClassName = `row_resizer_handle_cell ${disabled ? "disabled_row_resize_handle" : ""} ${handleClassName || ''}`.trim();

    return (
        <tr {...restTrProps}>
            <td
                ref={handleRef}
                colSpan={colSpanTD || 100} // Default to a large colspan if not provided
                style={tdHandleStyle}
                className={tdHandleClassName}
                onMouseDown={!disabled ? (e) => startDrag(e.screenY) : undefined}
                onTouchStart={!disabled ? (e) => startDrag(e.touches[0].screenY) : undefined}
            >
                {/* Typically empty, or could have a grip icon via CSS */}
            </td>
        </tr>
    );
};

export default RowResizer;
