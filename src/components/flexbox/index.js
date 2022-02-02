import React from 'react';
import './style.css';

function FlexBox(props){

    let {id, children, onClick, style, className} = props;
    if (!className) {
        className = ""
    }

    return(
        <div id={id} onClick={onClick} style={style} className={"flex-box " + className}>
            {children}
        </div>
    );
}

export default FlexBox;