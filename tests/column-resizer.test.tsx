import React from 'react';
import { act } from 'react'; // For React 18, act can be imported from 'react'
// shallow has limitations with hooks, especially useEffect. Consider mount or React Testing Library for more robust tests.
import { shallow, mount } from 'enzyme';

// Vitest/RTL imports
import { render, screen, fireEvent } from '@testing-library/react';
// Note: setupVitest.ts handles jest-dom/extend-expect

import ColumnResizer from '../src/column-resizer'; // Assuming this path is correct and it's a .tsx file

describe('react-column-resizer', () => {
    // Helper for dispatching mouse events
    const dispatchMouseEvent = async (target: Node | Window, type: string, clientX: number) => {
      await act(async () => {
        fireEvent(
          target,
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: clientX,
            screenX: clientX, // component uses screenX
          })
        );
      });
    };

    const renderResizableTable = (props: Partial<React.ComponentProps<typeof ColumnResizer>> = {}) => {
      const view = render(
        <table>
          <thead>
            <tr>
              <td data-testid="resizable-cell" style={{ width: '100px', minWidth: '0px', maxWidth: 'none' }}>Resizable</td>
              <ColumnResizer {...props} />
            </tr>
          </thead>
        </table>
      );
      const resizableCell = screen.getByTestId('resizable-cell');
      // Ensure ColumnResizer itself is rendered, for example, by role
      const columnResizerElement = screen.getByRole('columnheader');
      return { ...view, resizableCell, columnResizerElement };
    };

    /*
    // Helper to get the <th> element; component now renders <th>
    const getTh = (wrapper) => wrapper.find('th');

    it('renders one table header cell with correct default props and styles', () => {
        const expectedStyle: React.CSSProperties = {
            userSelect: 'none',
            cursor: 'ew-resize',
            width: '6px',
            backgroundColor: "rgba(0, 0, 0, 0.1)",
        };

        const wrapper = shallow(<ColumnResizer />);
        
        // Check default props of the component itself (passed to the functional component)
        // Note: With shallow, directly checking props of the functional component is tricky if it's wrapped.
        // Here, we're checking props of the root element rendered by ColumnResizer.
        const th = getTh(wrapper);
        expect(th).toHaveLength(1);
        expect(th.children()).toHaveLength(0);

        const thProps = th.props();
        
        // Check the effect of default props on the rendered <th> element
        // Default disabled=false means:
        // - style.cursor should be 'ew-resize' (already in expectedStyle)
        // - onMouseDown and onTouchStart should be functions
        // Default minWidth=0, className="" effects are harder to directly verify here
        // without specific test cases for those default values if they influenced rendering,
        // but their absence as passed props is what we were observing with wrapper.prop().
        // The important part is that the th renders correctly with overall defaults.

        expect(thProps.style).toEqual(expectedStyle); // Use toEqual for object comparison
        expect(thProps.className).toContain("column_resizer_own_class"); // Default class from component
        expect(thProps.className).not.toContain("disabled_column_resize"); // Because disabled is false by default
        expect(typeof thProps.onMouseDown).toBe('function');
        expect(typeof thProps.onTouchStart).toBe('function');
    });

    it('can accept a custom className', () => {
        const customClassName = "test-custom-class";
        const expectedStyle = {
            userSelect: 'none' as React.CSSProperties['userSelect'], // Type assertion for userSelect
            cursor: 'ew-resize',
            // width and backgroundColor are not applied when custom className is present
        };

        const wrapper = shallow(<ColumnResizer className={customClassName} />);
        const th = getTh(wrapper);
        const thProps = th.props();

        expect(thProps.style).toEqual(expectedStyle);
        expect(thProps.className).toContain("column_resizer_own_class");
        expect(thProps.className).toContain(customClassName);
    });

    it('can be disabled', () => {
        const expectedStyle = {
            userSelect: 'none' as React.CSSProperties['userSelect'],
            // cursor is not 'ew-resize' when disabled
            width: '6px',
            backgroundColor: "rgba(0, 0, 0, 0.1)",
        };

        const wrapper = shallow(<ColumnResizer disabled={true} />);
        const th = getTh(wrapper);
        const thProps = th.props();
        
        expect(thProps.style).toEqual(expectedStyle);
        expect(thProps.className).toContain("column_resizer_own_class");
        expect(thProps.className).toContain("disabled_column_resize");
        expect(thProps.onMouseDown).toBeUndefined();
        expect(thProps.onTouchStart).toBeUndefined();
    });

    // This test is challenging with shallow rendering for functional components due to useEffect.
    // `mount` would be more appropriate here to test effects.
    it('registers and removes events on document when disabled prop changes', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        const relevantEvents = ['mousemove', 'mouseup', 'touchmove', 'touchend'];

        const getRelevantCalls = (spy: jest.SpyInstance) => 
            spy.mock.calls.filter(call => relevantEvents.includes(call[0] as string));

        // const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener'); // ALREADY DEFINED IN OUTER SCOPE (describe block)
        // const relevantEvents = ['mousemove', 'mouseup', 'touchmove', 'touchend']; // ALREADY DEFINED IN OUTER SCOPE
        // const getRelevantCalls = (spy: jest.SpyInstance) => spy.mock.calls.filter(call => relevantEvents.includes(call[0] as string)); // ALREADY DEFINED IN OUTER SCOPE

        // Mount with disabled=true initially.
        // Mounting ColumnResizer directly to use setProps correctly.
        // This will cause a console warning about <th> nesting, but it's acceptable for this test's focus.
        const wrapper = mount(<ColumnResizer disabled={true} />);
        
        // Initial: disabled=true. No relevant listeners added by the effect body.
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0);
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // Transition 1: true -> false
        act(() => {
            wrapper.setProps({ disabled: false }); // Call setProps on the root wrapper
        });
        // Cleanup for disabled=true state: removeEventListenersFromDocument called
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);
        relevantEvents.forEach(event => 
            expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function))
        );
        // Effect for disabled=false state: addEventListenersToDocument called
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(4); // This is the critical check
        relevantEvents.forEach(event => 
            expect(addEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function))
        );
        
        // Clear for next step
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // Transition 2: false -> true
        act(() => {
            wrapper.setProps({ disabled: true }); // Call setProps on the root wrapper
        });
        // Cleanup for disabled=false: removeEventListenersFromDocument called
        expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);
        // Effect for disabled=true: no relevant listeners added
        expect(getRelevantCalls(addEventListenerSpy).length).toBe(0);

        // Clear for unmount
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();
        
        act(() => {
            wrapper.unmount();
        });
    });

    it('applies maxWidth style when disabled and defaultWidth is present', () => {
        const defaultW = 100;
        const maxW = 150;
        // createResizableTable sets initial style width to 100px.
        // ColumnResizer should apply defaultWidth and also respect maxWidth when disabled.
        const wrapper = createResizableTable({ defaultWidth: defaultW, maxWidth: maxW, disabled: true });
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        // The component's useEffect for disabled state should set these styles
        expect(resizableCell.style.width).toBe(`${defaultW}px`);
        // The specific useEffect for disabled also applies maxWidth
        expect(resizableCell.style.maxWidth).toBe(`${maxW}px`);
        
        act(() => {
            wrapper.unmount();
        });
    });

    it('initializes to minWidth if defaultWidth is not provided', () => {
        const minW = 80;
        // createResizableTable sets initial style width to 100px.
        // ColumnResizer with minWidth and no defaultWidth should override it to minWidth.
        const wrapper = createResizableTable({ minWidth: minW });
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        // The component's useEffect should set the width to minWidth
        expect(resizableCell.style.width).toBe(`${minW}px`);
        expect(resizableCell.style.minWidth).toBe(`${minW}px`);
        expect(resizableCell.style.maxWidth).toBe(`${minW}px`);
        
        act(() => {
            wrapper.unmount();
        });
    });

    it('calls resizeEnd callback with the final width when dragging ends', () => {
        const mockResizeEnd = jest.fn();
        const initialWidth = 100;
        const dragDistance = 30;
        const finalWidth = initialWidth + dragDistance;

        const wrapper = createResizableTable({ resizeEnd: mockResizeEnd, defaultWidth: initialWidth });
        const resizerElement = wrapper.find(ColumnResizer).find('th').getDOMNode();
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;
        Object.defineProperty(resizableCell, 'clientWidth', { value: initialWidth, configurable: true });

        const startX = 200;
        dispatchMouseEvent(resizerElement, 'mousedown', startX);
        dispatchMouseEvent(document, 'mousemove', startX + dragDistance);
        dispatchMouseEvent(document, 'mouseup', startX + dragDistance);

        expect(mockResizeEnd).toHaveBeenCalledTimes(1);
        expect(mockResizeEnd).toHaveBeenCalledWith(finalWidth);
        
        act(() => {
            wrapper.unmount();
        });
    });

    it('renders rowSpan and colSpan attributes on the th element', () => {
        const rowSpanVal = 2;
        const colSpanVal = 3;
        const wrapper = shallow(<ColumnResizer rowSpan={rowSpanVal} colSpan={colSpanVal} />);
        const th = getTh(wrapper);

        expect(th.prop('rowSpan')).toBe(rowSpanVal);
        expect(th.prop('colSpan')).toBe(colSpanVal);
    });

    it('applies defaultWidth to the previous sibling on initial mount', () => {
        const defaultW = 120;
        // createResizableTable sets initial width to 100px, ColumnResizer should override it.
        const wrapper = createResizableTable({ defaultWidth: defaultW });
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        // The component's useEffect should set the width to defaultWidth
        expect(resizableCell.style.width).toBe(`${defaultW}px`);
        // It also sets minWidth and maxWidth to defaultWidth in the current component implementation's useEffect
        expect(resizableCell.style.minWidth).toBe(`${defaultW}px`);
        expect(resizableCell.style.maxWidth).toBe(`${defaultW}px`);
        
        act(() => {
            wrapper.unmount();
        });
    });

    // The following tests ('can be dragged', 'can have a min width', 'supports touch events')
    // are extremely difficult to adapt with `shallow` for functional components because they
    // relied on internal instance variables and methods.
    // A full rewrite using React Testing Library or `mount` with careful event simulation
    // would be necessary for proper testing of these interaction-heavy features.
    // For now, these will be placeholder/skipped or simplified.

    // Helper function to dispatch events
    const dispatchMouseEvent = (target: EventTarget, type: string, clientX: number) => {
        const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: clientX, screenX: clientX });
        // Wrapping event dispatches in act is crucial for tests involving state updates
        act(() => {
            target.dispatchEvent(event);
        });
    };

    const dispatchTouchEvent = (target: EventTarget, type: string, clientX: number) => {
        const event = new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: [{ clientX: clientX, screenX: clientX, pageX: clientX, pageY: 0, identifier: 0, target: target } as TouchInit],
            changedTouches: [{ clientX: clientX, screenX: clientX, pageX: clientX, pageY: 0, identifier: 0, target: target } as TouchInit]
        });
        act(() => {
            target.dispatchEvent(event);
        });
    };
    
    const createResizableTable = (props = {}) => {
        // JSDOM doesn't do real layout, so previousSibling.clientWidth will be 0 unless styled.
        // We'll set an initial width on the cell to be resized.
        return mount(
            <table>
                <thead>
                    <tr>
                        <td id="resizableCell" style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>Resizable</td>
                        <ColumnResizer {...props} />
                    </tr>
                </thead>
            </table>
        );
    };


    it('can be dragged to resize the previous sibling', () => {
        const wrapper = createResizableTable();
        const resizerElement = wrapper.find(ColumnResizer).find('th').getDOMNode();
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        // Initial width is 100px as per style
        Object.defineProperty(resizableCell, 'clientWidth', { value: 100, configurable: true });
        expect(resizableCell.style.width).toBe('100px');
        
        const initialScreenX = 200; // Arbitrary start position
        // act is already in dispatchMouseEvent
        dispatchMouseEvent(resizerElement, 'mousedown', initialScreenX);
        
        // Drag 50px to the right (increase width)
        const newScreenX = initialScreenX + 50;
        dispatchMouseEvent(document, 'mousemove', newScreenX); // This also needs act, handled by helper
        
        // Width should be 100 (initial) + 50 (drag) = 150px
        // The logic is: newWidth = startWidthPrev - (startPos - currentMouseX)
        // startWidthPrev = 100 (from clientWidth, which we are controlling via style for testing)
        // startPos = initialScreenX = 200
        // currentMouseX = newScreenX = 250
        // newWidth = 100 - (200 - 250) = 100 - (-50) = 150
        expect(resizableCell.style.width).toBe('150px');
        expect(resizableCell.style.minWidth).toBe('150px');
        expect(resizableCell.style.maxWidth).toBe('150px');
        
        dispatchMouseEvent(document, 'mouseup', newScreenX); // Handled by helper
        act(() => {
          wrapper.unmount();
        });
    });

    it('respects minWidth when dragging', () => {
        const minW = 50;
        // Pass defaultWidth to ensure the component doesn't override initial cell width to minWidth immediately
        const wrapper = createResizableTable({ minWidth: minW, defaultWidth: 100 }); 
        const resizerElement = wrapper.find(ColumnResizer).find('th').getDOMNode();
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        // Mock clientWidth for the component to read
        Object.defineProperty(resizableCell, 'clientWidth', { value: 100, configurable: true });
        // Initial width set by createResizableTable's style is 100px.
        // The component's useEffect for defaultWidth should maintain this.
        expect(resizableCell.style.width).toBe('100px'); 

        const initialScreenX = 300; // Arbitrary start
        dispatchMouseEvent(resizerElement, 'mousedown', initialScreenX);

        // Attempt to drag 80px to the left (decrease width)
        // Initial width 100px. Drag left by 80px. Target width 20px.
        // newWidth = 100 - (300 - 220) = 100 - 80 = 20px
        // But minWidth is 50px.
        const newScreenX = initialScreenX - 80;
        dispatchMouseEvent(document, 'mousemove', newScreenX);
        
        expect(resizableCell.style.width).toBe(`${minW}px`);
        expect(resizableCell.style.minWidth).toBe(`${minW}px`);
        expect(resizableCell.style.maxWidth).toBe(`${minW}px`);

        dispatchMouseEvent(document, 'mouseup', newScreenX);
        act(() => {
            wrapper.unmount();
        });
    });

    it('supports touch events for dragging', () => {
        const wrapper = createResizableTable();
        const resizerElement = wrapper.find(ColumnResizer).find('th').getDOMNode();
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        Object.defineProperty(resizableCell, 'clientWidth', { value: 100, configurable: true });
        expect(resizableCell.style.width).toBe('100px');

        const initialScreenX = 100;
        dispatchTouchEvent(resizerElement, 'touchstart', initialScreenX);

        // Drag 30px to the right (increase width)
        // newWidth = 100 - (100 - 130) = 100 - (-30) = 130
        const newScreenX = initialScreenX + 30;
        dispatchTouchEvent(document, 'touchmove', newScreenX);
        
        expect(resizableCell.style.width).toBe('130px');
        expect(resizableCell.style.minWidth).toBe('130px');
        expect(resizableCell.style.maxWidth).toBe('130px');

        dispatchTouchEvent(document, 'touchend', newScreenX);
        act(() => {
            wrapper.unmount();
        });
    });

    it('respects maxWidth when dragging', () => {
        const maxW = 150;
        // Initial width 100px, try to drag to 200px, but should be clamped at 150px.
        const wrapper = createResizableTable({ maxWidth: maxW, defaultWidth: 100 });
        const resizerElement = wrapper.find(ColumnResizer).find('th').getDOMNode();
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;

        // Mock clientWidth for the component to read
        Object.defineProperty(resizableCell, 'clientWidth', { value: 100, configurable: true });
        // Initial width set by createResizableTable's style (via defaultWidth prop) should be 100px.
        expect(resizableCell.style.width).toBe('100px');

        const initialScreenX = 200; // Arbitrary start
        dispatchMouseEvent(resizerElement, 'mousedown', initialScreenX);

        // Attempt to drag 100px to the right (increase width)
        // Initial width 100px. Drag right by 100px. Target width 200px.
        // newWidth = 100 - (200 - 300) = 100 - (-100) = 200px
        // But maxWidth is 150px.
        const newScreenX = initialScreenX + 100;
        dispatchMouseEvent(document, 'mousemove', newScreenX);
        
        expect(resizableCell.style.width).toBe(`${maxW}px`);
        expect(resizableCell.style.minWidth).toBe(`${maxW}px`); // Component syncs these
        expect(resizableCell.style.maxWidth).toBe(`${maxW}px`);

        dispatchMouseEvent(document, 'mouseup', newScreenX);
        act(() => {
            wrapper.unmount();
        });
    });

    it('calls resizeStart callback when dragging starts', () => {
        const mockResizeStart = jest.fn();
        const wrapper = createResizableTable({ resizeStart: mockResizeStart });
        const resizerElement = wrapper.find(ColumnResizer).find('th').getDOMNode();

        // Mock clientWidth for the component to read, so startDrag can complete
        const resizableCell = wrapper.find('#resizableCell').getDOMNode() as HTMLElement;
        Object.defineProperty(resizableCell, 'clientWidth', { value: 100, configurable: true });

        const initialScreenX = 200;
        dispatchMouseEvent(resizerElement, 'mousedown', initialScreenX);

        expect(mockResizeStart).toHaveBeenCalledTimes(1);

        // End drag to clean up listeners
        dispatchMouseEvent(document, 'mouseup', initialScreenX);
        act(() => {
            wrapper.unmount();
        });
    });
    */

    it('renders one table header cell with correct default props and styles (Vitest/RTL)', () => {
      render(
        <table>
          <thead>
            <tr>
              <td>Previous Column</td>
              <ColumnResizer />
            </tr>
          </thead>
        </table>
      );

      const resizerElement = screen.getByRole('columnheader');

      expect(resizerElement).toBeInTheDocument();
      expect(resizerElement).toHaveStyle('user-select: none');
      expect(resizerElement).toHaveStyle('cursor: ew-resize');
      expect(resizerElement).toHaveStyle('width: 6px');
      expect(resizerElement).toHaveStyle('background-color: rgba(0, 0, 0, 0.1)');

      expect(resizerElement).toHaveClass('column_resizer_own_class');
      expect(resizerElement).not.toHaveClass('disabled_column_resize');
    });

    it('can be disabled (Vitest/RTL)', () => {
      render(
        <table>
          <thead>
            <tr>
              <td>Previous Column</td>
              <ColumnResizer disabled={true} />
            </tr>
          </thead>
        </table>
      );

      const resizerElement = screen.getByRole('columnheader');

      expect(resizerElement).toBeInTheDocument();
      // Check style changes for disabled state
      expect(resizerElement).toHaveStyle('user-select: none');

      // Check that cursor is not 'ew-resize' when disabled
      const currentCursorStyle = getComputedStyle(resizerElement).cursor;
      expect(currentCursorStyle).not.toBe('ew-resize');

      // Default styles should still apply if no custom className is given
      expect(resizerElement).toHaveStyle('width: 6px');
      expect(resizerElement).toHaveStyle('background-color: rgba(0, 0, 0, 0.1)');

      // Check class changes for disabled state
      expect(resizerElement).toHaveClass('column_resizer_own_class');
      expect(resizerElement).toHaveClass('disabled_column_resize');
    });

    it('can accept a custom className (Vitest/RTL)', () => {
      const customClassName = "test-custom-class";
      render(
        <table>
          <thead>
            <tr>
              <td>Previous Column</td>
              <ColumnResizer className={customClassName} />
            </tr>
          </thead>
        </table>
      );

      const resizerElement = screen.getByRole('columnheader');
      expect(resizerElement).toBeInTheDocument();

      // Check that custom class is applied
      expect(resizerElement).toHaveClass('column_resizer_own_class'); // Default base class
      expect(resizerElement).toHaveClass(customClassName);

      // Check that default width/backgroundColor are NOT applied when custom className is present
      expect(resizerElement.style.width).toBeFalsy();
      expect(resizerElement.style.backgroundColor).toBeFalsy();

      // Default userSelect and cursor should still apply from the base style object in the component
      expect(resizerElement).toHaveStyle('user-select: none');
      expect(resizerElement).toHaveStyle('cursor: ew-resize');
    });

    it('registers and removes events on document when disabled prop changes (Vitest/RTL)', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const relevantEvents = ['mousemove', 'mouseup', 'touchmove', 'touchend'];

      // Helper to filter for relevant event listener calls
      const getRelevantCalls = (spy: ReturnType<typeof vi.spyOn>) =>
        spy.mock.calls.filter(call => relevantEvents.includes(call[0] as string));

      // Initial render with disabled={true}
      const { rerender } = render(
        <table><thead><tr><td>Prev Col</td><ColumnResizer disabled={true} /></tr></thead></table>
      );

      // Initial state (disabled=true): No relevant listeners should be added by the component.
      // Note: Spies are cleared after this check to ignore listeners potentially added by JSDOM setup or other sources.
      expect(getRelevantCalls(addEventListenerSpy)).toHaveLength(0);
      addEventListenerSpy.mockClear();
      removeEventListenerSpy.mockClear();

      // Transition 1: disabled changes from true to false
      act(() => {
        rerender(
          <table><thead><tr><td>Prev Col</td><ColumnResizer disabled={false} /></tr></thead></table>
        );
      });

      // Listeners should be added when disabled becomes false.
      // The cleanup from the initial disabled=true render runs `removeEventListenersFromDocument`.
      expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);
      // Then the effect for disabled=false runs `addEventListenersToDocument`.
      expect(getRelevantCalls(addEventListenerSpy).length).toBe(4);
      relevantEvents.forEach(event =>
        expect(addEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function))
      );

      // Clear spies for the next transition
      addEventListenerSpy.mockClear();
      removeEventListenerSpy.mockClear();

      // Transition 2: disabled changes from false to true
      act(() => {
        rerender(
          <table><thead><tr><td>Prev Col</td><ColumnResizer disabled={true} /></tr></thead></table>
        );
      });

      // Listeners should be removed when disabled becomes true (cleanup from the false state).
      expect(getRelevantCalls(removeEventListenerSpy).length).toBe(4);
      relevantEvents.forEach(event =>
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function))
      );
      // No new relevant listeners should be added when it becomes disabled.
      expect(getRelevantCalls(addEventListenerSpy).length).toBe(0);

      // Restore spies to their original state
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('applies defaultWidth to the previous sibling on initial mount (Vitest/RTL)', () => {
      const defaultW = 120;
      const { resizableCell } = renderResizableTable({ defaultWidth: defaultW });

      expect(resizableCell.style.width).toBe(`${defaultW}px`);
      expect(resizableCell.style.minWidth).toBe(`${defaultW}px`);
      expect(resizableCell.style.maxWidth).toBe(`${defaultW}px`);
      expect(resizableCell.style.getPropertyValue('--column_resize_before_width')).toBe(`${defaultW}px`);
    });

    it('initializes to minWidth if defaultWidth is not provided (Vitest/RTL)', () => {
      const minW = 80;
      // The helper initially styles resizable-cell with 100px width.
      // The component should override this to minW.
      const { resizableCell } = renderResizableTable({ minWidth: minW });

      expect(resizableCell.style.width).toBe(`${minW}px`);
      expect(resizableCell.style.minWidth).toBe(`${minW}px`);
      expect(resizableCell.style.maxWidth).toBe(`${minW}px`);
      expect(resizableCell.style.getPropertyValue('--column_resize_before_width')).toBe(`${minW}px`);
    });

    it('applies maxWidth style when disabled and defaultWidth is present (Vitest/RTL)', () => {
      const defaultW = 100;
      const maxW = 150;
      const { resizableCell } = renderResizableTable({ defaultWidth: defaultW, maxWidth: maxW, disabled: true });

      expect(resizableCell.style.width).toBe(`${defaultW}px`);
      expect(resizableCell.style.maxWidth).toBe(`${maxW}px`);
      expect(resizableCell.style.minWidth).toBe(`${defaultW}px`); // Due to defaultWidth
      expect(resizableCell.style.getPropertyValue('--column_resize_before_width')).toBe(`${defaultW}px`);
    });

    it('can be dragged to resize the previous sibling (Vitest/RTL)', async () => {
      const { resizableCell, columnResizerElement } = renderResizableTable();

      // Initial width is 100px from the renderResizableTable helper's style
      Object.defineProperty(resizableCell, 'clientWidth', { value: 100, configurable: true, writable: true });
      expect(resizableCell.style.width).toBe('100px');

      const initialScreenX = 200;
      await dispatchMouseEvent(columnResizerElement, 'mousedown', initialScreenX);

      // Drag 50px to the right (increase width)
      // Component logic: newWidth = startWidthPrev - (startPos - currentMouseX)
      // startWidthPrev = 100 (mocked clientWidth)
      // startPos = initialScreenX = 200
      // currentMouseX (e.screenX in component) = 250
      // newWidth = 100 - (200 - 250) = 100 - (-50) = 150
      const newScreenXIncrease = initialScreenX + 50;
      await dispatchMouseEvent(document, 'mousemove', newScreenXIncrease);

      expect(resizableCell.style.width).toBe('150px');
      expect(resizableCell.style.minWidth).toBe('150px');
      expect(resizableCell.style.maxWidth).toBe('150px');
      expect(resizableCell.style.getPropertyValue('--column_resize_before_width')).toBe('150px');

      await dispatchMouseEvent(document, 'mouseup', newScreenXIncrease);

      // Drag 20px to the left (decrease width from 150)
      // startWidthPrev will be 150 (the new width)
      // startPos = newScreenXIncrease = 250
      // currentMouseX = 230
      // newWidth = 150 - (250 - 230) = 150 - 20 = 130
      Object.defineProperty(resizableCell, 'clientWidth', { value: 150, configurable: true, writable: true }); // Update mock for next drag sequence
      await dispatchMouseEvent(columnResizerElement, 'mousedown', newScreenXIncrease); // Mousedown at current position

      const newScreenXDecrease = newScreenXIncrease - 20;
      await dispatchMouseEvent(document, 'mousemove', newScreenXDecrease);

      expect(resizableCell.style.width).toBe('130px');
      expect(resizableCell.style.minWidth).toBe('130px');
      expect(resizableCell.style.maxWidth).toBe('130px');
      expect(resizableCell.style.getPropertyValue('--column_resize_before_width')).toBe('130px');

      await dispatchMouseEvent(document, 'mouseup', newScreenXDecrease);
    });

    it('respects minWidth when dragging (Vitest/RTL)', async () => {
      const minW = 50;
      const initialW = 100;
      const { resizableCell, columnResizerElement } = renderResizableTable({ minWidth: minW, defaultWidth: initialW });

      Object.defineProperty(resizableCell, 'clientWidth', { value: initialW, configurable: true, writable: true });
      // Expect initial width to be set by defaultWidth prop via useEffect
      expect(resizableCell.style.width).toBe(`${initialW}px`);

      const startScreenX = 300;
      await dispatchMouseEvent(columnResizerElement, 'mousedown', startScreenX);

      // Attempt to drag to a width smaller than minWidth
      // newWidth = initialW - (startScreenX - newScreenX)
      // e.g., drag left by 80px: newScreenX = startScreenX - 80
      // newWidth = 100 - (300 - 220) = 100 - 80 = 20px.
      // Should be clamped to minW (50px).
      const newScreenX = startScreenX - (initialW - (minW - 30)); // Drag further than minWidth
      await dispatchMouseEvent(document, 'mousemove', newScreenX);

      expect(resizableCell.style.width).toBe(`${minW}px`);
      expect(resizableCell.style.minWidth).toBe(`${minW}px`);
      expect(resizableCell.style.maxWidth).toBe(`${minW}px`);
      expect(resizableCell.style.getPropertyValue('--column_resize_before_width')).toBe(`${minW}px`);

      await dispatchMouseEvent(document, 'mouseup', newScreenX);
    });
})