import React, {useEffect, useState} from 'react';
import './style.css';
import Button from '../button';
import ContentPanel, {ContentPanelTitle, ContentPanelBody, ContentPanelTitleIcon, ContentPanelFooter} from '../../components/content-panel';
import { IoLockClosedOutline, IoCloseCircleSharp } from 'react-icons/io5';
import FlexBox from '../flexbox';
import Alert from '../alert';


function Modal(props) {

    let {noPadding, titleIcon, title, children, button, withCloseButton, activeOverlay, label, buttonDisabled} = props;
    let {modalStyle, style, actionButtons, keyDownActions, escapeToCancel, onClose, onOpen } = props;
    const [visible, setVisible] = useState(false);

    if (!title) {
        title = "Modal Title"
    }
    
    if (!label) {
        label = "Click me"
    }

    function closeModal() {
        setVisible(false);
    }

    

    let callback = function() {
        if (onClose) {
            onClose()
        }
        closeModal()
    }

    let overlay = (<></>);
    if (visible) {
        overlay = (<ModalOverlay 
                        modalStyle={modalStyle}
                        children={children} 
                        title={title} 
                        activeOverlay={activeOverlay} 
                        withCloseButton={withCloseButton} 
                        callback={callback} 
                        onOpen={onOpen}
                        actionButtons={actionButtons}
                        escapeToCancel={escapeToCancel}
                        keyDownActions={keyDownActions}
                        titleIcon={titleIcon}
                        noPadding={noPadding}
                    />)
    }

    if (!button) {
        return(
            <div>
                {overlay}
                <Button style={{pointerEvents: buttonDisabled ? "none" : ""}} onClick={(ev) => {
                    setVisible(true)
                    ev.stopPropagation()
                }}>
                    {label}
                </Button>
            </div>
        );
    }

    return (
        <>
        {overlay}
        <FlexBox style={{...style}}>
            <div style={{width: "100%", display:'flex', justifyContent: "center", pointerEvents: buttonDisabled ? "none" : ""}} onClick={async(ev) => {
                if(onOpen){
                    await onOpen()
                }
                setVisible(true)
                ev.stopPropagation()
            }}>
                {button}
            </div>
        </FlexBox>
        </>
    )
}

export default Modal;

function ModalOverlay(props) {

    let {noPadding, titleIcon, modalStyle, title, children, callback, activeOverlay, withCloseButton} = props;
    let {actionButtons, escapeToCancel, keyDownActions} = props;
    const [displayAlert, setDisplayAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    
    useEffect(()=>{
        function closeModal(e){
            if (e.keyCode === 27) {
                callback(false)
            }
        }

        let removeListeners = [];

        if (escapeToCancel) {
            window.addEventListener('keydown', closeModal)
            removeListeners.push({label: 'keydown', fn: closeModal})
        }

        if (keyDownActions) {
            for (let i = 0; i < keyDownActions.length; i++) {
                const action = keyDownActions[i];

                let fn = async (e) => {
                    if (action.id != undefined && action.id !== e.target.id){
                        return
                    }

                    if (e.code === action.code) {
                        let err = await action.fn()
                        if (err) {
                            setAlertMessage(err)
                            setDisplayAlert(true)
                        } else if (action.closeModal) {
                            callback(false)
                        }
                    }
                }

                window.addEventListener('keydown', fn)
                removeListeners.push({label: 'keydown', fn: fn})
            }
        }

        return () => {
            for (let i = 0; i < removeListeners.length; i++) {
                window.removeEventListener(removeListeners[i].label, removeListeners[i].fn)
            }
        }

    },[escapeToCancel, callback, keyDownActions])
    

    let overlayClasses = ""
    let closeButton = (<></>);
    if (withCloseButton) {
        closeButton = (
            <FlexBox className="modal-buttons" style={{ flexDirection: "column-reverse" }}>
                <div>
                    <IoCloseCircleSharp 
                        className="red-text auto-margin" 
                        style={{ marginRight: "8px" }}
                        onClick={() => {
                            callback()
                        }}
                    />
                </div>
            </FlexBox>
        )
    }
    
    if (activeOverlay) {
        overlayClasses += "clickable"
    }

    let buttons
    if (actionButtons){
       buttons = generateButtons(callback, setDisplayAlert, setAlertMessage, actionButtons);
    } 

    let contentBodyStyle = {
        padding: "12px"
    }
    if (noPadding) {
        contentBodyStyle = {
            padding: "0px"
        }
    }

    return(
        <>
            <div className={"modal-overlay " + overlayClasses} />
            <div className={"modal-container " + overlayClasses} onClick={() => {
                if (activeOverlay) {
                    callback()
                }
            }}>
                <FlexBox className="tall">
                    <div style={{ ...modalStyle }} className="modal-body auto-margin" onClick={(e) => {
                        e.stopPropagation()
                    }}>
                        <ContentPanel style={{maxHeight: "80vh"}}>
                            <ContentPanelTitle>
                                <FlexBox style={{ maxWidth: "18px" }}>
                                    <ContentPanelTitleIcon>
                                        {
                                            titleIcon 
                                            ? 
                                            [titleIcon]
                                            :
                                            <IoLockClosedOutline />
                                        }
                                    </ContentPanelTitleIcon>
                                </FlexBox>
                                <FlexBox>
                                    {title}   
                                </FlexBox>
                                <FlexBox>
                                    {closeButton}
                                </FlexBox>
                            </ContentPanelTitle>
                            <ContentPanelBody style={contentBodyStyle}>
                                <FlexBox className="col gap">
                                    { displayAlert ?
                                    <Alert className="critical">{alertMessage}</Alert>
                                    : <></> }
                                    {children}
                                </FlexBox>
                            </ContentPanelBody>
                            { buttons ? 
                            <ContentPanelFooter>
                                <FlexBox className="gap modal-buttons-container" style={{flexDirection: "row-reverse"}}>
                                    {buttons}
                                </FlexBox>
                            </ContentPanelFooter>
                            :<></>}
                        </ContentPanel>
                    </div>
                </FlexBox>
            </div>
        </>
    )
}

export function ButtonDefinition(label, onClick, classList, closesModal, async) {
    return {
        label: label,
        onClick: onClick,
        classList: classList,
        closesModal: closesModal,
        async: async
    }
}
// KeyDownDefinition :
// code : Target Key Event
// fn : callback function
// closeModal : Whether to close modal after fn()
// id : target element id to listen on. If undefined listener is global
export function KeyDownDefinition(code, fn, closeModal, targetElementID) {
    return {
        code: code,
        fn: fn,
        closeModal: closeModal,
        id: targetElementID,
    }
}

function generateButtons(closeModal, setDisplayAlert, setAlertMessage, actionButtons) {

    // label, onClick, classList, closesModal, async

    let out = [];
    for (let i = 0; i < actionButtons.length; i++) {

        let btn = actionButtons[i];
        let onClick =  async () => {
            
            let e = await btn.onClick()
            if (e) {
                // handle error
                setAlertMessage(e)
                setDisplayAlert(true)
            } else if (btn.closesModal) {
                closeModal()
            } else {
                setAlertMessage("")
                setDisplayAlert(false)
            }

        }

        out.push(
            <Button key={Array(5).fill().map(()=>"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.random()*62)).join("")} className={btn.classList} onClick={onClick}>
                <div>{btn.label}</div>
            </Button>
        )
    }

    return out
} 