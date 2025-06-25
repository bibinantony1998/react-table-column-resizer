## React Table Column Resizer 
A simple column resizer component for Html 5 Table

Inspired from  React Column Resizer, Fixed width and drag problems

Place in between `td` tags to add resizing functionality and add "column_resize_table" to the table. Works with touch and mouse events. 

Note: Don't add any min-width through css for table columns other than resize component

For react version 16 use version 1.0.2


Demo: https://codesandbox.io/s/react-table-column-resizer-3yuqv

### What Is New!:
* Internal architecture modernized and tested with React 19, maintaining compatibility for React >=18.
Now our component will support rowSpan and colSpan on the resize cell, using this we can enable resizing on complex tables with multi level header 
Now the base package is updated to support vite and latest ESM builds

--bug fix -
All props type made as optional, the type error from missing props values are removed

### Usage: 

`npm install react-table-column-resizer`

Add 
`column_resize_table`
class to the table

Add css 

`.column_resize_table th::before {content: ''; display: block; width: var(--column_resize_before_width);}`

to css files

<sup>* Requires `react` as a peer dependency: `npm install react`</sup>


```
import React from "react";
import { render } from "react-dom";
import ColumnResizer from "react-table-column-resizer";

const App = () => (
  <div>
    <table class="column_resize_table">
      <thead>
        <tr>
          <th>1</th>
          <ColumnResizer className="columnResizer" minWidth={0} />
          <th>2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>3</td>
          <td />
          <td>4</td>
        </tr>
      </tbody>
    </table>
  </div>
);

render(<App />, document.body);
```

### Props

| Prop Name  | Type | Default Value | Description |
| ------------- | ------------- | ------------- | ------------- |
| id (optional) | string |  | Uniq id for each column resize  |
| disabled | bool | `false` | Set to true if you want to disable resizing |
| minWidth (optional) | number | `undefined` | The minimum width for the columns (in pixels) |
| maxWidth (optional) | number | null, `undefined` | The maximum width for the columns (in pixels) |
| defaultWidth (optional) | number | null, `undefined` | The default width for the columns (in pixels) |
| resizeStart (optional) | function | function(): void | Trigger when resize start |
| resizeEnd (optional) | function | function(): number | Trigger when resize end and return the last dragged column width |
| className | string | `""` | Any custom classes. If set, default `width` and `backgroundColor` styles will not be applied |
| rowSpan | number | 1 | Row span for table resize cell |
| colSpan | number | 1 | Col span for table resize cell |


### Limitations
- You have to put filler `<td/>`'s in rows
- The width in table column need to be in logic of table css, it must leave a column without max-width

---

## React Table Row Resizer

A simple row resizer component for HTML 5 Tables. It allows you to dynamically adjust the height of table rows.

Place the `RowResizer` component as a `<td>` within the `<tr>` element that you want to make resizable. Dragging the `RowResizer` handle will adjust the height of its parent row. Works with touch and mouse events.

### Usage:

`npm install react-table-column-resizer` (This package will now include both resizers)

```jsx
import React, { useState } from "react";
import { render } from "react-dom";
// Assuming RowResizer is exported from the same package
import { ColumnResizer, RowResizer } from "react-table-column-resizer";

const App = () => {
  const [row1Height, setRow1Height] = useState(50);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
            <th style={{width: '30px' /* Width for Handle Column */}}>H</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: `${row1Height}px` }}>
            <td>Row 1 Data 1</td>
            <td>Row 1 Data 2</td>
            {/* RowResizer is a td, controlling its parent tr's height */}
            <RowResizer
              id="row1-resizer"
              minHeight={30}
              maxHeight={200}
              onResizeEnd={(newHeight) => setRow1Height(newHeight)}
            />
          </tr>
          <tr>
            <td>Row 2 Data 1</td>
            <td>Row 2 Data 2</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

render(<App />, document.body);
```

### Props for RowResizer

| Prop Name      | Type                | Default Value | Description                                                                 |
|----------------|---------------------|---------------|-----------------------------------------------------------------------------|
| id (optional)  | string \| number    |               | Unique ID for the RowResizer instance.                                      |
| disabled       | boolean             | `false`       | Set to true to disable resizing for this row.                               |
| minHeight      | number              | `0`           | The minimum height for the row (in pixels).                                 |
| maxHeight      | number              | `undefined`   | The maximum height for the row (in pixels).                                 |
| defaultHeight  | number              | `undefined`   | The default height for the row (in pixels), applied on mount.               |
| resizeStart    | `() => void`        | `undefined`   | Callback triggered when row resize starts.                                  |
| resizeEnd      | `(h: number) => void` | `undefined`   | Callback triggered when row resize ends, returning the new row height.        |
| className      | string              | `""`          | Custom CSS classes for the `<td>` resizer. If set, default visual styles (like `height`, `backgroundColor`) will not be applied. |
| colSpan        | number              | `undefined`   | `colSpan` attribute for the `<td>` resizer element.                         |

### Notes on RowResizer:
- The `RowResizer` component renders as a `<td>`. It should be placed as a cell within the `<tr>` you intend to resize.
- Default styling makes it a thin, full-width (of its cell) horizontal bar. You can customize its appearance using the `className` prop.
- Ensure the parent `<tr>` can have its height styled (e.g., it's not overly constrained by CSS or fixed-height content within its cells).
