import { useEffect, useState } from 'react';
import ContentPanel, { ContentPanelBody, ContentPanelFooter, ContentPanelTitle, ContentPanelTitleIcon } from '../content-panel';
import './style.css';

import { VscDiffAdded } from 'react-icons/vsc';

import { VscClose } from 'react-icons/vsc';
import Alert from '../alert';
import FlexBox from '../flexbox';

import 'tippy.js/dist/tippy.css';

import Button, { ButtonProps } from '../button';

export interface RequiredField {
    tip: string;
    value: string;
}

export interface ModalHeadlessProps extends ModalOverlayProps {
    visible?: boolean
    setVisible: (visible: boolean) => any
}

export function ModalHeadless({
    visible,
    setVisible,
    ...overlayProps
}: ModalHeadlessProps) {

    let overlay = (<></>);
    if (visible) {
        overlay = (<ModalOverlay
            {...overlayProps}
            onClose={() => {
                if (overlayProps.onClose) {
                    overlayProps.onClose()
                }
                setVisible(false)
            }}
        />)
    }

    return (<>{overlay}</>)


}

export interface ModalProps extends ModalHeadlessProps {
    button?: boolean
    buttonProps?: ButtonProps
    buttonDisabled?: boolean
    label: string
}


function Modal({
    button,
    buttonProps,
    buttonDisabled,
    label = "Click me",
    ...props
}: ModalProps) {
    const [visible, setVisible] = useState(false);
    if (!button) {
        return (
            <div>
                <ModalHeadless
                    {...props}
                    setVisible={setVisible}
                    visible={visible}
                />
                <Button disabled={buttonDisabled} onClick={(ev) => {
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

            <ModalHeadless
                {...props}
                setVisible={setVisible}
                visible={visible} />
            <Button onClick={async (ev) => {
                if (props.onOpen) {
                    await props.onOpen()
                }
                setVisible(true)
                ev.stopPropagation()
            }} variant={"outlined"} color="info" {...buttonProps}>
                {button}
            </Button>
        </>
    )
}
export default Modal;

export interface ModalOverlayProps {
    maximised?: boolean
    noPadding?: boolean
    titleIcon?: React.ReactNode
    title: string
    children?: boolean
    withCloseButton?: boolean
    activeOverlay?: boolean
    modalStyle?: React.CSSProperties
    escapeToCancel?: boolean
    requiredFields?: RequiredField[]
    onOpen: (...e: any) => any
    onClose: (...e: any) => any

    actionButtons?: ButtonDefinition[]
    keyDownActions?: KeyDownDefinition[]
}

function ModalOverlay({
    maximised,
    noPadding,
    titleIcon,
    title = "Modal Title",
    children,
    withCloseButton,
    activeOverlay,
    modalStyle,
    actionButtons,
    keyDownActions,
    escapeToCancel,
    onClose,
    onOpen,
    requiredFields,
}: ModalOverlayProps) {
    function validateFields(reqFields?: RequiredField[]) {
        let tipMessages: string[] = []

        if (!reqFields) {
            return { tips: tipMessages, valid: tipMessages.length === 0 }
        }

        for (let i = 0; i < reqFields.length; i++) {
            const rField = reqFields[i];
            if (rField.value === null || rField.value === "") {
                tipMessages.push(rField.tip)
            }
        }

        return { tips: tipMessages, valid: tipMessages.length === 0 }
    }

    const [displayAlert, setDisplayAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const validateResults = validateFields(requiredFields)


    useEffect(() => {
        function closeModal(e: KeyboardEvent) {
            if (e.keyCode === 27) {
                onClose(false)
            }
        }

        let removeListeners: { label: string, fn: (...e: any) => any }[] = [];

        if (escapeToCancel) {
            window.addEventListener('keydown', closeModal)
            removeListeners.push({ label: 'keydown', fn: closeModal })
        }

        if (keyDownActions) {
            for (let i = 0; i < keyDownActions.length; i++) {
                const action = keyDownActions[i];

                let fn = async (e: KeyboardEvent) => {
                    const eventTarget: any = e.target

                    // Check if event target matches keyboard action id
                    if (action.id !== undefined && action.id !== eventTarget.id) {
                        return
                    }

                    if (e.code === action.code) {
                        try {
                            const result = await action.fn()
                            if (!result?.error && action.closeModal) {
                                onClose(false)
                            }
                            if (result?.error) {
                                setAlertMessage(result?.msg)
                                setDisplayAlert(true)
                            }
                        } catch (err) {
                            if (err instanceof Error) {
                                setAlertMessage(err.message)
                                setDisplayAlert(true)
                            } else {
                                //TODO: HANDLE BAD ERROR
                            }
                        }
                    }
                }

                window.addEventListener('keydown', fn)
                removeListeners.push({ label: 'keydown', fn: fn })
            }
        }

        return () => {
            for (let i = 0; i < removeListeners.length; i++) {
                window.removeEventListener(removeListeners[i].label, removeListeners[i].fn)
            }
        }

    }, [escapeToCancel, onClose, keyDownActions])


    let overlayClasses = ""
    let closeButton = (<></>);
    if (withCloseButton) {
        closeButton = (
            <FlexBox className="modal-buttons" style={{ flexDirection: "column-reverse" }}>
                <div>
                    <VscClose onClick={() => {
                        onClose()
                    }} className="auto-margin" style={{ marginRight: "8px" }} />
                </div>
            </FlexBox>
        )
    }

    if (activeOverlay) {
        overlayClasses += "clickable"
    }

    let buttons
    if (actionButtons) {
        buttons = generateButtons(onClose, setDisplayAlert, setAlertMessage, actionButtons, validateResults);
    }

    let contentBodyStyle = {}
    if (!noPadding) {
        contentBodyStyle = {
            padding: "12px"
        }
    }

    return (
        <>
            <div className={"modal-overlay " + overlayClasses} />
            <div className={"modal-container " + overlayClasses} onClick={() => {
                if (activeOverlay) {
                    onClose()
                }
            }}>
                <FlexBox className="tall">
                    <div style={{ display: "flex", width: "100%", justifyContent: "center", ...modalStyle }} className="modal-body auto-margin" onClick={(e) => {
                        e.stopPropagation()
                    }}>
                        <ContentPanel style={{
                            maxHeight: "90vh",
                            height: "100%",
                            minWidth: "20vw",
                            maxWidth: "80vw",
                            overflowY: "auto",
                            width: maximised ? "90vw" : "100%"
                        }}>
                            <ContentPanelTitle>
                                <FlexBox style={{ maxWidth: "18px" }}>
                                    <ContentPanelTitleIcon>
                                        {
                                            titleIcon
                                                ?
                                                [titleIcon]
                                                :
                                                <VscDiffAdded />
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
                            <ContentPanelBody style={{ ...contentBodyStyle, overflow: "auto" }}>
                                <FlexBox className="col gap">
                                    {displayAlert ?
                                        <Alert severity="error" variant="filled" onClose={() => { setDisplayAlert(false) }}>{alertMessage}</Alert>
                                        : <></>}
                                    {children}
                                </FlexBox>
                            </ContentPanelBody>
                            {buttons ?
                                <div>
                                    <ContentPanelFooter>
                                        <FlexBox className="gap modal-buttons-container" style={{ flexDirection: "row-reverse" }}>
                                            {buttons}
                                        </FlexBox>
                                    </ContentPanelFooter>
                                </div>
                                : <></>}
                        </ContentPanel>
                    </div>
                </FlexBox>
            </div>
        </>
    )
}



// export function ButtonDefinition(label, onClick, buttonProps, errFunc, closesModal, async, validate) {
//     return {
//         label: label,
//         onClick: onClick,
//         buttonProps: buttonProps,
//         errFunc: errFunc,
//         closesModal: closesModal,
//         async: async,
//         validate: validate
//     }
// }

export interface KeyDownDefinition {
    code: string,
    fn: (...e: any) => any
    errFunc: (...e: any) => any
    closeModal?: boolean
    id?: string
}
// KeyDownDefinition :
// code : Target Key Event
// fn : onClose function
// closeModal : Whether to close modal after fn()
// id : target element id to listen on. If undefined listener is global
// export function KeyDownDefinition(code, fn, errFunc, closeModal, targetElementID) {
//     return {
//         code: code,
//         fn: fn,
//         errFunc: errFunc,
//         closeModal: closeModal,
//         id: targetElementID,
//     }
// }

export interface ButtonDefinition {
    label: string
    onClick?: (...e: any) => any
    buttonProps: ButtonProps
    errFunc?: (...e: any) => any
    closesModal?: boolean
    validate?: boolean
}

function generateButtons(
    onClose: (...e: any) => any,
    setDisplayAlert: React.Dispatch<React.SetStateAction<boolean>>,
    setAlertMessage: React.Dispatch<React.SetStateAction<string>>,
    actionButtons: ButtonDefinition[],
    validateResults: {
        tips: string[];
        valid: boolean;
    }) {

    // label, onClick, classList, closesModal, async


    let out = [];
    for (let i = 0; i < actionButtons.length; i++) {

        let btn = actionButtons[i];

        let onClick = async () => {
            try {
                if (btn.onClick){
                    await btn.onClick()
                }

                if (btn.closesModal) {
                    onClose()
                } else {
                    setAlertMessage("")
                    setDisplayAlert(false)
                }
            } catch (e) {
                if (btn.errFunc){
                    await btn.errFunc()
                }
                
                if (e instanceof Error) {
                    setAlertMessage(e.message)
                } else {
                    //TODO: HANDLE BAD ERROR
                }
                setDisplayAlert(true)
            }

        }

        out.push(
            <Button
                variant='outlined'
                color='info'
                key={Array(5).fill(0).map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.random() * 62)).join("")}
                disabledTooltip={`${validateResults.tips.join(", ")}`}
                disabled={!validateResults.valid && btn.validate}
                onClick={onClick}
                {...btn.buttonProps}>
                <div>{btn.label}</div>
            </Button>
        )
    }

    return out
} 