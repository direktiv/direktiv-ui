import React from 'react'
import FlexBox from '../flexbox';
import './style.css';

function ContentPanel(props) {

    let {style, children, className, id, grow} = props;
    if (!className) {
        className = ""
    }

    className = "content-panel-parent opaque " + className

    return(
        <div id={id} style={{display: "flex", flexDirection: "column", flexGrow: grow ? "1": undefined, ...style}} className={className} >
            {children}
        </div>
    );
}

export default ContentPanel;

export function ContentPanelTitle(props) {
    
    let {style, children, className} = props;
    if (!className) {
        className = ""
    }

    className = "content-panel-title " + className

    return(
        <FlexBox style={{...style}} className={className}>
            {children}
        </FlexBox>
    );
}

export function ContentPanelTitleIcon(props) {
    
    let {children, className} = props;
    if (!className) {
        className = ""
    }

    className = "content-panel-title-icon " + className

    return(
        <div className={className}>
            {children}
        </div>
    );
}

export function ContentPanelBody(props) {
    
    let {children, className, style} = props;
    if (!className) {
        className = ""
    }

    className = "content-panel-body " + className

    return(
        <div style={{...style}} className={className}>
            {children}
        </div>
    );
}

export function ContentPanelFooter(props) {

    let {children, className, style} = props;
    if (!className) {
        className = ""
    }

    className = "content-panel-footer " + className

    return (
        <div style={{...style}} className={className}>
            {children}
        </div>
    )
}