import React from 'react';
import './style.css';
import FlexBox from '../flexbox';
import { VscChromeClose, VscWarning } from 'react-icons/vsc';
import MUIAlert, { AlertProps as MUIAlertProps } from '@mui/material/Alert';
import { styled } from '@mui/material/styles';


export interface AlertProps {
    grow?: boolean
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

export default function Alert(props: AlertProps) {
    return (
        <DirektivAlert iconMapping={{
            error: <VscWarning fontSize="inherit" />
          }}
          {...props} />
    )
}