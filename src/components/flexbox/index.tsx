import React, { useMemo } from 'react';
import './style.css';

type FlexBoxCenterAxis  = "y" | "x" | "xy" | boolean;
type FlexBoxGapSize  = "md" | "sm" | boolean;

export interface FlexBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    hide?: boolean
    col?: boolean
    row?: boolean
    gap?: FlexBoxGapSize
    center?: FlexBoxCenterAxis
    tall?: boolean
    wrap?: boolean
}

const FlexBox: React.FunctionComponent<FlexBoxProps> = ({
    hide,
    col,
    row,
    gap,
    center,
    tall,
    wrap,
    ...props
}) => {
    const className = useMemo(() => {
        const prefix = "flex-box"
        let clsName = props.className ? props.className : ""

        if (hide) {
            clsName += ` ${hide}`
        }

        if (col) {
            clsName += ` col`
        }

        if (row) {
            clsName += ` row`
        }

        if (tall) {
            clsName += ` tall`
        }

        if (wrap) {
            clsName += ` wrap`
        }

        if (gap) {
            switch (gap) {
                case true: {
                    clsName += ` gap-md`
                    break;
                }
                case "md": {
                    clsName += ` gap-md`
                    break;
                }
                case "sm": {
                    clsName += ` gap-sm`
                    break;
                }
            }
        }

        if (center) {
            switch (center) {
                case true: {
                    clsName += ` center`
                    break;
                }
                case "xy": {
                    clsName += ` center`
                    break;
                }
                case "x": {
                    clsName += ` center-x`
                    break;
                }
                case "y": {
                    clsName += ` center-y`
                    break;
                }
            }
        }

        return `${prefix} ${clsName}`
    }, [props, hide, col, row, gap, center])

    return (
        <div {...props} className={className} />
    );
}

export default FlexBox;