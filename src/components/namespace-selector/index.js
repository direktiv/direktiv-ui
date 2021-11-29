import React, {useEffect, useState} from 'react';
import './style.css';
import FlexBox from '../flexbox';
import {IoChevronDown} from 'react-icons/io5';
import { GenerateRandomKey } from '../../util';
import { Link } from 'react-router-dom';
import Identicon from 'react-identicons';

function NamespaceSelector(props) {
    let {style, className, namespaces, namespace} = props;
    if (!className) {
        className = ""
    }
    className += " border"
    
    const [showSelector, setShowSelector] = useState(false);
    let selectorClass = "selector-section hidden";
    let selectorBorderClass = "selector-border hidden"
    let chevronClass = "chevron-icon"
    let namespaceSelectorClass = "namespace-selector"

    if (showSelector) {
        selectorBorderClass = "selector-border"
        selectorClass = "selector-section"
        chevronClass = "chevron-icon spin"
    }

    let loading = false;
    if (!namespaces) {
        // If namespaces is null/undefined, the request to get namespaces has not yet succeeded.
        // Show a loader.
        loading = true;
    } else if (namespaces === []) {
        // Else if namespaces is an empty array, the request succeeded but no namespaces are listed.
        // In this case, prompt with a 'create namespace' modal.
    }

    if (loading) {
        namespaceSelectorClass += " loading"
        chevronClass += " hidden"
    }

    useEffect(()=>{
        function resetSelector() {
            setShowSelector(!showSelector)
            window.removeEventListener('click', resetSelector)
        }
        if(showSelector) {
            window.addEventListener('click', resetSelector)
        }
    },[showSelector])

    return (
        <>
            <FlexBox className="col gap">
                <FlexBox onClick={() => {
                    setShowSelector(!showSelector)
                }} style={{...style, maxHeight: "64px"}} className={className + " ns-hover"}>

                    <FlexBox className={namespaceSelectorClass}>
                        <NamespaceListItem disabled namespace={namespace} label="ACTIVE NAMESPACE" loading={loading} />
                        <FlexBox className="tall">
                            <div className="auto-margin grey-text">
                                <IoChevronDown className={chevronClass} style={{ marginTop: "8px" }} />
                            </div>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
                <FlexBox className={selectorBorderClass}>
                    <FlexBox className={selectorClass}>
                        {namespaces !== null ? 
                        <NamespaceList setShowSelector={setShowSelector} namespaces={namespaces}/>:""}
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        </>
    );
}

export default NamespaceSelector;

function NamespaceListItem(props) {

    let {disabled, namespace, loading, label, setShowSelector} = props;
    let className = "namespace-list-item";

    if (!namespace) {
        namespace = "Undefined"
    }

    if (!label) {
        label = "Namespace"
    }

    if (loading === true) {
        className += " loading"
        label = "Loading..."
        namespace = "..."
    }



    return (
        <NamespaceListItemLink disabled={disabled} namespace={namespace} setShowSelector={setShowSelector}>
            <FlexBox className={className} style={{height: "45px", minHeight: "44px", maxHeight: "45px"}}>
                <FlexBox className="">
                    <FlexBox className="namespace-selector-logo">
                        <div className="auto-margin" style={{paddingTop: "3px", marginLeft: "3px", filter: "opacity(60%)"}}>
                            <Identicon string={namespace} size={39} />
                        </div>
                    </FlexBox>
                    <FlexBox className="col">
                        <div className="auto-margin" style={{marginLeft: "8px"}}>
                            <FlexBox className="namespace-selector-label-header">
                                {label}
                            </FlexBox>
                            <FlexBox className="namespace-selector-label-value">
                            <span>{namespace}</span>
                            </FlexBox>
                        </div>
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        </NamespaceListItemLink>
    );
}

function NamespaceListItemLink(props) {
    let {disabled, children, namespace, setShowSelector} = props;
    if (disabled) {
        return <>{children}</>
    }

    return (
        <Link to={`/n/${namespace}`} onClick={()=>{
            if (setShowSelector) {
                setShowSelector(false)
            }
        }}>
            {children}
        </Link>
    )
}

function NamespaceList(props){
    const {namespaces, setShowSelector} = props

    return (
        <FlexBox className="namespaces-list gap col">
            {namespaces.map((obj)=>{
                return(
                    <NamespaceListItem setShowSelector={setShowSelector} key={GenerateRandomKey("namespace-")} namespace={obj.node.name} loading={false}/>
                )
            })}
        </FlexBox>
    );
}