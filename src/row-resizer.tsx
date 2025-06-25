// Inspired by: Bibin Antony, Nik M
// https://github.com/bibinantony1998/react-table-column-resizer

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Props for the RowResizer component.
 * Extends standard HTML <td> attributes, but omits 'onResize' if it exists to avoid conflicts.
 * We also define our own logical `disabled` prop, separate from the HTML attribute.
 */
interface RowResizerProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'onResize' | 'disabled'> {
    /** Disables the resizer's drag functionality and applies disabled styling. */
    disabled?: boolean; // This is our logical disabled prop
    /** Minimum height the target row can be resized to (in pixels). Defaults to 0. */
    minHeight?: number;
    /** Maximum height the target row can be resized to (in pixels). No limit by default. */
    maxHeight?: number;
    /** Callback function triggered when resizing starts. */
    resizeStart?: () => void;
    /** Callback function triggered when resizing ends, providing the new height of the target row. */
    resizeEnd?: (newHeight: number) => void;
    /** Default height for the target row (in pixels). Applied on mount if the target row has no explicit height. */
    defaultHeight?: number;
    // className, id, colSpan, etc., are inherited from TdHTMLAttributes
}

/**
 * A React component that renders as a `<td>` element. It is intended to be placed
 * in its own `<tr>` and allows resizing the height of the `<tr>` element
 * immediately preceding it.
 */
const RowResizer: React.FC<RowResizerProps> = ({
    // Component-specific logical props with defaults
    disabled: logicalDisabled = false, // Use this for internal logic
    minHeight = 0,
    maxHeight,
    resizeStart,
    resizeEnd,
    defaultHeight,
    // Standard HTML attributes (like className, id, colSpan, data-testid, HTML's disabled)
    // are captured by ...restProps
    className: propClassName, // Explicitly capture className to combine it
    ...restProps
}) => {
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState(0); // Stores initial mouse Y position during drag
    const [startHeightTarget, setStartHeightTarget] = useState(0); // Stores initial height of the target row (previous sibling)
    const [lastDraggedHeight, setLastDraggedHeight] = useState(0); // Stores the last calculated height during drag

    const resizeRef = useRef<HTMLTableCellElement>(null); // Ref for the resizer's own <td> element

    const getTargetRow = useCallback((): HTMLTableRowElement | null => {
        if (resizeRef.current) {
            // Ensure resizeRef.current.closest('tr') is not null before accessing previousElementSibling
            const resizerRow = resizeRef.current.closest('tr');
            if (resizerRow && resizerRow.previousElementSibling instanceof HTMLTableRowElement) {
                return resizerRow.previousElementSibling;
            }
        }
        return null;
    }, []); // No dependencies needed as it only uses resizeRef.current

    /**
     * Initiates the dragging process.
     * Called on mousedown/touchstart on the resizer element.
     */
    const startDrag = useCallback((initialMouseY: number) => {
        if (logicalDisabled) { // Use logicalDisabled for behavior
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

    }, [logicalDisabled, resizeStart, getTargetRow]); // Corrected: disabled -> logicalDisabled

    /**
     * Finalizes the dragging process.
     * Called on mouseup/touchend on the document.
     */
    const endDrag = useCallback(() => {
        if (logicalDisabled) { // Use logicalDisabled
            setDragging(false);
            return;
        }
        if (dragging && resizeEnd) {
            resizeEnd(lastDraggedHeight);
        }
        setDragging(false);
    }, [logicalDisabled, resizeEnd, lastDraggedHeight, dragging]); // Corrected: disabled -> logicalDisabled

    /**
     * Handles mouse movement during dragging to resize the row.
     * Called on mousemove/touchmove on the document.
     */
    const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (logicalDisabled || !dragging) { // Use logicalDisabled
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

    }, [logicalDisabled, dragging, startPos, startHeightTarget, minHeight, maxHeight, getTargetRow]); // Corrected: disabled -> logicalDisabled

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

        if (dragging && !logicalDisabled) { // Use logicalDisabled
            addEventListenersToDocument();
        }

        return () => {
            removeEventListenersFromDocument();
        };
    }, [dragging, logicalDisabled, onMouseMove, endDrag]);


    const style: React.CSSProperties = {
        userSelect: "none",
        touchAction: 'none',
    };

    if (!logicalDisabled) { // Use logicalDisabled
        style.cursor = 'ns-resize';
    }

    // Combine provided className (propClassName) with component's own classes
    const combinedClassName = `${propClassName || ''} row_resizer_own_class ${logicalDisabled ? "disabled_row_resize" : ""}`.trim();

    // Apply default visual styles only if no custom className (propClassName) is provided
    if (!propClassName) {
        style.width = '100%';
        style.height = '6px';
        style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    }

    return (
        <td
            ref={resizeRef}
            style={style}
            className={combinedClassName}
            onMouseDown={!logicalDisabled ? (e) => startDrag(e.screenY) : undefined}
            onTouchStart={!logicalDisabled ? (e) => startDrag(e.touches[0].screenY) : undefined}
            {...restProps} // Spreads id, colSpan, data-testid, AND the HTML disabled attribute etc.
        >
            {/* Content for the resizer cell, if any. Could be empty or a grip icon. */}
        </td>
    );
};

export default RowResizer;
