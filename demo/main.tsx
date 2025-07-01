import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ColumnResizer from '../src/column-resizer'; // Adjust path as needed
import RowResizer from '../src/row-resizer';     // Adjust path as needed

const App: React.FC = () => {
    const [row1Height, setRow1Height] = useState<number | undefined>(50);
    const [row3Height, setRow3Height] = useState<number | undefined>(70);

    const [col1Width, setCol1Width] = useState<number | undefined>(150);
    const [col2Width, setCol2Width] = useState<number | undefined>(200);


    return (
        <div>
            <h1>Table Resizer Demo</h1>

            <h2>Row Resizing Example</h2>
            <p>Drag the thin horizontal lines between rows to resize them.</p>
            <p>Row 1 (above resizer) current height: {row1Height !== undefined ? `${row1Height}px` : 'auto'}</p>
            <p>Row 3 (above resizer) current height: {row3Height !== undefined ? `${row3Height}px` : 'auto'}</p>

            <table>
                <thead>
                    <tr>
                        {/* Calculate total columns: 3 data headers + 2 column resizers = 5 */}
                        <th style={{ width: col1Width ? `${col1Width}px` : undefined }}>Header 1</th>
                        <ColumnResizer id="col1-cr" defaultWidth={col1Width} resizeEnd={(w) => setCol1Width(w)} />
                        <th style={{ width: col2Width ? `${col2Width}px` : undefined }}>Header 2</th>
                        <ColumnResizer id="col2-cr" defaultWidth={col2Width} resizeEnd={(w) => setCol2Width(w)} />
                        <th>Header 3 (Not Resizable)</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Row 1 to be resized */}
                    <tr style={{ height: row1Height ? `${row1Height}px` : undefined }} className="resizable-row">
                        <td>Row 1, Cell 1</td>
                        <td colSpan={2}>Row 1, Cell 2 (Spans Col2 and CR for demo)</td>
                        {/* <td /> Empty cell for CR if not spanning */}
                        <td>Row 1, Cell 3</td>
                    </tr>
                    {/* RowResizer now renders its own <tr> containing a <td> handle. */}
                    {/* It resizes the <tr> above it. */}
                    <RowResizer
                        id="row1-resizer-tr" // ID for the RowResizer's <tr>
                        // className="my-row-resizer-tr" // Optional class for the RowResizer's <tr>
                        colSpanTD={5} // colSpan for the inner <td> handle, should span all table columns
                        resizeEnd={(h) => setRow1Height(h)}
                        minHeight={30} // Min height for Row 1
                        maxHeight={200} // Max height for Row 1
                        defaultHeight={row1Height} // Set default height for Row 1
                        // handleClassName="my-custom-handle" // Optional class for the inner <td> handle
                        // handleStyle={{backgroundColor: 'lightblue'}} // Optional style for the inner <td> handle
                    />

                    {/* Row 2 - Not directly resizable by a handle below it in this example */}
                    <tr>
                        <td>Row 2, Cell 1 (Static)</td>
                        <td colSpan={2}>Row 2, Cell 2</td>
                        {/* <td /> */}
                        <td>Row 2, Cell 3</td>
                    </tr>

                    {/* Row 3 to be resized */}
                    <tr style={{ height: row3Height ? `${row3Height}px` : undefined }} className="resizable-row">
                        <td>Row 3, Cell 1</td>
                        <td colSpan={2}>Row 3, Cell 2</td>
                        {/* <td /> */}
                        <td>Row 3, Cell 3</td>
                    </tr>
                    {/* RowResizer for Row 3 */}
                    <RowResizer
                        id="row3-resizer-tr" // ID for the RowResizer's <tr>
                        colSpanTD={5} // Span all table columns for the inner <td> handle
                        handleClassName="custom-row-resizer-class" // Custom class for the inner <td> handle
                        resizeEnd={(h) => setRow3Height(h)}
                        minHeight={40}  // Min height for Row 3
                        maxHeight={250} // Max height for Row 3
                        defaultHeight={row3Height} // Set default height for Row 3
                    />

                    {/* Row 4 - Not resizable */}
                    <tr>
                        <td>Row 4, Cell 1</td>
                        <td colSpan={2}>Row 4, Cell 2</td>
                        {/* <td /> */}
                        <td>Row 4, Cell 3</td>
                    </tr>
                </tbody>
            </table>

            <h3>Notes on RowResizer Usage:</h3>
            <ul>
                <li>The <code>RowResizer</code> component now renders its own <code>&lt;tr&gt;</code> element, which internally contains a styled <code>&lt;td&gt;</code> as the draggable handle.</li>
                <li>Place <code>&lt;RowResizer /&gt;</code> directly between the table rows (<code>&lt;tr&gt;</code> elements) in your <code>&lt;tbody&gt;</code>.</li>
                <li>It controls the height of the <code>&lt;tr&gt;</code> element immediately *above* it.</li>
                <li>Use the <code>colSpanTD</code> prop on <code>RowResizer</code> to make its inner handle `&lt;td&gt;` span the full width of the table. Adjust this based on your table's column count.</li>
                <li>Props like <code>className</code> or <code>id</code> passed to <code>&lt;RowResizer /&gt;</code> apply to the outer <code>&lt;tr&gt;</code> that it renders. Use <code>handleClassName</code> or <code>handleStyle</code> to customize the inner draggable `&lt;td&gt;` handle.</li>
                <li><code>defaultHeight</code>, <code>minHeight</code>, and <code>maxHeight</code> props on the <code>RowResizer</code> apply to the row being resized (the one above it).</li>
            </ul>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Failed to find the root element');
}
