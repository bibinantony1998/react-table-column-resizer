"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
//Author: Bibin Antony, Nik M
//https://github.com/bibinantony1998/react-table-column-resizer

const ColumnResizer = _ref => {
  let {
    disabled = false,
    minWidth = 0,
    maxWidth,
    className = "",
    id,
    resizeStart,
    resizeEnd,
    defaultWidth,
    rowSpan = 1,
    colSpan = 1
  } = _ref;
  const [dragging, setDragging] = (0, _react.useState)(false);
  // mouseX is captured by onMouseMove and used for calculating movement during drag
  // It's not strictly needed as a state for startDrag's initial position
  // const [mouseX, setMouseX] = useState(0);
  const [startPos, setStartPos] = (0, _react.useState)(0);
  const [startWidthPrev, setStartWidthPrev] = (0, _react.useState)(0);
  const [lastDraggedWidth, setLastDraggedWidth] = (0, _react.useState)(0);
  const [draggedCol, setDraggedCol] = (0, _react.useState)(null);
  const resizeRef = (0, _react.useRef)(null);
  const startDrag = (0, _react.useCallback)(initialMouseX => {
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
      const prevSibling = resizeRef.current.previousSibling;
      if (prevSibling) {
        setStartWidthPrev(prevSibling.clientWidth);
      }
    }
  }, [disabled, id, resizeStart]);
  const endDrag = (0, _react.useCallback)(() => {
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
  const onMouseMove = (0, _react.useCallback)(e => {
    if (disabled) {
      return;
    }
    const currentMouseX = e instanceof TouchEvent ? e.touches[0].screenX : e.screenX;
    // setMouseX(currentMouseX); // mouseX state is not strictly needed for onMouseMove's core logic

    if (!dragging) {
      return;
    }
    const ele = resizeRef.current;
    if (!ele || !ele.previousSibling) return;
    const prevSibling = ele.previousSibling;
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
  (0, _react.useEffect)(() => {
    const ele = resizeRef.current;
    if (ele && ele.previousSibling) {
      const prevSibling = ele.previousSibling;
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

  (0, _react.useEffect)(() => {
    const ele = resizeRef.current;
    if (disabled && ele && ele.previousSibling) {
      const prevSibling = ele.previousSibling;
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

  const addEventListenersToDocument = (0, _react.useCallback)(() => {
    // console.log('TEST_DEBUG: addEventListenersToDocument called');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener("touchmove", onMouseMove); // Cast needed for TouchEvent
    document.addEventListener("touchend", endDrag); // Cast needed for TouchEvent
  }, [onMouseMove, endDrag]); // onMouseMove and endDrag are already memoized

  const removeEventListenersFromDocument = (0, _react.useCallback)(() => {
    // console.log('TEST_DEBUG: removeEventListenersFromDocument called');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener("touchmove", onMouseMove);
    document.removeEventListener("touchend", endDrag);
  }, [onMouseMove, endDrag]); // onMouseMove and endDrag are already memoized

  (0, _react.useEffect)(() => {
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
  const style = {
    userSelect: "none"
  };
  if (!disabled) {
    style.cursor = 'ew-resize';
  }
  if (className === "") {
    style.width = '6px';
    style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  }
  return /*#__PURE__*/_react.default.createElement("th", {
    ref: resizeRef,
    style: style
    // disabled={disabled} // th cannot have disabled attribute
    ,
    rowSpan: rowSpan,
    colSpan: colSpan,
    className: "column_resizer_own_class ".concat(disabled ? "disabled_column_resize" : "", " ").concat(className),
    onMouseDown: !disabled ? e => startDrag(e.screenX) : undefined,
    onTouchStart: !disabled ? e => startDrag(e.touches[0].screenX) : undefined
  });
};
var _default = exports.default = ColumnResizer;