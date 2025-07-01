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

The `RowResizer` component itself renders as a `<tr>` element, which internally contains a single `<td>` that acts as the draggable handle. It is designed to be placed directly within a `<tbody>`, `<thead>`, or `<tfoot>`, between the rows you wish to separate with a resizable handle. Dragging this handle will adjust the height of the `<tr>` element immediately **preceding** the `RowResizer`'s `<tr>`. It works with both touch and mouse events.

### Usage:

`npm install react-table-column-resizer` (This package now includes both `ColumnResizer` and `RowResizer`)

```jsx
import React, { useState } from "react";
import { render } from "react-dom";
// Assuming RowResizer is exported from the same package
import { ColumnResizer, RowResizer } from "react-table-column-resizer";

const App = () => {
  const [dataRowHeight, setDataRowHeight] = useState(50); // Initial height for the data row

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          {/* This is the row that will be resized */}
          <tr style={{ height: `${dataRowHeight}px` }}>
            <td>Data Cell 1A</td>
            <td>Data Cell 1B</td>
          </tr>
          {/* RowResizer renders its own <tr>, controlling the height of the <tr> above. */}
          {/* Pass standard <tr> attributes like className or id directly to RowResizer. */}
          <RowResizer
            className="my-custom-resizer-row" // Optional: class for the RowResizer's <tr>
            colSpanTD={2} // colSpan for the inner <td> handle, should span all table columns
            minHeight={30} // Minimum height for the data row above
            maxHeight={200} // Maximum height for the data row above
            defaultHeight={dataRowHeight} // Initial/default height for the data row above
            onResizeEnd={(newHeight) => setDataRowHeight(newHeight)}
            // handleClassName="my-custom-handle" // Optional: class for the inner <td> handle
            // handleStyle={{ backgroundColor: 'grey' }} // Optional: style for the inner <td> handle
          />
          <tr>
            <td>Another Data Cell 2A</td>
            <td>Another Data Cell 2B</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

render(<App />, document.body);
```

### Props for RowResizer

| Prop Name        | Type                          | Default Value | Description                                                                 |
|------------------|-------------------------------|---------------|-----------------------------------------------------------------------------|
| id               | string                        |               | `id` attribute for the main `<tr>` element rendered by `RowResizer`. Inherited from `React.TrHTMLAttributes`. |
| className        | string                        |               | `class` attribute for the main `<tr>` element rendered by `RowResizer`. Inherited from `React.TrHTMLAttributes`. |
| disabled         | boolean                       | `false`       | Disables the drag functionality of the resizer handle.                      |
| minHeight        | number                        | `0`           | Minimum height for the **targeted row (previous sibling)** (in pixels).   |
| maxHeight        | number                        | `undefined`   | Maximum height for the **targeted row (previous sibling)** (in pixels).   |
| defaultHeight    | number                        | `undefined`   | Default height for the **targeted row (previous sibling)** (in pixels).     |
| resizeStart      | `() => void`                  | `undefined`   | Callback triggered when row resize starts.                                  |
| resizeEnd        | `(h: number) => void`         | `undefined`   | Callback triggered when row resize ends, returning the new height of the **targeted row**. |
| colSpanTD        | number                        | `100` (large default) | `colSpan` for the inner `<td>` handle element. Should span table columns. |
| handleClassName  | string                        | `""`          | Custom CSS class for the inner `<td>` handle. If set, default visual styles (height, background) for the handle might not be applied unless merged. |
| handleStyle      | `React.CSSProperties`         | `{}`          | Custom inline styles for the inner `<td>` handle. Merges with default handle styles. |
| ...rest          | `React.TrHTMLAttributes`      |               | Any other standard `<tr>` attributes are applied to the main `<tr>` element. |

### Notes on RowResizer:
- The `RowResizer` component renders its own `<tr>` element, containing an inner `<td>` that serves as the draggable handle.
- Place `<RowResizer />` directly between the existing `<tr>` elements within your table's `<tbody>`, `<thead>`, or `<tfoot>`.
- Use the `colSpanTD` prop to make the inner handle `<td>` span all columns of your table, creating a full-width resize handle.
- Default styling makes the inner handle `<td>` a thin horizontal bar. Customize its appearance using `handleClassName` and/or `handleStyle` props.
- Attributes like `className`, `id`, `data-*`, etc., passed to `<RowResizer />` will be applied to the main `<tr>` element it renders.
- Ensure the targeted `<tr>` (the one above the `RowResizer`'s row) can have its height dynamically styled.
