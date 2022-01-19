import React, {useEffect, useState} from 'react'
import './style.css'
import FlexBox from '../flexbox'

function Tabs(props) {

    const [activeTab, setActiveTab] = useState(0)
    let {style, headers, tabs, onTabChanged} = props;

    useEffect(() => {
        onTabChanged && onTabChanged(headers[activeTab])
    }, [activeTab, onTabChanged, headers])

    if (!headers || !tabs) {
        return (<>Bad tabs definition (missing tabs or headers).</>)
    }

    if (headers.length !== tabs.length) {
        return (<>Bad tabs definition (headers array must be equal length to tabs array).</>)
    }

    let headerDOMs = [];
    for (let i = 0; i < headers.length; i++) {

        let classes = "tab-header center-align"
        if (i === activeTab) {
            classes += " active-tab"
        }

        headerDOMs.push(<FlexBox className={classes} onClick={() => {
            setActiveTab(i)
        }}>
            <span>
                {headers[i]}
            </span>
        </FlexBox>)
    }
    
    return(
        <FlexBox className="col gap" style={{...style}}>
            <div className="tabs-row">
                {headerDOMs}
            </div>
            <FlexBox>
                {tabs[activeTab]}
            </FlexBox>
        </FlexBox>  
    )
}

export default Tabs;

export function Tab(props) {
    let {children, style} = props;
    return(
        <FlexBox style={{...style}}>
            {children}
        </FlexBox>
    )
}

