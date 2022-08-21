import * as React from 'react';
import MUIButton, { ButtonProps as MUIButtonProps } from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import { Tooltip } from '@mui/material';

interface ButtonProps extends MUIButtonProps {
    tooltip?: string;
    asyncDisable?: boolean;
    auto?: boolean;
}

const DirektivButton = styled(MUIButton, {
    shouldForwardProp: (prop) => prop !== 'success',
})<ButtonProps>(({ theme, color, size, auto, variant }) => ({
    ...(variant !== "text" &&{
        boxShadow: "var(--theme-shadow-box-shadow)",
        border: "var(--border)",
    }),
    textTransform: "none",
    fontSize: "0.8rem",
    padding: "0.4rem 0.5rem",
    // minWidth: "0px",
    // width:"inherit",
    height: "auto",
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
    ":hover": {
        backgroundColor: color !== undefined && color !== "inherit" && color !== "info" ? theme.palette[color].light : "none",
        boxShadow: "var(--theme-shadow-box-shadow)",
        transition: '0.2s',
    },
    ":active": {
        backgroundColor: color !== undefined && color !== "inherit" ? theme.palette[color].dark : "none",
    },
    ...(color === "info" && {
        fontWeight: "bold",
        color: "var(--theme-dark-text)",
        ":hover": {
            backgroundColor: theme.palette[color].main,
            boxShadow: "var(--theme-shadow-box-shadow)",
            borderColor: 'var(--theme-dark-text)',
            transition: '0.2s',
        },
    }),
    ...(auto && {
        width: "100%",
        minWidth: "0px",
        minHeight: "0px",
        height: "auto !important"
    }),
}));

export default function Button(props: ButtonProps) {
    const [isOnClick, setIsOnClick] = React.useState(false)

    return (
        <Tooltip title={props.tooltip ? props.tooltip : ""} placement="top" arrow>
            <DirektivButton variant="contained" color="primary" disableRipple disabled={isOnClick} size="small"{...props} onClick={async (e) => {
                if (props.onClick == undefined) {
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