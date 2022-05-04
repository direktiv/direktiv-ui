import React from 'react';
import './style.css';
import FlexBox from '../flexbox';
import { VscChromeClose, VscWarning } from 'react-icons/vsc';
import Button from '../button';

function Alert(props) {

    let { children, style, className, setErrorMsg } = props;

    if (!className) {
        className = ""
    }
    className = "alert " + className

    return (
        <FlexBox className={className} style={{ ...style }}>
            <FlexBox className="alert-opacity gap">
                <FlexBox className="alert-icon auto-margin" style={{ maxWidth: "60px" }}>
                    <VscWarning className="auto-margin" />
                </FlexBox>
                <FlexBox className="alert-body auto-margin">
                    {children}
                </FlexBox>
                {
                    setErrorMsg ?
                        <FlexBox className="col center alert-close" onClick={()=>{
                            setErrorMsg(null)
                        }}>
                            <VscChromeClose />
                        </FlexBox>
                        : <></>
                }
            </FlexBox>
        </FlexBox>
    );
}

export default Alert;