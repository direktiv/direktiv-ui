import React from 'react';
import './style.css';
import FlexBox from '../flexbox';
import { VscChromeClose, VscWarning } from 'react-icons/vsc';
import MUIAlert, { AlertProps as MUIAlertProps } from '@mui/material/Alert';
import { styled } from '@mui/material/styles';


export interface AlertProps extends MUIAlertProps{
    /**
     * What background color to use
     */
    grow?: boolean;
    severity?: 'success' | 'info' | 'warning' | 'error'
}

const DirektivAlert = styled(MUIAlert, {
    shouldForwardProp: (prop) => prop !== 'success',
})<AlertProps>(({ theme, variant, severity, grow }) => ({
    ...(grow && {
        width: "100%",
    }),
    ...(severity === "info" && variant === undefined && {
        backgroundColor: "#cfd5de",
        color: "#566875",
        ".MuiAlert-icon": {
            color: "#566875",
        }
    }),
    ...(severity === "error" && variant === undefined && {
    }),
}));

/**
 * Primary UI component for user interaction
 */
const Alert = ({
    ...props
  }: AlertProps) => {
    return (
        <DirektivAlert iconMapping={{
            error: <VscWarning fontSize="inherit" />
          }}
          {...props} />
    )
}

export default Alert