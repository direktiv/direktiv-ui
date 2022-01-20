import React, {useCallback, useEffect, useState} from 'react';
import './style.css';
import ContentPanel, {ContentPanelTitle, ContentPanelTitleIcon, ContentPanelBody } from '../../../components/content-panel';
import FlexBox from '../../../components/flexbox';
import Modal, { ButtonDefinition } from '../../../components/modal';
import AddValueButton from '../../../components/add-button';
import { useNamespaceVariables } from 'direktiv-react-hooks';
import { Config, CanPreviewMimeType } from '../../../util';
import DirektivEditor from '../../../components/editor';
import Button from '../../../components/button';
import {useDropzone} from 'react-dropzone'
import Tabs from '../../../components/tabs';
import HelpIcon from '../../../components/help';
import { VscCloudDownload, VscCloudUpload, VscEye, VscLoading, VscTrash, VscVariableGroup } from 'react-icons/vsc';
import { AutoSizer } from 'react-virtualized';
import * as yup from "yup";

function VariablesPanel(props){

    const {namespace} = props
    const [keyValue, setKeyValue] = useState("")
    const [dValue, setDValue] = useState("")
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [mimeType, setMimeType] = useState("application/json")
    const [isManualButtonDisabled, setIsManualButtonDisabled] = useState(false)
    const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(false)
    const [currentTab, setCurrentTab] = useState("")

    const manualValidationSchema = yup.object().shape({
        manualVariableName: yup.string().required(),
        data: yup.string().required()
    })

    const uploadValidationSchema = yup.object().shape({
        uploadVariableName: yup.string().required(),
        file: yup.mixed().required(),
    })

    const onTabChanged = (tab) => {
        setCurrentTab(tab)
    }

    useEffect(() => {

        if (currentTab === "Manual") {
            manualValidationSchema.isValid({ manualVariableName: keyValue, data: dValue })
                .then((result) => setIsManualButtonDisabled(!result))
        }

        if (currentTab === "Upload") {
            uploadValidationSchema.isValid({ uploadVariableName: keyValue, file: file })
                .then((result) => setIsUploadButtonDisabled(!result))
        }

    },[manualValidationSchema, uploadValidationSchema, keyValue, dValue, file, currentTab])

    const {data, err, setNamespaceVariable, getNamespaceVariable, deleteNamespaceVariable} = useNamespaceVariables(Config.url, true, namespace, localStorage.getItem("apikey"))

    // something went wrong with error listing for variables
    if(err !== null){
        console.log(err, 'handle variable list error')
    }

    let uploadingBtn = "small green"
    if (uploading) {
        uploadingBtn += " btn-loading"
    }

    const manualActionButtons = [
        ButtonDefinition("Add", async () => {
            try {
                setUploading(true)
                await setNamespaceVariable(keyValue, file, mimeType)
            } catch(err) {
                setUploading(false)
                return err
            }
        }, `small ${isManualButtonDisabled ? "disabled" : uploadingBtn}`, true, true),
        ButtonDefinition("Cancel", () => {
        }, "small light", ()=>{}, true, false)
    ];

    const uploadActionButtons = [
        ButtonDefinition("Add", async () => {
            try {
                await setNamespaceVariable(keyValue, dValue, mimeType)
            } catch(err) {
                return err
            }
        }, `small ${isUploadButtonDisabled ? "disabled" : uploadingBtn}`, true, true),
        ButtonDefinition("Cancel", () => {
        }, "small light", ()=>{},true, false)
    ];

    const chooseSubmitButton = (currentTab) => {
        console.log(currentTab);
        if (currentTab === "Upload") {
            return uploadActionButtons
        } else if (currentTab === "Manual") {
            return manualActionButtons
        }
    }

    return (
        <ContentPanel style={{width: "100%"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscVariableGroup/>
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Variables
                    </div>
                    <HelpIcon msg={"Unencrypted key/value pairs that can be referenced within workflows."} />
                </FlexBox>
                <div>
                    <Modal title="New variable" 
                        escapeToCancel
                        titleIcon={<VscVariableGroup/>}
                        button={(
                            <AddValueButton label=" " />
                        )}  
                        onClose={()=>{
                            setKeyValue("")
                            setDValue("")
                            setFile(null)
                            setUploading(false)
                            setMimeType("application/json")
                        }}
                        actionButtons={chooseSubmitButton(currentTab)}
                    >
                        <AddVariablePanel onTabChanged={onTabChanged} mimeType={mimeType} setMimeType={setMimeType} file={file} setFile={setFile} setKeyValue={setKeyValue} keyValue={keyValue} dValue={dValue} setDValue={setDValue}/>
                    </Modal>
                </div>
            </ContentPanelTitle>
            <ContentPanelBody style={{minHeight:"180px"}}>
                {data !== null ?
                <div>
                    <Variables namespace={namespace} deleteNamespaceVariable={deleteNamespaceVariable} setNamespaceVariable={setNamespaceVariable} getNamespaceVariable={getNamespaceVariable} variables={data}/>
                </div>:""}
            </ContentPanelBody>
        </ContentPanel>
    )
}

export default VariablesPanel;


export function VariableFilePicker(props) {
    const {file, setFile, id, setMimeType} = props

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0])
        setMimeType(acceptedFiles[0].type)
    },[setFile, setMimeType])
    
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

