import React from 'react'
import FlexBox from '../flexbox';
import './style.css';

export interface ContentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    grow?: boolean
}

const ContentPanel: React.FunctionComponent<ContentPanelProps> = ({
    grow = false,
    ...props
}) => {
    return (
        <div 
        {...props} style={{ display: "flex", flexDirection: "column", flexGrow: grow ? "1" : undefined, ...props.style}} className={`content-panel-parent opaque ${props.className ? props.className : ""}`}/>
    );
}

export default ContentPanel;

export function ContentPanelTitle({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <FlexBox {...props} className={`content-panel-title ${props.className ? props.className : ""}`} />
    );
}

export function ContentPanelTitleIcon({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`content-panel-title-icon ${props.className ? props.className : ""}`} />
    );
}

export function ContentPanelBody({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`content-panel-body ${props.className ? props.className : ""}`} />
    );
}

export function ContentPanelFooter({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`content-panel-footer ${props.className ? props.className : ""}`} />
    );
}