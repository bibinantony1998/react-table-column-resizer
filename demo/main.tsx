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
            <p>Row 1 current height: {row1Height !== undefined ? `${row1Height}px` : 'auto'}</p>
            <p>Row 3 current height: {row3Height !== undefined ? `${row3Height}px` : 'auto'}</p>

            <table>
                <thead>
                    <tr>
                        <th style={{ width: col1Width ? `${col1Width}px` : undefined }}>Header 1</th>
                        <ColumnResizer id="col1-cr" defaultWidth={col1Width} resizeEnd={(w) => setCol1Width(w)} />
                        <th style={{ width: col2Width ? `${col2Width}px` : undefined }}>Header 2</th>
                        <ColumnResizer id="col2-cr" defaultWidth={col2Width} resizeEnd={(w) => setCol2Width(w)} />
                        <th>Header 3 (Not Resizable)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ height: row1Height ? `${row1Height}px` : undefined }} className="resizable-row">
                        <td>Row 1, Cell 1</td>
                        <td colSpan={2}>Row 1, Cell 2 (Spans Col2 and CR)</td>
                        <td>Row 1, Cell 3</td>
                    </tr>
                    {/* RowResizer as a separate row acting as a handle */}
                    <tr>
                        <RowResizer
                            id="row1-rr"
                            colSpan={5} /* Span all columns including resizer columns */
                            resizeEnd={(h) => setRow1Height(h)}
                            minHeight={30}
                            maxHeight={200}
                            // No defaultHeight prop here, relies on previous TR's height or CSS
                        />
                    </tr>
                    <tr>
                        <td>Row 2, Cell 1 (Not directly resizable)</td>
                        <td colSpan={2}>Row 2, Cell 2</td>
                        <td>Row 2, Cell 3</td>
                    </tr>
                    <tr style={{ height: row3Height ? `${row3Height}px` : undefined }} className="resizable-row">
                        <td>Row 3, Cell 1</td>
                        <td colSpan={2}>Row 3, Cell 2</td>
                        <td>Row 3, Cell 3</td>
                    </tr>
                     {/* RowResizer with a custom class */}
                     <tr>
                        <RowResizer
                            id="row3-rr"
                            colSpan={5}
                            className="custom-row-resizer-class"
                            resizeEnd={(h) => setRow3Height(h)}
                            minHeight={40}
                            maxHeight={250}
                        />
                    </tr>
                    <tr>
                        <td>Row 4, Cell 1</td>
                        <td colSpan={2}>Row 4, Cell 2</td>
                        <td>Row 4, Cell 3</td>
                    </tr>
                </tbody>
            </table>

            <h3>Notes on RowResizer Usage:</h3>
            <ul>
                <li>In this demo, <code>RowResizer</code> is placed in its own <code>&lt;tr&gt;</code>.</li>
                <li>The <code>RowResizer</code> then controls the height of the <code>&lt;tr&gt;</code> *above* it. This is because <code>resizeRef.current.closest('tr')</code> gets the resizer's own row, and then we'd need to target <code>previousElementSibling</code>. The current implementation targets its own row.</li>
                <li><strong>Correction:</strong> The current <code>RowResizer</code> implementation targets <code>resizeRef.current.closest('tr')</code>, which is the row the resizer ITSELF is in. This means if RowResizer is in its own <code>&lt;tr&gt;</code>, it resizes that handle row, not the content row above or below.</li>
                <li>For the intended usage ("put that import in between my tr"), the <code>RowResizer</code> should modify its <strong>previous sibling TR element</strong> or the <strong>next sibling TR element</strong>, or be part of the TR that is being resized.</li>
            </ul>
            <p>Let's adjust the RowResizer logic slightly or how it's used in the demo for a more intuitive "between rows" feel.</p>
            <p><strong>Current <code>RowResizer</code> behavior:</strong> It resizes the <code>&lt;tr&gt;</code> it is part of. If <code>RowResizer</code> is a <code>&lt;td&gt;</code>, it will resize its parent <code>&lt;tr&gt;</code>.</p>
            <p>The demo below will use <code>RowResizer</code> as a special <code>&lt;td&gt;</code> within the row that is to be resized, typically as the last cell, or by having a dedicated column for these handles.</p>
            <p>Alternatively, if RowResizer is a standalone component placed *between* TRs (not as a TR itself, but as a sibling of TRs, which is not standard table structure but possible with divs), it would need a different DOM traversal. Given it's a `<td>` now, it must be *inside* a `<tr>`.</p>

            <h2>Revised Demo: RowResizer as a TD within the resizable TR</h2>
             <table>
                <thead>
                    <tr>
                        <th>Content Header 1</th>
                        <th>Content Header 2</th>
                        <th style={{width: '20px'}}>Handle</th> {/* Column for handles */}
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ height: row1Height ? `${row1Height}px` : undefined }}>
                        <td>Row 1 Data 1</td>
                        <td>Row 1 Data 2</td>
                        <RowResizer id="row1-handle-rr" resizeEnd={setRow1Height} minHeight={30} />
                    </tr>
                    <tr>
                        <td>Row 2 Data 1 (Static)</td>
                        <td>Row 2 Data 2 (Static)</td>
                        <td></td>{/* No handle for this row */}
                    </tr>
                     <tr style={{ height: row3Height ? `${row3Height}px` : undefined }}>
                        <td>Row 3 Data 1</td>
                        <td>Row 3 Data 2</td>
                        <RowResizer id="row3-handle-rr" className="custom-row-resizer-class" resizeEnd={setRow3Height} minHeight={40} />
                    </tr>
                </tbody>
            </table>
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