function AddVariablePanel(props) {
    const {keyValue, setKeyValue, dValue, setDValue, file, setFile, mimeType, setMimeType, onTabChanged} = props

    let lang = ""

    switch(mimeType){
    case "application/json":
        lang = "json"
        break
    case "application/x-sh":
        lang = "shell"
        break
    case "text/html":
        lang = "html"
        break
    case "text/css":
        lang = "css"
        break
    case "application/yaml":
        lang = "yaml"
        break
    default:
        lang = "plain"
    }

    return(
        <Tabs 
            style={{minHeight: "500px", minWidth: "90%"}}
            headers={["Manual", "Upload"]}
            onTabChanged={onTabChanged}
            tabs={[(
                <FlexBox id="written" className="col gap" style={{fontSize: "12px", width: "35vw"}}>
                    <FlexBox className="gap" style={{margin: "-9px 0 5px 0", maxHeight: 30}}>
                        Name
                        <span className="required-label">*</span>
                    </FlexBox>
                    <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                        <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter variable key name" />
                    </div>
                    <FlexBox className="gap" style={{margin: "-8px 0 5px 0", maxHeight: 30}}>
                        Mimetype
                    </FlexBox>
                    <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                        <select style={{width:"100%"}} defaultValue={mimeType} onChange={(e)=>setMimeType(e.target.value)}>
                            <option value="">Choose a mimetype</option>
                            <option value="application/json">json</option>
                            <option value="application/yaml">yaml</option>
                            <option value="application/x-sh">shell</option>
                            <option value="text/plain">plaintext</option>
                            <option value="text/html">html</option>
                            <option value="text/css">css</option>
                        </select>
                    </div>
                    <FlexBox className="gap" style={{margin: "-9px 0 5px 0", maxHeight: 30}}>
                        Data
                        <span className="required-label">*</span>
                    </FlexBox>
                    <FlexBox className="gap" style={{maxHeight: "600px"}}>
                        <FlexBox style={{overflow:"hidden"}}>
                        <AutoSizer>
                            {({height, width})=>(
                            <DirektivEditor dlang={lang} width={width} dvalue={dValue} setDValue={setDValue} height={height}/>
                            )}
                        </AutoSizer>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
            ),(
                <FlexBox id="file-picker" className="col gap" style={{fontSize: "12px"}}>
                    <FlexBox className="gap" style={{display: "flex", alignItems: "center", margin: "0 0 4px 0", fontSize: "12px", fontWeight: "bold", maxHeight: "20px"}}>
                        Name
                        <span className="required-label">*</span>
                    </FlexBox>
                    <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                        <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter variable key name" />
                    </div>
                    <FlexBox className="gap" style={{display: "flex", alignItems: "center", margin: "3px 0 3px 0", fontSize: "12px", fontWeight: "bold", maxHeight: "20px"}}>
                        Data
                        <span className="required-label">*</span>
                    </FlexBox>
                    <FlexBox className="gap">
                        <VariableFilePicker setKeyValue={setKeyValue} setMimeType={setMimeType} mimeType={mimeType} file={file} setFile={setFile} id="add-variable-panel" />
                    </FlexBox>
                </FlexBox>
            )]}
        />
    )
}

