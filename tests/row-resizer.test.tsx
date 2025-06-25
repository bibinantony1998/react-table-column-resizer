import React from 'react';
import { act } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react'; // Import cleanup
// import '@testing-library/jest-dom'; // Ensure setupVitest.ts handles this or import directly

import RowResizer from '../src/row-resizer'; // Adjust path if necessary

describe('RowResizer', () => {
    // Helper for dispatching mouse events
    const dispatchMouseEvent = async (target: Node | Window, type: string, clientY: number) => {
      await act(async () => {
        fireEvent(
          target,
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientY: clientY, // Use clientY for vertical
            screenY: clientY, // component uses screenY
          })
        );
      });
    };

    // Helper for dispatching touch events
    const dispatchTouchEvent = async (target: Node | Window, type: string, clientY: number) => {
        await act(async () => {
            fireEvent(
                target,
                new TouchEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    touches: [{ clientY: clientY, screenY: clientY, pageX: 0, pageY: clientY, identifier: 0, target } as unknown as TouchInit],
                    changedTouches: [{ clientY: clientY, screenY: clientY, pageX: 0, pageY: clientY, identifier: 0, target } as unknown as TouchInit],
                })
            );
        });
    };

    // Helper to render RowResizer for resizing the PREVIOUS sibling row
    const renderPrevSiblingResizableTable = (
        resizerProps: Partial<React.ComponentProps<typeof RowResizer>> = {},
        targetRowInitialHeight = '100px',
        targetRowTestId = "resizable-row",
        resizerRowTestId = "resizer-row"
    ) => {
      const view = render(
        <table>
          <tbody>
            <tr data-testid={targetRowTestId} style={{ height: targetRowInitialHeight, minHeight: '0px', maxHeight: 'none' }}>
              <td>Target Row Content</td>
            </tr>
            <tr data-testid={resizerRowTestId}>
              <RowResizer {...resizerProps} data-testid="row-resizer-handle" />
            </tr>
          </tbody>
        </table>
      );
      const targetResizableRow = screen.getByTestId(targetRowTestId);
      // The RowResizer component itself is a <td>, which is a 'cell'.
      // We find it by the testid given to RowResizer component itself.
      const rowResizerHandleElement = screen.getByTestId('row-resizer-handle');

      return { ...view, targetResizableRow, rowResizerHandleElement };
    };


    it('renders one table cell with correct default props and styles', () => {
      // This test checks the RowResizer's own appearance, so it doesn't need a preceding row.
      // However, its functionality relies on a preceding row, which other tests will cover.
      render(
        <table><tbody><tr><RowResizer data-testid="row-resizer-handle" /></tr></tbody></table>
      );

      const resizerElement = screen.getByTestId('row-resizer-handle');

      expect(resizerElement).toBeInTheDocument();
      expect(resizerElement).toHaveStyle('user-select: none');
      // The following style 'touch-action: none' is correctly set in the component,
      // but this assertion may fail in some JSDOM environments.
      // expect(resizerElement).toHaveStyle('touch-action: none');
      expect(resizerElement).toHaveStyle('cursor: ns-resize');
      // Default styles when className is ""
      expect(resizerElement).toHaveStyle('width: 100%');
      expect(resizerElement).toHaveStyle('height: 6px');
      expect(resizerElement).toHaveStyle('background-color: rgba(0, 0, 0, 0.1)');

      expect(resizerElement).toHaveClass('row_resizer_own_class');
      expect(resizerElement).not.toHaveClass('disabled_row_resize');
    });

    it('can be disabled', () => {
      render(
         <table><tbody><tr><RowResizer disabled={true} /></tr></tbody></table>
      );
      const resizerElement = screen.getByRole('cell');

      expect(resizerElement).toBeInTheDocument();
      expect(resizerElement).toHaveStyle('user-select: none');
      const currentCursorStyle = getComputedStyle(resizerElement).cursor;
      expect(currentCursorStyle).not.toBe('ns-resize'); // Should not have resize cursor

      // Default styles should still apply if no custom className is given
      expect(resizerElement).toHaveStyle('width: 100%');
      expect(resizerElement).toHaveStyle('height: 6px');

      expect(resizerElement).toHaveClass('row_resizer_own_class');
      expect(resizerElement).toHaveClass('disabled_row_resize');
    });

    it('can accept a custom className', () => {
      const customClassName = "test-custom-row-resizer";
      render(
        <table><tbody><tr><RowResizer className={customClassName} data-testid="row-resizer-handle"/></tr></tbody></table>
      );
      const resizerElement = screen.getByTestId('row-resizer-handle');
      expect(resizerElement).toBeInTheDocument();
      expect(resizerElement).toHaveClass('row_resizer_own_class');
      expect(resizerElement).toHaveClass(customClassName);

      // Default width/height/backgroundColor should NOT apply when custom className is present
      expect(resizerElement.style.width).toBeFalsy();
      expect(resizerElement.style.height).toBeFalsy();
      expect(resizerElement.style.backgroundColor).toBeFalsy();

      // Base styles like userSelect and cursor should still apply
      expect(resizerElement).toHaveStyle('user-select: none');
      expect(resizerElement).toHaveStyle('cursor: ns-resize');
    });

    it('applies defaultHeight to the PREVIOUS SIBLING row on initial mount', () => {
      const defaultH = 120;
      // Initial height of target row is 50px
      const { targetResizableRow } = renderPrevSiblingResizableTable({ defaultHeight: defaultH }, '50px');

      // The component's useEffect should set the height of the target (previous) row
      expect(targetResizableRow.style.height).toBe(`${defaultH}px`);
    });

    it('initializes PREVIOUS SIBLING row to minHeight if defaultHeight is not provided and row has no initial height', () => {
      const minH = 80;
      const { rerender, getByTestId } = renderPrevSiblingResizableTable(
        { minHeight: minH }, // RowResizer props
        '', // Target row has no initial inline height style
        "target-row-1"
      );
      const targetRow1 = getByTestId('target-row-1');
      expect(targetRow1.style.height).toBe(`${minH}px`);

      // Cleanup after the first render part of the test
      cleanup();

      // If target row already has a height, minHeight prop shouldn't override it on mount without defaultHeight
      const { getByTestId: getByTestId2 } = renderPrevSiblingResizableTable(
        { minHeight: minH }, // RowResizer props
        '100px', // Target row has initial height
        "target-row-2" // Use a different testId for the target row in this part
      );
      const targetRow2 = getByTestId2("target-row-2");
      expect(targetRow2.style.height).toBe('100px');
    });

    it('can be dragged to resize the PREVIOUS SIBLING row (mouse)', async () => {
      const initialH = 100;
      const { targetResizableRow, rowResizerHandleElement } = renderPrevSiblingResizableTable({}, `${initialH}px`);

      // Mock clientHeight for the component to read from the target row
      Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
      expect(targetResizableRow.style.height).toBe(`${initialH}px`);

      const initialScreenY = 200;
      await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', initialScreenY);

      const newScreenYIncrease = initialScreenY + 50;
      await dispatchMouseEvent(document, 'mousemove', newScreenYIncrease);
      expect(targetResizableRow.style.height).toBe('150px');
      await dispatchMouseEvent(document, 'mouseup', newScreenYIncrease);

      // Drag 20px up (decrease height from 150)
      Object.defineProperty(targetResizableRow, 'clientHeight', { value: 150, configurable: true, writable: true });
      await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', newScreenYIncrease);

      const newScreenYDecrease = newScreenYIncrease - 20;
      await dispatchMouseEvent(document, 'mousemove', newScreenYDecrease);
      expect(targetResizableRow.style.height).toBe('130px');
      await dispatchMouseEvent(document, 'mouseup', newScreenYDecrease);
    });

    it('respects minHeight when dragging PREVIOUS SIBLING row (mouse)', async () => {
        const minH = 50;
        const initialH = 100;
        const { targetResizableRow, rowResizerHandleElement } = renderPrevSiblingResizableTable(
            { minHeight: minH, defaultHeight: initialH },
            `${initialH}px`
        );

        Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        // defaultHeight prop should set the initial height of the target row
        expect(targetResizableRow.style.height).toBe(`${initialH}px`);

        const startScreenY = 300;
        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', startScreenY);

        const newScreenY = startScreenY - (initialH - (minH - 30)); // Drag further than minHeight
        await dispatchMouseEvent(document, 'mousemove', newScreenY);
        expect(targetResizableRow.style.height).toBe(`${minH}px`);
        await dispatchMouseEvent(document, 'mouseup', newScreenY);
    });

    it('respects maxHeight when dragging PREVIOUS SIBLING row (mouse)', async () => {
        const maxH = 150;
        const initialH = 100;
        const { targetResizableRow, rowResizerHandleElement } = renderPrevSiblingResizableTable(
            { maxHeight: maxH, defaultHeight: initialH },
            `${initialH}px`
        );

        Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(targetResizableRow.style.height).toBe(`${initialH}px`);

        const startScreenY = 200;
        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', startScreenY);

        const newScreenY = startScreenY + ( (maxH + 30) - initialH ); // Drag further than maxHeight
        await dispatchMouseEvent(document, 'mousemove', newScreenY);
        expect(targetResizableRow.style.height).toBe(`${maxH}px`);
        await dispatchMouseEvent(document, 'mouseup', newScreenY);
    });

    it('can be dragged to resize the PREVIOUS SIBLING row (touch)', async () => {
        const initialH = 80;
        const { targetResizableRow, rowResizerHandleElement } = renderPrevSiblingResizableTable({}, `${initialH}px`);

        Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(targetResizableRow.style.height).toBe(`${initialH}px`);

        const initialScreenY = 100;
        await dispatchTouchEvent(rowResizerHandleElement, 'touchstart', initialScreenY);

        const newScreenY = initialScreenY + 30;
        await dispatchTouchEvent(document, 'touchmove', newScreenY);
        expect(targetResizableRow.style.height).toBe('110px');
        await dispatchTouchEvent(document, 'touchend', newScreenY);
    });

    it('calls resizeStart callback when dragging starts (targeting previous sibling)', async () => {
        const mockResizeStart = vi.fn();
        // Important: The targetResizableRow needs to exist for getTargetRow() in startDrag to succeed.
        const { targetResizableRow, rowResizerHandleElement } = renderPrevSiblingResizableTable(
            { resizeStart: mockResizeStart },
            '100px'
        );
        // Mock clientHeight for the target row
        Object.defineProperty(targetResizableRow, 'clientHeight', { value: 100, configurable: true, writable: true });

        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', 200);
        expect(mockResizeStart).toHaveBeenCalledTimes(1);
        await dispatchMouseEvent(document, 'mouseup', 200); // Cleanup
    });

    it('calls resizeEnd callback with the final height when dragging ends (targeting previous sibling)', async () => {
        const mockResizeEnd = vi.fn();
        const initialH = 100;
        const dragDistance = 40; // drag down
        const finalH = initialH + dragDistance;

        const { targetResizableRow, rowResizerHandleElement } = renderPrevSiblingResizableTable(
            { resizeEnd: mockResizeEnd, defaultHeight: initialH },
            `${initialH}px`
        );
        Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });

        const startY = 200;
        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', startY);
        await dispatchMouseEvent(document, 'mousemove', startY + dragDistance);
        await dispatchMouseEvent(document, 'mouseup', startY + dragDistance);

        expect(mockResizeEnd).toHaveBeenCalledTimes(1);
        expect(mockResizeEnd).toHaveBeenCalledWith(finalH);
    });

    it('registers and removes events on document when dragging (and disabled prop changes, targeting previous sibling)', async () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
        const relevantEvents = ['mousemove', 'mouseup', 'touchmove', 'touchend'];

        const getRelevantCalls = (spy: ReturnType<typeof vi.spyOn>) =>
          spy.mock.calls.filter(call => relevantEvents.includes(call[0] as string));

        const mockResizeStartForEventTest = vi.fn();

        // Setup table with a preceding row for RowResizer to target
        const { rerender, getByTestId } = render(
            <table>
              <tbody>
                <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                <tr><RowResizer data-testid="event-test-resizer" disabled={false} resizeStart={mockResizeStartForEventTest} /></tr>
              </tbody>
            </table>
        );
        const resizerElement = getByTestId('event-test-resizer');
        const targetRowForEvents = getByTestId('target-row-for-event-test');
        Object.defineProperty(targetRowForEvents, 'clientHeight', { value: 100, configurable: true, writable: true });


        // 1. Start dragging (disabled=false)
        await dispatchMouseEvent(resizerElement, 'mousedown', 100);
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(4); // mousemove, mouseup, touchmove, touchend
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // 2. Stop dragging
        await dispatchMouseEvent(document, 'mouseup', 100);
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // 3. Test disabled prop change while NOT dragging
        // Spies are clear before this from previous steps or should be cleared.
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        act(() => {
          rerender(
            <table>
              <tbody>
                <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                {/* Pass the mock to RowResizer during rerender as well */}
                <tr><RowResizer data-testid="event-test-resizer" disabled={true} resizeStart={mockResizeStartForEventTest} /></tr>
              </tbody>
            </table>
          );
        });
        // Previous effect (disabled=false, dragging=false) cleanup runs.
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0); // New effect (disabled=true) doesn't add.
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4); // Old effect's cleanup.

        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        act(() => {
          rerender(
            <table>
              <tbody>
                <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                <tr><RowResizer data-testid="event-test-resizer" disabled={false} resizeStart={mockResizeStartForEventTest} /></tr>
              </tbody>
            </table>
          );
        });
        // Previous effect (disabled=true, dragging=false) cleanup runs.
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0); // New effect (disabled=false, not dragging) doesn't add.
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4); // Old effect's cleanup.

        // Clear spies for section 4
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        // 4. Start dragging, then disable component (should remove listeners)
        await dispatchMouseEvent(resizerElement, 'mousedown', 100); // Adds listeners
        expect(mockResizeStartForEventTest).toHaveBeenCalledTimes(1); // Check if startDrag was entered
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(4);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        act(() => {
            rerender(
              <table>
                <tbody>
                  <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                  <tr><RowResizer data-testid="event-test-resizer" disabled={true} resizeStart={mockResizeStartForEventTest} /></tr>
                </tbody>
              </table>
            );
        });
        // The useEffect [dragging, disabled, ...] cleanup for disabled changing to true while dragging=true
        // should trigger removeEventListenersFromDocument
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
      });
});
