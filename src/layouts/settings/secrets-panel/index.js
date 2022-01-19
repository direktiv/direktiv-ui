import React, {useEffect, useState} from 'react';
import './style.css';
import AddValueButton from '../../../components/add-button';
import ContentPanel, {ContentPanelTitle, ContentPanelTitleIcon, ContentPanelBody } from '../../../components/content-panel';
import {VscLock, VscTrash} from 'react-icons/vsc'
import Modal, {ButtonDefinition, KeyDownDefinition} from '../../../components/modal';
import {useDropzone} from 'react-dropzone'
import FlexBox from '../../../components/flexbox';
import Alert from '../../../components/alert';
import {useSecrets} from 'direktiv-react-hooks'
import {Config, GenerateRandomKey} from '../../../util'
import HelpIcon from '../../../components/help';
import Tabs from '../../../components/tabs'
import DirektivEditor from '../../../components/editor';
import * as yup from "yup";


function SecretsPanel(props){
    const {namespace} = props

    const [keyValue, setKeyValue] = useState("")
    const [file, setFile] = useState(null)
    const [vValue, setVValue] = useState("")
    const {data, createSecret, deleteSecret, getSecrets} = useSecrets(Config.url, namespace, localStorage.getItem("apikey"))

    // createErr is the error when creating a secret

    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const secretValidationSchema = yup.object().shape({
        secretKey: yup.string().required(),
        secretValue: yup.string().required()
    })

    useEffect(() => {

        secretValidationSchema.isValid({secretKey: keyValue, secretValue: vValue})
            .then((result) => setIsButtonDisabled(!result))

    },[secretValidationSchema, keyValue, vValue])

    return (
        <ContentPanel style={{ height: "100%", minHeight: "180px", width: "100%" }}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscLock />
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Secrets
                    </div>
                    <HelpIcon msg={"Encrypted key/value pairs that can be referenced within workflows. Suitable for storing sensitive information (such as tokens) for use in workflows."} />
                </FlexBox>
                <div>
                    <Modal title="New secret" 
                        escapeToCancel
                        titleIcon={<VscLock/>}

                        onOpen={() => {
                        }}

                        onClose={()=>{
                            setKeyValue("")
                            setVValue("")
                            setFile(null)
                        }}
                        
                        button={(
                            <AddValueButton label=" " />
                        )}
                        actionButtons={[
                            ButtonDefinition("Add", async () => {
                                try {
                                    await createSecret(keyValue, vValue)
                                    getSecrets()
                                } catch(err) {
                                    return err
                                }
                            }, `small ${isButtonDisabled ? "disabled": "blue"}`, true, true),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", true, false)
                        ]}
                    >
                         <Tabs 
            style={{minHeight: "100px", minWidth: "400px"}}
            headers={["Manual", "Upload"]}
            tabs={[(     
                <AddSecretPanel keyValue={keyValue} vValue={vValue} setKeyValue={setKeyValue} setVValue={setVValue} />
            ),(
                <FlexBox id="file-picker" className="col gap" style={{fontSize: "12px"}}>
                    <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                    <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter key" />
                    </div>
                    <FlexBox id="file-picker" className="gap">
                        <SecretFilePicker file={file} setFile={setFile} id="add-secret-panel"/>
                    </FlexBox>
                </FlexBox>
            )]}
        />
                    </Modal>
                </div>
            </ContentPanelTitle>
            <ContentPanelBody className="secrets-panel">
                <FlexBox className="gap col">
                    <FlexBox className="secrets-list"> 
                    {data !== null ? 
                        <Secrets deleteSecret={deleteSecret} getSecrets={getSecrets} secrets={data}  />: ""}
                    </FlexBox>
                    <div>
                        <Alert>Once a secret is removed, it can never be restored.</Alert>
                    </div>
                </FlexBox>
            </ContentPanelBody>
        </ContentPanel>
    )
}

export default SecretsPanel;

export function SecretFilePicker(props) {
    const {file, setFile, id} = props

    const onDrop = acceptedFiles => {
        setFile(acceptedFiles[0])
    }
    
    const {getRootProps, getInputProps} = useDropzone({onDrop, multiple: false})

    return (
        <div {...getRootProps()} className="file-input" id={id} style={{display:"flex", flex:"auto", flexDirection:"column"}} >
            <div>
                <input {...getInputProps()} />
                <p>Drag 'n' drop the file here, or click to select file</p>
                {
                    file !== null ?
                    <p style={{margin:"0px"}}>Selected file: '{file.path}'</p>
                    :
                    ""
                }
            </div>
        </div>
    )
}

function Secrets(props) {
    const {secrets, deleteSecret, getSecrets} = props

    return(
        <>
            <FlexBox className="col gap" style={{ maxHeight: "236px", overflowY: "auto" }}>
                    {secrets.length === 0 ?
                             <FlexBox className="secret-tuple empty-content" >
                             <FlexBox className="key">No secrets are stored...</FlexBox>
                             <FlexBox className="val"></FlexBox>
                             <FlexBox className="actions">
                             </FlexBox>
                         </FlexBox>
                    :
                    <>
                    {secrets.map((obj)=>{

                        let key = GenerateRandomKey("secret-")

                        return (
                            <FlexBox className="secret-tuple" key={key} id={key}>
                                <FlexBox className="key">{obj.node.name}</FlexBox>
                                <FlexBox className="val"><span>******</span></FlexBox>
                                <FlexBox className="actions">
                                    <Modal 
                                        escapeToCancel
                                        style={{
                                            flexDirection: "row-reverse",
                                            marginRight: "8px"
                                        }}
                                        titleIcon={<VscLock/>}
                                        title="Remove secret" 
                                        button={(
                                            <SecretsDeleteButton/>
                                        )} 
                                        actionButtons={
                                            [
                                                // label, onClick, classList, closesModal, async
                                                ButtonDefinition("Delete", async () => {
                                                    try { 
                                                        await deleteSecret(obj.node.name)
                                                        await getSecrets()
                                                    } catch(err) {
                                                        await getSecrets()
                                                        return err
                                                    }
                                                }, "small red", true, false),
                                                ButtonDefinition("Cancel", () => {
                                                }, "small light", true, false)
                                            ]
                                        }   
                                    >
                                        <FlexBox className="col gap">
                                            <FlexBox >
                                                Are you sure you want to delete '{obj.node.name}'?
                                                <br/>
                                                This action cannot be undone.
                                            </FlexBox>
                                        </FlexBox>
                                    </Modal>
                                </FlexBox>
                            </FlexBox>
                        )
                    })}</>}
            </FlexBox>
        </>
    );
}

export function SecretsDeleteButton(props) {
    return (
        <div className="secrets-delete-btn red-text">
            <VscTrash />
        </div>
    )
}

function AddSecretPanel(props) {
    const {keyValue, vValue, setKeyValue, setVValue} = props

    return (
        <FlexBox className="col gap" style={{fontSize: "12px"}}>
            <FlexBox className="gap" style={{margin: "-8px 0 -6px 0"}}>
                Secret Key
                <span className="required-label">*</span>
            </FlexBox>
            <FlexBox className="gap">
                <FlexBox>
                    <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter key" />
                </FlexBox>
            </FlexBox>
            <FlexBox className="gap" style={{margin: "-8px 0 -8px 0"}}>
                Secret Value
                <span className="required-label">*</span>
            </FlexBox>
            <FlexBox className="gap">
                <FlexBox style={{overflow:"hidden"}}>
                    <DirektivEditor dValue={vValue} setDValue={setVValue}  width={600} height={180}/>
                    </FlexBox>
            </FlexBox>
        </FlexBox>
    );
}