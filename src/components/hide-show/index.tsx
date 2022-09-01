import React from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'
import './style.css';

export interface HideShowButtonProps {
    field: string
    zIndex: number
    show: boolean
    setShow?: React.Dispatch<React.SetStateAction<boolean>>
}

function HideShowButton({field = "field", zIndex = 10, show = false, setShow}: HideShowButtonProps) {
    return (
        <>
            <Tippy content={show ? `Hide ${field}` : `Show ${field}`} trigger={'mouseenter focus'} zIndex={zIndex}>
                <div className={"show-hide-icon"} onClick={() => {
                    if (!setShow) {
                        console.warn("setShow prop missing")
                        return
                    }

                    setShow(!show)
                }}>
                    {show ?
                        <BsEye className="grey-text" />
                        :
                        <BsEyeSlash className="grey-text" />
                    }
                </div>
            </Tippy>
        </>
    )
}

export default HideShowButton;