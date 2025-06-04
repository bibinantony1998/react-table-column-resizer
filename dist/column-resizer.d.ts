import React from 'react';
interface ColumnResizerProps {
    disabled?: boolean;
    minWidth?: number;
    maxWidth?: number;
    className?: string;
    id?: string;
    resizeStart?: () => void;
    resizeEnd?: (newWidth: number) => void;
    defaultWidth?: number;
    rowSpan?: number;
    colSpan?: number;
}
declare const ColumnResizer: React.FC<ColumnResizerProps>;
export default ColumnResizer;
