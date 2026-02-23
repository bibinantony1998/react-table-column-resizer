//Author: Bibin Antony, Nik M
//https://github.com/bibinantony1998/react-table-column-resizer

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ColumnResizerProps {
    disabled?: boolean;
    minWidth?: number;
    maxWidth?: number;
    className?: string;
    id?: string | number;
    resizeStart?: () => void;
    resizeEnd?: (newWidth: number) => void;
    defaultWidth?: number;
    rowSpan?: number;
    colSpan?: number;
}

const ColumnResizer: React.FC<ColumnResizerProps> = ({
    disabled = false,
    minWidth = 0,
    maxWidth,
    className = "",
    id,
    resizeStart,
    resizeEnd,
    defaultWidth,
    rowSpan = 1,
    colSpan = 1,
}) => {
    const [dragging, setDragging] = useState(false);
    // mouseX is captured by onMouseMove and used for calculating movement during drag
    // It's not strictly needed as a state for startDrag's initial position
    // const [mouseX, setMouseX] = useState(0); 
    const [startPos, setStartPos] = useState(0);
    const [startWidthPrev, setStartWidthPrev] = useState(0);
    const [lastDraggedWidth, setLastDraggedWidth] = useState(0);
    const [draggedCol, setDraggedCol] = useState<string | null | undefined>(null);
    const resizeRef = useRef<HTMLTableHeaderCellElement>(null);

    const startDrag = useCallback((initialMouseX: number) => {
        if (disabled) {
            return;
        }
        setDraggedCol(id);
        if (resizeStart) {
            resizeStart();
        }
        setDragging(true);
        setStartPos(initialMouseX);

        setStartWidthPrev(0);
        if (resizeRef.current) {
            const prevSibling = resizeRef.current.previousSibling as HTMLElement;
            if (prevSibling) {
                setStartWidthPrev(prevSibling.clientWidth);
            }
        }
    }, [disabled, id, resizeStart]);

    const endDrag = useCallback(() => {
        if (disabled) {
            return;
        }
        // Only call resizeEnd if this column was actually being dragged
        if (dragging && resizeEnd && draggedCol === id) {
            resizeEnd(lastDraggedWidth);
        }
        setDragging(false);
        setDraggedCol(null);
    }, [disabled, resizeEnd, draggedCol, id, lastDraggedWidth, dragging]);

    const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (disabled) {
            return;
        }
        
        const currentMouseX = "touches" in e ? e.touches[0].screenX : e.screenX;
        // setMouseX(currentMouseX); // mouseX state is not strictly needed for onMouseMove's core logic

        if (!dragging) {
            return;
        }

        const ele = resizeRef.current;
        if (!ele || !ele.previousSibling) return;

        const prevSibling = ele.previousSibling as HTMLElement;
        const moveDiff = startPos - currentMouseX;
        let newPrev = startWidthPrev - moveDiff;

        // Clamp newPrev to minWidth and maxWidth
        if (minWidth !== undefined && newPrev < minWidth) {
            newPrev = minWidth;
        }
        if (maxWidth !== undefined && newPrev > maxWidth) {
            newPrev = maxWidth;
        }

        // Always apply the (potentially clamped) newPrev
        prevSibling.style.width = newPrev + 'px';
        prevSibling.style.minWidth = newPrev + 'px'; // Keep minWidth/maxWidth of the cell in sync with its current width
        prevSibling.style.maxWidth = newPrev + 'px';
        prevSibling.style.setProperty('--column_resize_before_width', newPrev + 'px');
        setLastDraggedWidth(newPrev);
        
    }, [disabled, dragging, startPos, startWidthPrev, minWidth, maxWidth]);

    useEffect(() => {
        const ele = resizeRef.current;
        if (ele && ele.previousSibling) {
            const prevSibling = ele.previousSibling as HTMLElement;
            if (defaultWidth) {
                prevSibling.style.minWidth = defaultWidth + 'px';
                prevSibling.style.width = defaultWidth + 'px';
                prevSibling.style.maxWidth = defaultWidth + 'px';
                prevSibling.style.setProperty('--column_resize_before_width', defaultWidth + 'px');
            } else if (minWidth) {
                prevSibling.style.minWidth = minWidth + 'px';
                prevSibling.style.width = minWidth + 'px';
                prevSibling.style.maxWidth = minWidth + 'px';
                prevSibling.style.setProperty('--column_resize_before_width', minWidth + 'px');
            }
        }
    }, [defaultWidth, minWidth]); // Runs on mount and when defaultWidth/minWidth changes

    useEffect(() => {
        const ele = resizeRef.current;
        if (disabled && ele && ele.previousSibling) {
            const prevSibling = ele.previousSibling as HTMLElement;
            if (defaultWidth) {
                prevSibling.style.minWidth = defaultWidth + 'px';
                prevSibling.style.width = defaultWidth + 'px';
                prevSibling.style.maxWidth = defaultWidth + 'px';
                prevSibling.style.setProperty('--column_resize_before_width', defaultWidth + 'px');
            }
            if (maxWidth) {
                prevSibling.style.maxWidth = maxWidth + 'px';
            }
        }
    }, [disabled, defaultWidth, maxWidth]); // Handles disabled prop effect on styles

    const addEventListenersToDocument = useCallback(() => {
        // console.log('TEST_DEBUG: addEventListenersToDocument called');
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener("touchmove", onMouseMove as EventListener); // Cast needed for TouchEvent
        document.addEventListener("touchend", endDrag as EventListener); // Cast needed for TouchEvent
    }, [onMouseMove, endDrag]); // onMouseMove and endDrag are already memoized

    const removeEventListenersFromDocument = useCallback(() => {
        // console.log('TEST_DEBUG: removeEventListenersFromDocument called');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener("touchmove", onMouseMove as EventListener);
        document.removeEventListener("touchend", endDrag as EventListener);
    }, [onMouseMove, endDrag]); // onMouseMove and endDrag are already memoized

    useEffect(() => {
        // console.log(`TEST_DEBUG: Main listener useEffect runs. Disabled: ${disabled}`);
        if (!disabled) {
            addEventListenersToDocument();
        }
        // No 'else' block to call removeEventListenersToDocument; the cleanup function handles all removals.
        return () => {
            // console.log(`TEST_DEBUG: Main listener useEffect CLEANUP. Disabled: ${disabled} (at time of cleanup scheduling)`);
            removeEventListenersFromDocument();
        };
    }, [disabled, addEventListenersToDocument, removeEventListenersFromDocument]);

    const style: React.CSSProperties = {
        userSelect: "none"
    };
    if (!disabled) {
        style.cursor = 'ew-resize';
    }
    if (className === "") {
        style.width = '6px';
        style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    }

    return (
        <th
            ref={resizeRef}
            style={style}
            // disabled={disabled} // th cannot have disabled attribute
            rowSpan={rowSpan}
            colSpan={colSpan}
            className={`column_resizer_own_class ${disabled ? "disabled_column_resize" : ""} ${className}`}
            onMouseDown={!disabled ? (e) => startDrag(e.screenX) : undefined}
            onTouchStart={!disabled ? (e) => startDrag(e.touches[0].screenX) : undefined}
        />
    );
};

export default ColumnResizer;
