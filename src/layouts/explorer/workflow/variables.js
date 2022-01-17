import { useWorkflowVariables } from 'direktiv-react-hooks';
import React, {useEffect, useState} from 'react';
import { BsUpload } from 'react-icons/bs';
import { IoMdLock } from 'react-icons/io';
import { IoCloudDownloadOutline, IoEyeOutline, IoRefresh } from 'react-icons/io5';
import { RiDeleteBin2Line } from 'react-icons/ri';
import AddValueButton from '../../../components/add-button';
import Button from '../../../components/button';
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from '../../../components/content-panel';
import DirektivEditor from '../../../components/editor';
import FlexBox from '../../../components/flexbox';
import Modal, { ButtonDefinition } from '../../../components/modal';
import Tabs from '../../../components/tabs';
import { Config } from '../../../util';
import { VariableFilePicker } from '../../settings/variables-panel';
import { AutoSizer } from 'react-virtualized';
import * as yup from "yup";

function AddWorkflowVariablePanel(props) {

    const {namespace, workflow} = props
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

    let wfVar = workflow.substring(1)

    const {data, setWorkflowVariable, getWorkflowVariable, deleteWorkflowVariable} = useWorkflowVariables(Config.url, true, namespace, wfVar, localStorage.getItem("apikey"))

    if (data === null) {
        return <></>
    }

    const onTabChanged = (tab) => {
        setCurrentTab(tab)
    }

    let uploadingBtn = "small green"
    if (uploading) {
        uploadingBtn += " btn-loading"
    }

    const manualActionButtons = [
        ButtonDefinition("Add", async () => {
            if (!isManualButtonDisabled) {
                return manualValidationSchema.validate({ manualVariableName: keyValue, data: dValue }, { abortEarly: false })
                    .then(async function() {
                        setUploading(true)
                        let err = await setWorkflowVariable(keyValue, file, mimeType)
                        if (err) {
                            setUploading(false)
                            return err
                        }
                    }).catch(function (err) {
                        if (err.inner.length > 0) {
                            return err.inner[0].message
                        }
                    });
            }
        }, `small ${isManualButtonDisabled ? "disabled" : uploadingBtn}`, true, false),
        ButtonDefinition("Cancel", () => {
        }, "small light", true, false)
    ];

    const uploadActionButtons = [
        ButtonDefinition("Add", async () => {
            if (!isUploadButtonDisabled) {
                return uploadValidationSchema.validate({ uploadVariableName: keyValue, file: file }, { abortEarly: false })
                    .then(async function() {
                        let err = await setWorkflowVariable(keyValue, dValue, mimeType)
                        if (err) return err
                    }).catch(function (err) {
                        if (err.inner.length > 0) {
                            return err.inner[0].message
                        }
                    });
            }
        }, `small ${isUploadButtonDisabled ? "disabled" : uploadingBtn}`, true, false),
        ButtonDefinition("Cancel", () => {
        }, "small light", true, false)
    ];

    const chooseSubmitButton = (currentTab) => {
        if (currentTab === "Upload") {
            return uploadActionButtons
        } else if (currentTab === "Manual") {
            return manualActionButtons
        }
    }

    return(
        <ContentPanel style={{width: "100%", height: "100%"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <IoMdLock/>
                </ContentPanelTitleIcon>
                Variables
                    <Modal title="New variable" 
                        escapeToCancel
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
            </ContentPanelTitle>
            <ContentPanelBody>
            <Variables namespace={namespace} deleteWorkflowVariable={deleteWorkflowVariable} setWorkflowVariable={setWorkflowVariable} getWorkflowVariable={getWorkflowVariable} variables={data}/>
            </ContentPanelBody>
        </ContentPanel>
    )
}

export default AddWorkflowVariablePanel;

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
                    <div style={{width: "100%", display: "flex"}}>
                        <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter variable key name" />
                    </div>
                    <FlexBox className="gap" style={{margin: "-8px 0 5px 0", maxHeight: 30}}>
                        Mimetype
                    </FlexBox>
                    <div style={{width: "100%", display: "flex"}}>
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
                    <FlexBox className="gap" style={{display: "flex", alignItems: "center", margin: "0 0 5px 0", fontSize: "12px", fontWeight: "bold", maxHeight: "20px"}}>
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

    const {variables, namespace, getWorkflowVariable, setWorkflowVariable, deleteWorkflowVariable} = props;

    return(
        <FlexBox>
            {variables.length === 0  ? <div style={{paddingLeft:"10px", fontSize:"10pt"}}>No variables are stored...</div>:
            <div>
                <table className="variables-table">
                    <tbody>
                        {variables.map((obj)=>{
                            return(
                                <Variable namespace={namespace} obj={obj} getWorkflowVariable={getWorkflowVariable} deleteWorkflowVariable={deleteWorkflowVariable} setWorkflowVariable={setWorkflowVariable}/>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            }
        </FlexBox>
    );
}

function Variable(props) {
    const {obj, getWorkflowVariable, setWorkflowVariable, deleteWorkflowVariable} = props
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
                    title="View Variable" 
                    onClose={()=>{
                        setType("")
                        setValue("")
                    }}
                    onOpen={async ()=>{
                        let data = await getWorkflowVariable(obj.node.name)
                        setType(data.contentType)
                        setValue(data.data)
                    }}
                    button={(
                        <Button className="reveal-btn small shadow">
                            <FlexBox className="gap">
                                <IoEyeOutline className="auto-margin" />
                                <div>
                                    Show <span className="hide-on-small">value</span>
                                </div>
                            </FlexBox>
                        </Button>
                    )}
                    actionButtons={
                        [
                            ButtonDefinition("Save", async () => {
                                let err = await setWorkflowVariable(obj.node.name, val , mimeType)
                                if (err) {
                                    return err
                                }
                            }, "small blue", true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", true, false)
                        ]
                    } 
                >
                    <FlexBox className="col gap" style={{fontSize: "12px", width: "580px", minHeight: "500px"}}>
                        <FlexBox className="gap" style={{flexGrow: 1}}>
                            <FlexBox style={{overflow:"hidden"}}>
                            <AutoSizer>
                                {({height, width})=>(
                                <DirektivEditor dlang={lang} width={width} dvalue={val} setDValue={setValue} height={height}/>
                                )}
                            </AutoSizer>
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
                </Modal>:<div>"Cannot show filesize greater than 2.5MiB"</div>}
        </td>
        <td style={{ width: "80px", maxWidth: "80px", textAlign: "center" }}>{fileSize(obj.node.size)}</td>
        <td style={{ width: "120px", maxWidth: "120px", paddingLeft: "12px" }}> 
            <FlexBox style={{gap: "2px"}}>
                <FlexBox>
                    
                    {!downloading? 
                    <VariablesDownloadButton onClick={async()=>{
                        setDownloading(true)
                        let resp = await getWorkflowVariable(obj.node.name)
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
                </FlexBox>
                <Modal
                    escapeToCancel
                    style={{
                        flexDirection: "row-reverse",
                    }}
                    onClose={()=>{
                        setFile(null)
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
                                            let err = await setWorkflowVariable(obj.node.name, file, mimeType)
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
                            }, `small ${isButtonDisabled ? "disabled": uploadingBtn}`, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", true, false)
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
                                let err = await deleteWorkflowVariable(obj.node.name)
                                if (err) return err
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
        </td>
    </tr>
    )
}

function VariablesUploadButton() {
    return (
        <div className="secrets-delete-btn grey-text auto-margin" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <BsUpload className="auto-margin"/>
        </div>
    )
}

function VariablesDownloadButton(props) {
    const {onClick} = props

    return (
        <div onClick={onClick} className="secrets-delete-btn grey-text auto-margin" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <IoCloudDownloadOutline/>
        </div>
    )
}

function VariablesDownloadingButton(props) {

    return (
        <div className="secrets-delete-btn grey-text auto-margin" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <IoRefresh style={{animation: "spin 2s linear infinite"}}/>
        </div>
    )
}


function VariablesDeleteButton() {
    return (
        <div className="secrets-delete-btn grey-text auto-margin red-text" style={{display: "flex", alignItems: "center", height: "100%"}}>
            <RiDeleteBin2Line className="auto-margin"/>
        </div>
    )
}

function fileSize(size) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}