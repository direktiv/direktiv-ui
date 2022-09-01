import React from 'react';
import { VscInfo } from 'react-icons/vsc';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'
import './style.css';

export interface HelpIconProps {
    msg: string
    zIndex: number
}

function HelpIcon({ msg = "No help text provided", zIndex = 10}: HelpIconProps) {
    return (
        <>
            <Tippy content={msg} trigger={'mouseenter focus click'} zIndex={zIndex}>
                <div className={"iconWrapper"}>
                    <VscInfo className="grey-text" />
                </div>
            </Tippy>
        </>
    )
}

export default HelpIcon;