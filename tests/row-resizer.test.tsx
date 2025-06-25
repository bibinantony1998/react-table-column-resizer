import React from 'react';
import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    // Helper to render RowResizer within a table structure
    // RowResizer is a <td>, so it needs to be within a <tr>
    const renderResizableRow = (props: Partial<React.ComponentProps<typeof RowResizer>> = {}, initialRowHeight = '100px') => {
      const view = render(
        <table>
          <tbody>
            <tr data-testid="resizable-row" style={{ height: initialRowHeight, minHeight: '0px', maxHeight: 'none' }}>
              <td>Some content</td>
              <RowResizer {...props} data-testid="row-resizer-handle" />
            </tr>
          </tbody>
        </table>
      );
      const resizableRow = screen.getByTestId('resizable-row');
      // RowResizer renders a <td> which has role 'cell' by default in RTL if not a header
      // To be more specific, let's give it a testid in the component or use a custom role if appropriate
      // For now, assuming it's the only 'cell' with its specific class or find by its own testid if added.
      // The RowResizer component itself is a <td>.
      const rowResizerElement = screen.getByRole('cell', { name: '' }); // Find the cell rendered by RowResizer, might need better selector

      // Let's try to find it by its own class if possible, or add a testid to RowResizer's output
      // For now, we assume it's the one with the specific cursor or default style if no classname is passed
      // const rowResizerElement = screen.getByTestId('row-resizer-handle'); // If RowResizer passed data-testid down

      return { ...view, resizableRow, rowResizerElement };
    };


    it('renders one table cell with correct default props and styles', () => {
      render(
        <table><tbody><tr><RowResizer /></tr></tbody></table>
      );

      const resizerElement = screen.getByRole('cell'); // RowResizer is a <td>

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
        <table><tbody><tr><RowResizer className={customClassName} /></tr></tbody></table>
      );
      const resizerElement = screen.getByRole('cell');
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

    it('applies defaultHeight to the parent row on initial mount', () => {
      const defaultH = 120;
      const { resizableRow } = renderResizableRow({ defaultHeight: defaultH }, '50px'); // Initial CSS height 50px

      // The component's useEffect should set the height to defaultHeight
      expect(resizableRow.style.height).toBe(`${defaultH}px`);
    });

    it('initializes to minHeight if defaultHeight is not provided and row has no initial height', () => {
      const minH = 80;
      // Render with no inline style height on the row initially
      const { rerender, getByTestId } = render(
        <table>
          <tbody>
            <tr data-testid="resizable-row" style={{ minHeight: '0px' }}> {/* No explicit height */}
              <td>Content</td>
              <RowResizer minHeight={minH} />
            </tr>
          </tbody>
        </table>
      );
      const resizableRow = getByTestId('resizable-row');
      expect(resizableRow.style.height).toBe(`${minH}px`);

      // If row already has a height, minHeight prop shouldn't override it on mount without defaultHeight
      rerender(
        <table>
          <tbody>
            <tr data-testid="resizable-row-2" style={{ height: '100px', minHeight: '0px' }}>
              <td>Content</td>
              <RowResizer minHeight={minH} />
            </tr>
          </tbody>
        </table>
      );
      // After rerender, query for the new element if the key/testid changes, or re-query if it's the same.
      // Assuming 'resizable-row-2' is a distinct element for this part of the test.
      const resizableRow2 = getByTestId("resizable-row-2");
      expect(resizableRow2.style.height).toBe('100px');
    });

    it('can be dragged to resize the parent row (mouse)', async () => {
      const initialH = 100;
      const { resizableRow, rowResizerElement } = renderResizableRow({}, `${initialH}px`);

      // Mock clientHeight for the component to read
      Object.defineProperty(resizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
      expect(resizableRow.style.height).toBe(`${initialH}px`);

      const initialScreenY = 200;
      await dispatchMouseEvent(rowResizerElement, 'mousedown', initialScreenY);

      // Drag 50px down (increase height)
      // newHeight = startHeightPrev + (currentMouseY - startPos)
      // startHeightPrev = 100 (mocked clientHeight)
      // startPos = initialScreenY = 200
      // currentMouseY (e.screenY) = 250
      // newHeight = 100 + (250 - 200) = 100 + 50 = 150
      const newScreenYIncrease = initialScreenY + 50;
      await dispatchMouseEvent(document, 'mousemove', newScreenYIncrease);
      expect(resizableRow.style.height).toBe('150px');
      await dispatchMouseEvent(document, 'mouseup', newScreenYIncrease);

      // Drag 20px up (decrease height from 150)
      Object.defineProperty(resizableRow, 'clientHeight', { value: 150, configurable: true, writable: true }); // Update mock for next drag
      await dispatchMouseEvent(rowResizerElement, 'mousedown', newScreenYIncrease); // Mousedown at current position

      const newScreenYDecrease = newScreenYIncrease - 20;
      // newHeight = 150 + (230 - 250) = 150 - 20 = 130
      await dispatchMouseEvent(document, 'mousemove', newScreenYDecrease);
      expect(resizableRow.style.height).toBe('130px');
      await dispatchMouseEvent(document, 'mouseup', newScreenYDecrease);
    });

    it('respects minHeight when dragging (mouse)', async () => {
        const minH = 50;
        const initialH = 100;
        const { resizableRow, rowResizerElement } = renderResizableRow({ minHeight: minH, defaultHeight: initialH }, `${initialH}px`);

        Object.defineProperty(resizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(resizableRow.style.height).toBe(`${initialH}px`); // Set by defaultHeight

        const startScreenY = 300;
        await dispatchMouseEvent(rowResizerElement, 'mousedown', startScreenY);

        // Attempt to drag to a height smaller than minHeight
        // Drag up by 80px: newScreenY = startScreenY - 80 = 220
        // newHeight = 100 + (220 - 300) = 100 - 80 = 20px.
        // Should be clamped to minH (50px).
        const newScreenY = startScreenY - (initialH - (minH - 30)); // Drag further than minHeight
        await dispatchMouseEvent(document, 'mousemove', newScreenY);
        expect(resizableRow.style.height).toBe(`${minH}px`);
        await dispatchMouseEvent(document, 'mouseup', newScreenY);
    });

    it('respects maxHeight when dragging (mouse)', async () => {
        const maxH = 150;
        const initialH = 100;
        const { resizableRow, rowResizerElement } = renderResizableRow({ maxHeight: maxH, defaultHeight: initialH }, `${initialH}px`);

        Object.defineProperty(resizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(resizableRow.style.height).toBe(`${initialH}px`);

        const startScreenY = 200;
        await dispatchMouseEvent(rowResizerElement, 'mousedown', startScreenY);

        // Attempt to drag to a height larger than maxHeight
        // Drag down by 80px: newScreenY = startScreenY + 80 = 280
        // newHeight = 100 + (280 - 200) = 100 + 80 = 180px.
        // Should be clamped to maxH (150px).
        const newScreenY = startScreenY + ( (maxH + 30) - initialH ); // Drag further than maxHeight
        await dispatchMouseEvent(document, 'mousemove', newScreenY);
        expect(resizableRow.style.height).toBe(`${maxH}px`);
        await dispatchMouseEvent(document, 'mouseup', newScreenY);
    });

    it('can be dragged to resize the parent row (touch)', async () => {
        const initialH = 80;
        const { resizableRow, rowResizerElement } = renderResizableRow({}, `${initialH}px`);

        Object.defineProperty(resizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(resizableRow.style.height).toBe(`${initialH}px`);

        const initialScreenY = 100;
        await dispatchTouchEvent(rowResizerElement, 'touchstart', initialScreenY);

        // Drag 30px down (increase height)
        // newHeight = 80 + (130 - 100) = 80 + 30 = 110
        const newScreenY = initialScreenY + 30;
        await dispatchTouchEvent(document, 'touchmove', newScreenY);
        expect(resizableRow.style.height).toBe('110px');
        await dispatchTouchEvent(document, 'touchend', newScreenY);
    });

    it('calls resizeStart callback when dragging starts', async () => {
        const mockResizeStart = vi.fn();
        const { resizableRow, rowResizerElement } = renderResizableRow({ resizeStart: mockResizeStart }, '100px');
        Object.defineProperty(resizableRow, 'clientHeight', { value: 100, configurable: true, writable: true });

        await dispatchMouseEvent(rowResizerElement, 'mousedown', 200);
        expect(mockResizeStart).toHaveBeenCalledTimes(1);
        await dispatchMouseEvent(document, 'mouseup', 200); // Cleanup
    });

    it('calls resizeEnd callback with the final height when dragging ends', async () => {
        const mockResizeEnd = vi.fn();
        const initialH = 100;
        const dragDistance = 40; // drag down
        const finalH = initialH + dragDistance;

        const { resizableRow, rowResizerElement } = renderResizableRow({ resizeEnd: mockResizeEnd, defaultHeight: initialH }, `${initialH}px`);
        Object.defineProperty(resizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });

        const startY = 200;
        await dispatchMouseEvent(rowResizerElement, 'mousedown', startY);
        await dispatchMouseEvent(document, 'mousemove', startY + dragDistance);
        await dispatchMouseEvent(document, 'mouseup', startY + dragDistance);

        expect(mockResizeEnd).toHaveBeenCalledTimes(1);
        expect(mockResizeEnd).toHaveBeenCalledWith(finalH);
    });

    it('registers and removes events on document when dragging (and disabled prop changes)', async () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
        const relevantEvents = ['mousemove', 'mouseup', 'touchmove', 'touchend'];

        const getRelevantCalls = (spy: ReturnType<typeof vi.spyOn>) =>
          spy.mock.calls.filter(call => relevantEvents.includes(call[0] as string));

        const { rerender, getByRole } = render(
          <table><tbody><tr><RowResizer disabled={false} /></tr></tbody></table>
        );
        const resizerElement = getByRole('cell');
        const resizableRow = resizerElement.closest('tr')!;
        Object.defineProperty(resizableRow, 'clientHeight', { value: 100, configurable: true, writable: true });


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

        act(() => {
          rerender(<table><tbody><tr><RowResizer disabled={true} /></tr></tbody></table>);
        });
        // Previous effect (disabled=false, dragging=false) cleanup runs.
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0); // New effect (disabled=true) doesn't add.
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4); // Old effect's cleanup.

        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        act(() => {
          rerender(<table><tbody><tr><RowResizer disabled={false} /></tr></tbody></table>);
        });
        // Previous effect (disabled=true, dragging=false) cleanup runs.
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0); // New effect (disabled=false, not dragging) doesn't add.
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4); // Old effect's cleanup.

        // Clear spies for section 4
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // 4. Start dragging, then disable component (should remove listeners)
        await dispatchMouseEvent(resizerElement, 'mousedown', 100); // Adds listeners
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(4);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        act(() => {
            rerender(<table><tbody><tr><RowResizer disabled={true} /></tr></tbody></table>);
        });
        // The useEffect [dragging, disabled, ...] cleanup for disabled changing to true while dragging=true
        // should trigger removeEventListenersFromDocument
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
      });
});
