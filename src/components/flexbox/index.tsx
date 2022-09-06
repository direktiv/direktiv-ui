import React, { useMemo } from 'react';
import './style.css';

export enum FlexBoxGapSize {
    Medium = "md",
    SMALL = "sm",
}

export enum FlexBoxCenterAxis {
    CENTERY = "y",
    CENTERX = "x",
    CENTERXY = "xy",
}

export interface FlexBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    hide?: boolean
    col?: boolean
    row?: boolean
    gap?: FlexBoxGapSize | boolean
    center?: FlexBoxCenterAxis | boolean
}

const FlexBox: React.FunctionComponent<FlexBoxProps> = ({
    hide,
    col,
    row,
    gap,
    center,
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

        if (gap) {
            switch (gap) {
                case true: {
                    // fallthrough
                }
                case FlexBoxGapSize.Medium: {
                    clsName += ` gap-md`
                    break;
                }
                case FlexBoxGapSize.SMALL: {
                    clsName += ` gap-sm`
                    break;
                }
            }
        }

        if (center) {
            switch (center) {
                case true: {
                    // fallthrough
                }
                case FlexBoxCenterAxis.CENTERXY: {
                    clsName += ` center`
                    break;
                }
                case FlexBoxCenterAxis.CENTERX: {
                    clsName += ` center-x`
                    break;
                }
                case FlexBoxCenterAxis.CENTERY: {
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