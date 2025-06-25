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
                    {/* RowResizer in its own TR, resizing the one above */}
                    <tr>
                        <RowResizer
                            id="row1-rr"
                            colSpan={5} // Span all table columns (3 headers + 2 resizers)
                            resizeEnd={(h) => setRow1Height(h)}
                            minHeight={30} // Min height for Row 1
                            maxHeight={200} // Max height for Row 1
                            defaultHeight={row1Height} // Set default height for Row 1
                        />
                    </tr>

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
                     {/* RowResizer for Row 3, with a custom class */}
                     <tr>
                        <RowResizer
                            id="row3-rr"
                            colSpan={5} // Span all table columns
                            className="custom-row-resizer-class"
                            resizeEnd={(h) => setRow3Height(h)}
                            minHeight={40}  // Min height for Row 3
                            maxHeight={250} // Max height for Row 3
                            defaultHeight={row3Height} // Set default height for Row 3
                        />
                    </tr>

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
                <li>In this demo, <code>RowResizer</code> is placed in its own <code>&lt;tr&gt;</code>.</li>
                <li>It controls the height of the <code>&lt;tr&gt;</code> element immediately *above* it.</li>
                <li>The <code>colSpan</code> prop on <code>RowResizer</code> is used to make its `&lt;td&gt;` element span the full width of the table. Adjust this based on your table's column count.</li>
                <li><code>defaultHeight</code>, <code>minHeight</code>, and <code>maxHeight</code> props on the <code>RowResizer</code> now apply to the row being resized (the one above it).</li>
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