function Variables(props) {
    const {variables, namespace, getNamespaceVariable, setNamespaceVariable, deleteNamespaceVariable} = props

    return(
        <FlexBox>
            {variables.length === 0  ? <div style={{paddingLeft:"10px", fontSize:"10pt"}}>No variables are stored...</div>:
            <table className="variables-table" style={{width: "100%"}}>
                <tbody>
                 
                    {variables.map((obj)=>{
                        return(
                            <Variable namespace={namespace} obj={obj} getNamespaceVariable={getNamespaceVariable} deleteNamespaceVariable={deleteNamespaceVariable} setNamespaceVariable={setNamespaceVariable}/>
                        )
                    })}
                </tbody>
            </table>}
        </FlexBox>
    );
}

function Variable(props) {
    const {obj, getNamespaceVariable, setNamespaceVariable, deleteNamespaceVariable} = props
    const [val, setValue] = useState("")
    const [mimeType, setType] = useState("")
    const [file, setFile] = useState(null)
    const [downloading, setDownloading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const variableValidationSchema = yup.object().shape({
        variableData: yup.mixed().required()
    })

    useEffect(() => {

        variableValidationSchema.isValid({ variableData: file })
            .then((result) => setIsButtonDisabled(!result))

    },[variableValidationSchema, file])

    let uploadingBtn = "small green"
    if (uploading) {
        uploadingBtn += " btn-loading"
    }
    let lang = ""
    switch(mimeType){
        case "application/json":
            lang = "json"
            break
        case "application/x-sh":
            lang = "shell"
            break
        case "text/html":
            lang = "html"
            break
        case "text/css":
            lang = "css"
            break
        case "application/yaml":
            lang = "yaml"
            break
        default:
            lang = "plain"
        }

    return(
        <tr className="body-row" key={`${obj.node.name}${obj.node.size}`}>
        <td className="wrap-word variable-name" style={{ width: "180px", maxWidth: "180px", textOverflow:"ellipsis",  overflow:"hidden" }}>{obj.node.name}</td>
        <td className="muted-text show-variable">
            {obj.node.size <= 2500000 ? 
                <Modal
                    escapeToCancel
                    style={{
                        flexDirection: "row-reverse",
                        marginRight: "8px"
                    }}
                    modalStyle={{height: "90vh"}}
                    title="View Variable" 
                    onClose={()=>{
                        setType("")
                        setValue("")
                    }}
                    onOpen={async ()=>{
                        let data = await getNamespaceVariable(obj.node.name)
                        setType(data.contentType)
                        setValue(data.data)
                    }}
                    button={(
                        <Button className="reveal-btn small shadow">
                            <FlexBox className="gap">
                                <VscEye className="auto-margin" />
                                <div>
                                    Show <span className="hide-on-small">value</span>
                                </div>
                            </FlexBox>
                        </Button>
                    )}
                    actionButtons={
                        [
                            ButtonDefinition("Save", async () => {
                                try {
                                    await setNamespaceVariable(obj.node.name, val , mimeType)
                                } catch(err) {
                                    return err
                                }
                            }, "small blue",()=>{}, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light",()=>{}, true, false)
                        ]
                    } 
                >
                    <FlexBox className="col gap" style={{fontSize: "12px", width: "580px", minHeight: "500px"}}>
                        <FlexBox className="gap" style={{flexGrow: 1}}>
                            <FlexBox style={{overflow:"hidden"}}>
                                {CanPreviewMimeType(mimeType) ?                                
                                <AutoSizer>
                                    {({height, width})=>(
                                    <DirektivEditor dlang={lang} width={width} dvalue={val} setDValue={setValue} height={height}/>
                                    )}
                                </AutoSizer>
                                :
                                <div style={{width: "100%", display:"flex", justifyContent: "center", alignItems:"center"}}>
                                    <p style={{fontSize:"11pt"}}>
                                        Cannot preview variable with mime-type: {mimeType}
                                    </p>
                                </div>
                                }
                            </FlexBox>
                        </FlexBox>
                        <FlexBox className="gap" style={{flexGrow: 0, flexShrink: 1}}>
                            <FlexBox>
                                <select style={{width:"100%"}} defaultValue={mimeType} onChange={(e)=>setType(e.target.value)}>
                                    <option value="">Choose a mimetype</option>
                                    <option value="application/json">json</option>
                                    <option value="application/yaml">yaml</option>
                                    <option value="application/x-sh">shell</option>
                                    <option value="text/plain">plaintext</option>
                                    <option value="text/html">html</option>
                                    <option value="text/css">css</option>
                                </select>
                            </FlexBox>
                        </FlexBox>
                    </FlexBox>
                </Modal>:
                "Cannot show filesize greater than 2.5MiB"
                }
        </td>
        <td style={{ width: "80px", maxWidth: "80px", textAlign: "center" }}>{fileSize(obj.node.size)}</td>
        <td style={{ width: "120px", maxWidth: "120px", paddingLeft: "12px" }}> 
            <FlexBox style={{gap: "2px"}}>
                <FlexBox>
                    
                    {!downloading? 
                    <VariablesDownloadButton onClick={async()=>{
                        setDownloading(true)
                        let resp = await getNamespaceVariable(obj.node.name)
                        let b = new Blob([resp.data], {type:resp.contentType})
                        let url = URL.createObjectURL(b)
                        const a = document.createElement('a');
                        a.href = url
                        a.download = obj.node.name

                        const clickHandler = () => {
                            setTimeout(() => {
                                URL.revokeObjectURL(url);
                                a.removeEventListener('click', clickHandler);
                            }, 150);
                        };

                        a.addEventListener('click', clickHandler, false);
                        a.click();
                        setDownloading(false)
                    }}/>:<VariablesDownloadingButton />}
                    
                     {
                         // this logic could work on ee as keycloak isn't handle by me
                         // but sending an apikey via a link is impossible
                     /* <a download href={`${Config.url}/namespaces/${namespace}/vars/${obj.node.name}`}>
                        <VariablesDownloadButton/>
                     </a> */}
                </FlexBox>
                <Modal
                    escapeToCancel
                    style={{
                        flexDirection: "row-reverse",
                    }}
                    onClose={()=>{
                        setFile(null)
                        setUploading(false)
                    }}
                    title="Replace variable" 
                    button={(
                        <VariablesUploadButton />
                    )}
                    actionButtons={
                        [
                            ButtonDefinition("Upload", async () => {
                                if (!isButtonDisabled) {
                                    return variableValidationSchema
                                        .validate({ variableData: file }, { abortEarly: false })
                                        .then(async function() {

                                            setUploading(true)
                                            let err = await setNamespaceVariable(obj.node.name, file, mimeType)
                                            if (err) {
                                                setUploading(false)
                                                return err
                                            }
                                            setUploading(false)
                                        }).catch(function (err) {
                                            if (err.inner.length > 0) {
                                                return err.inner[0].message
                                            }
                                        });
                                }
                            }, `small ${isButtonDisabled ? "disabled": uploadingBtn}`, ()=>{setUploading(false)}, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", ()=>{}, true, false)
                        ]
                    } 
                >
                    <FlexBox className="col gap">
                        <FlexBox className="gap" style={{margin: "-8px 0 -4px 0", fontWeight: "bold"}}>
                            Data
                            <span className="required-label">*</span>
                        </FlexBox>
                        <VariableFilePicker setMimeType={setType} id="modal-file-picker" file={file} setFile={setFile} />
                    </FlexBox>
                </Modal>
                <Modal
                    escapeToCancel
                    style={{
                        flexDirection: "row-reverse",
                    }}
                    title="Delete a variable" 
                    button={(
                        <VariablesDeleteButton/>
                    )}
                    actionButtons={
                        [
                            ButtonDefinition("Delete", async () => {
                                await deleteNamespaceVariable(obj.node.name)
                            }, "small red", ()=>{}, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", ()=>{}, true, false)
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
        
        </td>
    </tr>
    )
}

function VariablesUploadButton() {
    return (
        <div className="secrets-delete-btn grey-text auto-margin" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <VscCloudUpload className="auto-margin"/>
        </div>
    )
}

function VariablesDownloadButton(props) {
    const {onClick} = props

    return (
        <div onClick={onClick} className="secrets-delete-btn grey-text auto-margin" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <VscCloudDownload/>
        </div>
    )
}

function VariablesDownloadingButton(props) {

    return (
        <div className="secrets-delete-btn grey-text auto-margin" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <VscLoading style={{animation: "spin 2s linear infinite"}}/>
        </div>
    )
}


function VariablesDeleteButton() {
    return (
        <div className="secrets-delete-btn grey-text auto-margin red-text" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <VscTrash className="auto-margin"/>
        </div>
    )
}

function fileSize(size) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}