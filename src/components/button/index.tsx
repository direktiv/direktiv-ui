import { Tooltip } from '@mui/material';
import MUIButton, { ButtonProps as MUIButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export interface ButtonProps extends MUIButtonProps {
    /**
    * Tooltip to show on hover.
    */
    tooltip?: string;
    /**
    * Tooltip to show on hover when disabled is true. If unset, disabled tooltip will default to tooltip.
    */
    disabledTooltip?: string;
    asyncDisable?: boolean;
    /**
    *Auto expand height and width.
    */
    auto?: boolean;
    /**
    * Disables shadows on button.
    */
    disableShadows?: boolean;
    loading?: boolean; // ???
}

const DirektivButton = styled(MUIButton, {
    shouldForwardProp: (prop) => prop !== 'success',
})<ButtonProps>(({ theme, color, size, auto, variant, disabledTooltip, disabled, disableShadows, loading }) => ({
    // Defaults
    textTransform: "none",
    fontSize: "0.8rem",
    padding: "0.4rem 0.5rem",
    minWidth: "auto",
    height: "auto",
    fontWeight: "bold",
    "&:visited":{
        color: color !== undefined && color !== "inherit" ? theme.palette[color].main : undefined
    },
    "&.MuiButton-sizeSmall": {
        height: "1.8rem",
        lineHeight: "1rem",
    },
    "&.MuiButton-sizeMedium": {
        height: "2.8rem",
        lineHeight: "2rem",
    },
    "&.MuiButton-sizeLarge": {
        height: "3.8rem",
        lineHeight: "3rem",
    },
    // Enable Shadows for non-text variants
    ...(variant !== "text" && {
        boxShadow: "var(--theme-shadow-box-shadow)",
        "&:hover": {
            backgroundColor: color !== undefined && color !== "inherit" ? theme.palette[color].light : undefined,
            transition: '0.2s'
        },
    }),
    // Custom Style for info color
    ...(color === "info" && variant !== "text" && {
        backgroundColor: "white",
        // outline: "var(--border)",
        borderColor: "var(--theme-subtle-border)",
        ":hover": {
            borderColor: "#d2d4d7"
        }
    }),
    // Custom Style for terminal color
    ...(color === "terminal" && variant !== "text" && {
        border: "none",
        ":disabled": {
            backgroundColor: "#2e3d48",
            color: "#65747f"
        },
    }),
    // Support Disabled Tooltips
    ...(disabledTooltip !== undefined && {
        "&:disabled": {
            pointerEvents:"auto",
        },
        ...(disabled && {
            "&:hover": {
                backgroundColor: undefined
            },
        }),
    }),
    // Auto expand height/width
    ...(auto && {
        width: "100%",
        minWidth: "0px",
        minHeight: "0px",
        height: "auto !important"
    }),
    ...(disableShadows && {
        boxShadow: undefined 
    }),
}));

function Button(props: ButtonProps) {
    const [isOnClick, setIsOnClick] = React.useState(false)
    const tooltipText = React.useMemo(()=>{
        const disabled = isOnClick || props.disabled
        if (disabled) {
            if (props.disabledTooltip !== undefined){
                return props.disabledTooltip
            }

            return ""
        }

        return props.tooltip ? props.tooltip : ""
    },[props, isOnClick])

    return (
        <Tooltip title={tooltipText} placement="top" arrow>
            <DirektivButton variant="contained" color="primary" disableRipple size="small" {...props} disabled={isOnClick || props.disabled} onClick={async (e) => {
                if (props.onClick === undefined) {
                    return
                }

                if (props.asyncDisable) {
                    setIsOnClick(true)
                }

                await props.onClick(e)

                if (props.asyncDisable) {
                    setIsOnClick(false)
                }

            }
            } />
        </Tooltip>
    )
}

export default Button