import React from "react";
import ColumnResize from "./column-resizer";
import "./style.css";

export const App = () => {
  return (
    <div>
      <table className="column_resize_table">
        <thead>
          <tr>
           <th rowSpan={2}>main</th>
           <ColumnResize rowSpan={2} id={1} defaultWidth={400} minWidth={50}  resizeEnd={(width)=> console.log("resize end", width)} resizeStart={()=> console.log("resize start")} className="columnResizer" />
           <th rowSpan={2}>11</th>
           <ColumnResize rowSpan={2} id={1} defaultWidth={400} minWidth={50}  resizeEnd={(width)=> console.log("resize end", width)} resizeStart={()=> console.log("resize start")} className="columnResizer" />
           <th colSpan={3}>head</th>
          </tr>
          <tr>
            <th>21</th>
            <ColumnResize id={1} defaultWidth={400} minWidth={50}  resizeEnd={(width)=> console.log("resize end", width)} resizeStart={()=> console.log("resize start")} className="columnResizer" />
            <th>22</th>
          </tr>
        </thead>
        <tbody>  
          <tr>
            <td>main</td>
            <td className="column_resizer_body" />
            <td>normal</td>
            <td className="column_resizer_body" />
            <td>2</td>
            <td className="column_resizer_body" />
            <td>3</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
