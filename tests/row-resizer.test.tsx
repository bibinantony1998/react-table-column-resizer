import React from 'react';
import { act } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import RowResizer from '../src/row-resizer';

describe('RowResizer', () => {
    afterEach(cleanup); // Ensure cleanup after each test

    const dispatchMouseEvent = async (target: Node | Window, type: string, clientY: number) => {
      await act(async () => {
        fireEvent(
          target,
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientY: clientY,
            screenY: clientY,
          })
        );
      });
    };

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

    const renderRowResizerAndTarget = (
        resizerProps: Partial<React.ComponentProps<typeof RowResizer>> = {},
        targetRowInitialHeight = '100px',
        targetRowTestId = "resizable-row"
    ) => {
      const view = render(
        <table>
          <tbody>
            <tr data-testid={targetRowTestId} style={{ height: targetRowInitialHeight, minHeight: '0px', maxHeight: 'none' }}>
              <td>Target Row Content</td>
            </tr>
            <RowResizer {...resizerProps} />
          </tbody>
        </table>
      );
      const targetResizableRow = screen.getByTestId(targetRowTestId);
      const resizerHandleTd = view.container.querySelector('.row_resizer_handle_cell');
      if (!resizerHandleTd) {
        throw new Error("Could not find the resizer handle <td> with class '.row_resizer_handle_cell'.");
      }
      return { ...view, targetResizableRow, rowResizerHandleElement: resizerHandleTd as HTMLElement };
    };

    it('renders its own TR and a TD handle with correct default styles', () => {
      const { container } = render(<table><tbody><RowResizer /></tbody></table>);
      const handleCell = container.querySelector('td.row_resizer_handle_cell');
      expect(handleCell).toBeInTheDocument();

      if(handleCell) {
          expect(handleCell).toHaveStyle('user-select: none');
          expect(handleCell).toHaveStyle('cursor: ns-resize');
          expect(handleCell).toHaveStyle('height: 6px');
          expect(handleCell).toHaveStyle('background-color: rgba(0, 0, 0, 0.1)');
          expect(handleCell).toHaveClass('row_resizer_handle_cell');
          expect(handleCell).not.toHaveClass('disabled_row_resize_handle');
      }
    });

    it('applies disabled state to the handle TD', () => {
      const { container } = render(<table><tbody><RowResizer disabled={true} /></tbody></table>);
      const handleCell = container.querySelector('td.row_resizer_handle_cell');
      expect(handleCell).toBeInTheDocument();
      if (handleCell) {
        const handleStyle = getComputedStyle(handleCell);
        expect(handleStyle.cursor).not.toBe('ns-resize');
        expect(handleCell).toHaveClass('disabled_row_resize_handle');
      }
    });

    it('applies custom handleClassName and handleStyle to the handle TD', () => {
      const customHandleClassName = "test-custom-handle";
      const customHandleStyle = { backgroundColor: 'blue', height: '10px' };
      const { container } = render(
        <table><tbody><RowResizer handleClassName={customHandleClassName} handleStyle={customHandleStyle} /></tbody></table>
      );
      const handleCell = container.querySelector('td.row_resizer_handle_cell');
      expect(handleCell).toBeInTheDocument();
      if (handleCell) {
        expect(handleCell).toHaveClass(customHandleClassName);
        expect(handleCell).toHaveClass('row_resizer_handle_cell');
        expect(handleCell).toHaveStyle('background-color: rgb(0, 0, 255)'); // Corrected color
        expect(handleCell).toHaveStyle('height: 10px');
      }
    });

    it('applies passed className and other TR attributes to its own TR element', () => {
        const trClassName = "my-custom-rowresizer-tr";
        const trId = "my-rowresizer-tr-id";
        const { container } = render(<table><tbody><RowResizer className={trClassName} id={trId} data-foo="bar" /></tbody></table>);
        const resizerTr = container.querySelector('tbody tr:last-child');
        expect(resizerTr).toBeInTheDocument();
        if (resizerTr) {
            expect(resizerTr).toHaveClass(trClassName);
            expect(resizerTr.id).toBe(trId);
            expect(resizerTr.getAttribute('data-foo')).toBe('bar');
        }
    });

    it('applies defaultHeight to the PREVIOUS SIBLING row on initial mount', () => {
      const defaultH = 120;
      const { targetResizableRow } = renderRowResizerAndTarget({ defaultHeight: defaultH }, '50px');
      expect(targetResizableRow.style.height).toBe(`${defaultH}px`);
    });

    it('initializes PREVIOUS SIBLING row to minHeight if defaultHeight is not provided and row has no initial height', () => {
      const minH = 80;
      const { getByTestId } = renderRowResizerAndTarget({ minHeight: minH }, '', "target-row-1");
      const targetRow1 = getByTestId('target-row-1');
      expect(targetRow1.style.height).toBe(`${minH}px`);
      cleanup();
      const { getByTestId: getByTestId2 } = renderRowResizerAndTarget({ minHeight: minH }, '100px', "target-row-2");
      const targetRow2 = getByTestId2("target-row-2");
      expect(targetRow2.style.height).toBe('100px');
    });

    it('can be dragged to resize the PREVIOUS SIBLING row (mouse)', async () => {
      const initialH = 100;
      // Removed the problematic duplicated test block here
      const { targetResizableRow, rowResizerHandleElement } = renderRowResizerAndTarget({}, `${initialH}px`);
      Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
      expect(targetResizableRow.style.height).toBe(`${initialH}px`);
      const initialScreenY = 200;
      await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', initialScreenY);
      const newScreenYIncrease = initialScreenY + 50;
      await dispatchMouseEvent(document, 'mousemove', newScreenYIncrease);
      expect(targetResizableRow.style.height).toBe('150px');
      await dispatchMouseEvent(document, 'mouseup', newScreenYIncrease);
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
        const { targetResizableRow, rowResizerHandleElement } = renderRowResizerAndTarget(
            { minHeight: minH, defaultHeight: initialH }, `${initialH}px`);
        Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(targetResizableRow.style.height).toBe(`${initialH}px`);
        const startScreenY = 300;
        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', startScreenY);
        const newScreenY = startScreenY - (initialH - (minH - 30));
        await dispatchMouseEvent(document, 'mousemove', newScreenY);
        expect(targetResizableRow.style.height).toBe(`${minH}px`);
        await dispatchMouseEvent(document, 'mouseup', newScreenY);
    });

    it('respects maxHeight when dragging PREVIOUS SIBLING row (mouse)', async () => {
        const maxH = 150;
        const initialH = 100;
        const { targetResizableRow, rowResizerHandleElement } = renderRowResizerAndTarget(
            { maxHeight: maxH, defaultHeight: initialH }, `${initialH}px`);
        Object.defineProperty(targetResizableRow, 'clientHeight', { value: initialH, configurable: true, writable: true });
        expect(targetResizableRow.style.height).toBe(`${initialH}px`);
        const startScreenY = 200;
        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', startScreenY);
        const newScreenY = startScreenY + ( (maxH + 30) - initialH );
        await dispatchMouseEvent(document, 'mousemove', newScreenY);
        expect(targetResizableRow.style.height).toBe(`${maxH}px`);
        await dispatchMouseEvent(document, 'mouseup', newScreenY);
    });

    it('can be dragged to resize the PREVIOUS SIBLING row (touch)', async () => {
        const initialH = 80;
        const { targetResizableRow, rowResizerHandleElement } = renderRowResizerAndTarget({}, `${initialH}px`);
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
        const { targetResizableRow, rowResizerHandleElement } = renderRowResizerAndTarget(
            { resizeStart: mockResizeStart }, '100px');
        Object.defineProperty(targetResizableRow, 'clientHeight', { value: 100, configurable: true, writable: true });
        await dispatchMouseEvent(rowResizerHandleElement, 'mousedown', 200);
        expect(mockResizeStart).toHaveBeenCalledTimes(1);
        await dispatchMouseEvent(document, 'mouseup', 200);
    });

    it('calls resizeEnd callback with the final height when dragging ends (targeting previous sibling)', async () => {
        const mockResizeEnd = vi.fn();
        const initialH = 100;
        const dragDistance = 40;
        const finalH = initialH + dragDistance;
        const { targetResizableRow, rowResizerHandleElement } = renderRowResizerAndTarget(
            { resizeEnd: mockResizeEnd, defaultHeight: initialH }, `${initialH}px`);
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

        const { rerender, getByTestId, container } = render(
            <table>
              <tbody>
                <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                <RowResizer data-testid="row-resizer-tr-for-events" disabled={false} resizeStart={mockResizeStartForEventTest} />
              </tbody>
            </table>
        );

        let resizerHandleElement = container.querySelector('tr[data-testid="row-resizer-tr-for-events"] .row_resizer_handle_cell');
        expect(resizerHandleElement).toBeInTheDocument();

        const targetRowForEvents = getByTestId('target-row-for-event-test');
        Object.defineProperty(targetRowForEvents, 'clientHeight', { value: 100, configurable: true, writable: true });

        // 1. Start dragging (disabled=false)
        if (resizerHandleElement) await dispatchMouseEvent(resizerHandleElement, 'mousedown', 100);
        expect(mockResizeStartForEventTest).toHaveBeenCalledTimes(1);
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(4);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        // 2. Stop dragging
        await dispatchMouseEvent(document, 'mouseup', 100);
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // 3. Test disabled prop change while NOT dragging
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        act(() => {
          rerender(
            <table>
              <tbody>
                <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                <RowResizer data-testid="row-resizer-tr-for-events" disabled={true} resizeStart={mockResizeStartForEventTest} />
              </tbody>
            </table>
          );
        });
        resizerHandleElement = container.querySelector('tr[data-testid="row-resizer-tr-for-events"] .row_resizer_handle_cell'); // Re-query after rerender
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0);
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);

        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        act(() => {
          rerender(
            <table>
              <tbody>
                <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                <RowResizer data-testid="row-resizer-tr-for-events" disabled={false} resizeStart={mockResizeStartForEventTest} />
              </tbody>
            </table>
          );
        });
        resizerHandleElement = container.querySelector('tr[data-testid="row-resizer-tr-for-events"] .row_resizer_handle_cell'); // Re-query
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0);
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);

        // Clear spies for section 4
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        // 4. Start dragging, then disable component (should remove listeners)
        if (resizerHandleElement) await dispatchMouseEvent(resizerHandleElement, 'mousedown', 100);
        expect(mockResizeStartForEventTest).toHaveBeenCalledTimes(1);
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(4);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        mockResizeStartForEventTest.mockClear();

        act(() => {
            rerender(
              <table>
                <tbody>
                  <tr data-testid="target-row-for-event-test" style={{ height: '100px' }}><td>Target</td></tr>
                  <RowResizer data-testid="row-resizer-tr-for-events" disabled={true} resizeStart={mockResizeStartForEventTest} />
                </tbody>
              </table>
            );
        });
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
      });
});
