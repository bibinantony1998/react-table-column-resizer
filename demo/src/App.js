import React from "react";
import ColumnResize from "./column-resizer";
import "./style.css";

export const App = () => {
  return (
    <div>
      <table className="column_resize_table">
        <thead>
          <tr>
            <th>1</th>
            <ColumnResize id={1} defaultWidth={400} minWidth={50}  resizeEnd={(width)=> console.log("resize end", width)} resizeStart={()=> console.log("resize start")} className="columnResizer" />
            <th>2</th>
            <ColumnResize id={2} resizeEnd={(width)=> console.log("resize end", width)} resizeStart={()=> console.log("resize start")} className="columnResizer" />
            <th>xsxsxsx</th>
            <ColumnResize disabled id={3} minWidth={200} maxWidth={200} resizeEnd={(width)=> console.log("resize end", width)} resizeStart={()=> console.log("resize start")} className="columnResizer" />
            <th>minWidth 120 </th>
            <ColumnResize id={4} maxWidth={200}  minWidth={120} className="columnResizer" />
            <th>5</th>
            <ColumnResize id={4} maxWidth={200} minWidth={120} className="columnResizer" />
          </tr>
          </thead>
        <tbody>  
          <tr>
            <td>1</td>
            <td className="column_resizer_body" />
            <td>2</td>
            <td className="column_resizer_body" />
            <td>3</td>
            <td className="column_resizer_body" />
            <td>4</td>
            <td className="column_resizer_body" />
            <td>5</td>
            <td className="column_resizer_body" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
