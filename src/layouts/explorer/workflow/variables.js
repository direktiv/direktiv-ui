import { useWorkflowVariables } from 'direktiv-react-hooks';
import { useCallback, useEffect, useState } from 'react';

import { VscCloudDownload, VscCloudUpload, VscEye, VscLoading, VscTrash, VscVariableGroup } from 'react-icons/vsc';

import Tippy from '@tippyjs/react';
import { saveAs } from 'file-saver';
import { AutoSizer } from 'react-virtualized';
import { SearchBar } from '..';
import AddValueButton from '../../../components/add-button';
import Button from '../../../components/button';
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from '../../../components/content-panel';
import DirektivEditor from '../../../components/editor';
import FlexBox from '../../../components/flexbox';
import HelpIcon from "../../../components/help";
import Modal, { ButtonDefinition } from '../../../components/modal';
import Pagination from '../../../components/pagination';
import Tabs from '../../../components/tabs';
import { CanPreviewMimeType, Config, MimeTypeFileExtension } from '../../../util';
import { VariableFilePicker } from '../../settings/variables-panel';

const PAGE_SIZE = 10 ;

function AddWorkflowVariablePanel(props) {

    const {namespace, workflow} = props
    const [keyValue, setKeyValue] = useState("")
    const [dValue, setDValue] = useState("")
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [mimeType, setMimeType] = useState("application/json")
    const [varParam, setVarParam] = useState([`first=${PAGE_SIZE}`])
    const [search, setSearch] = useState("")
    const updateVarPage = useCallback((newParam)=>{
        setVarParam([...newParam])
    }, [])

    let wfVar = workflow.substring(1)

    const {data, pageInfo, totalCount, setWorkflowVariable, getWorkflowVariable, getWorkflowVariableBlob, deleteWorkflowVariable} = useWorkflowVariables(Config.url, true, namespace, wfVar, localStorage.getItem("apikey"), ...varParam, `filter.field=NAME`, `filter.val=${search}`, `filter.type=CONTAINS`)

    // Reset pagination queries when searching
    useEffect(()=>{
        setVarParam([`first=${PAGE_SIZE}`])
    },[search])

    if (data === null) {
        return <></>
    }

    return(
        <ContentPanel style={{width: "100%", height: "100%"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscVariableGroup/>
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Variables
                    </div>
                    <HelpIcon msg={"List of variables for that workflow."} />
                </FlexBox>
                <FlexBox className="row gap" >
                    <FlexBox className="row center" style={{justifyContent: "flex-end"}}>
                        <SearchBar setSearch={setSearch} style={{height: "26px"}}/>
                    </FlexBox>
                    <Modal title="New variable" 
                        modalStyle={{width: "600px"}}
                        style={{maxWidth:"42px"}}
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
                        actionButtons={[
                            ButtonDefinition("Add", async () => {
                                if(document.getElementById("file-picker")){
                                    setUploading(true)
                                    await setWorkflowVariable(encodeURIComponent(keyValue), file, mimeType)
                                } else {
                                    await setWorkflowVariable(encodeURIComponent(keyValue), dValue, mimeType)
                                }
                            }, `small ${uploading ? "loading" : ""}`, ()=>{setUploading(false)}, true, false, true),
                            ButtonDefinition("Cancel", () => {
                            }, "small light",()=>{}, true, false)
                        ]}

                        requiredFields={[
                            {tip: "variable key name is required", value: keyValue}
                        ]}
                    >
                        <AddVariablePanel mimeType={mimeType} setMimeType={setMimeType} file={file} setFile={setFile} setKeyValue={setKeyValue} keyValue={keyValue} dValue={dValue} setDValue={setDValue}/>
                    </Modal>
                    </FlexBox>
            </ContentPanelTitle>
            <ContentPanelBody>
                {data !== null ?
                <FlexBox className="col">
                    <div>
                    <Variables namespace={namespace} deleteWorkflowVariable={deleteWorkflowVariable} setWorkflowVariable={setWorkflowVariable} getWorkflowVariable={getWorkflowVariable} getWorkflowVariableBlob={getWorkflowVariableBlob} variables={data}/>
                    </div>
                    <Pagination
                    pageSize={PAGE_SIZE}
                    total={totalCount}
                    pageInfo={pageInfo}
                    updatePage={updateVarPage}
                    />
                </FlexBox>:<></>}
            </ContentPanelBody>
        </ContentPanel>
    )
}

export default AddWorkflowVariablePanel;

function AddVariablePanel(props) {
    const {keyValue, setKeyValue, dValue, setDValue, file, setFile, mimeType, setMimeType} = props

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
            tabs={[(
                <FlexBox id="written" className="col gap" style={{fontSize: "12px", minWidth: "300px"}}>
                    <div style={{width: "100%", display: "flex"}}>
                        <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter variable key name" />
                    </div>
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
                    <div style={{width: "100%", display: "flex"}}>
                        <input value={keyValue} onChange={(e)=>setKeyValue(e.target.value)} autoFocus placeholder="Enter variable key name" />
                    </div>
                    <FlexBox className="gap">
                        <VariableFilePicker setKeyValue={setKeyValue} setMimeType={setMimeType} mimeType={mimeType} file={file} setFile={setFile} id="add-variable-panel" />
                    </FlexBox>
                </FlexBox>
            )]}
        />
    )
}

function Variables(props) {

    const {variables, namespace, getWorkflowVariable, setWorkflowVariable, deleteWorkflowVariable, getWorkflowVariableBlob} = props;

    return(
        <FlexBox>
            {variables.length === 0  ? <div style={{paddingLeft:"10px", fontSize:"10pt"}}>No variables are stored...</div>:
            <table className="variables-table">
                <tbody>
                    {variables.map((obj)=>{
                        return(
                            <Variable namespace={namespace} obj={obj} getWorkflowVariableBlob={getWorkflowVariableBlob} getWorkflowVariable={getWorkflowVariable} deleteWorkflowVariable={deleteWorkflowVariable} setWorkflowVariable={setWorkflowVariable}/>
                        )
                    })}
                </tbody>
            </table>
            }
        </FlexBox>
    );
}

function Variable(props) {
    const {obj, getWorkflowVariable, setWorkflowVariable, deleteWorkflowVariable, getWorkflowVariableBlob} = props
    const [val, setValue] = useState("")
    const [mimeType, setType] = useState("")
    const [file, setFile] = useState(null)
    const [downloading, setDownloading] = useState(false)
    const [uploading, setUploading] = useState(false)

    let lang = MimeTypeFileExtension(mimeType)

    return(
        <tr className="body-row" key={`var-${obj.node.name}${obj.node.size}`}>
        <td className="wrap-word variable-name" style={{ width: "180px", maxWidth: "180px", textOverflow:"ellipsis",  overflow:"hidden" }}>
            <Tippy content={obj.node.name} trigger={'mouseenter focus'} zIndex={10}>
                <div className={"variable-name"} style={{width: "fit-content", maxWidth: "180px", textOverflow:"ellipsis",  overflow:"hidden"}}>
                    {obj.node.name}
                </div>
            </Tippy>
        </td>
        <td className="muted-text show-variable">
            {obj.node.size <= 2500000 ? 
                <Modal
                    modalStyle={{height: "90vh",width: "600px"}}
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
                        <Button className="light small bold">
                            <FlexBox className="gap">
                                <VscEye className="auto-margin" />
                                <div>
                                    Show <span className="hide-600">value</span>
                                </div>
                            </FlexBox>
                        </Button>
                    )}
                    actionButtons={
                        [
                            ButtonDefinition("Save", async () => {
                                await setWorkflowVariable(obj.node.name, val , mimeType)
                            }, "small", ()=>{}, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", ()=>{}, true, false)
                        ]
                    } 
                >
                    <FlexBox className="col gap" style={{fontSize: "12px",minHeight: "500px"}}>
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
                </Modal>:<div style={{textAlign:"center"}}>Cannot show filesize greater than 2.5MiB</div>}
        </td>
        <td style={{ width: "80px", maxWidth: "80px", textAlign: "center" }}>{fileSize(obj.node.size)}</td>
        <td style={{ width: "120px", maxWidth: "120px", paddingLeft: "12px" }}> 
            <FlexBox style={{gap: "2px"}}>
                <FlexBox>
                    
                    {!downloading? 
                    <VariablesDownloadButton onClick={async()=>{
                        setDownloading(true)

                        const variableData = await getWorkflowVariableBlob(obj.node.name)
                        const extension = MimeTypeFileExtension(variableData.contentType)
                        saveAs(variableData.data, obj.node.name + `${extension ? `.${extension}`: ""}`)

                        setDownloading(false)
                    }}/>:<VariablesDownloadingButton />}
                </FlexBox>
                <Modal
                    modalStyle={{width: "500px"}}
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
                                setUploading(true)
                                await setWorkflowVariable(obj.node.name, file, mimeType)
                            }, `small ${uploading ? "loading" : ""}`, ()=>{setUploading(false)}, true, false, true),
                            ButtonDefinition("Cancel", () => {
                            }, "small light",()=>{}, true, false)
                        ]
                    } 

                    requiredFields={[
                        {tip: "file is required", value: file}
                    ]}
                >
                    <FlexBox className="col gap">
                        <VariableFilePicker setMimeType={setType} id="modal-file-picker" file={file} setFile={setFile} />
                    </FlexBox>
                </Modal>
                <Modal
                    escapeToCancel
                    style={{
                        flexDirection: "row-reverse",
                    }}
                    modalStyle={{width: "400px"}}
                    title="Delete a variable" 
                    button={(
                        <VariablesDeleteButton/>
                    )}
                    actionButtons={
                        [
                            ButtonDefinition("Delete", async () => {
                                    await deleteWorkflowVariable(obj.node.name)
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
    if (size <= 0) {
        return "0 B"
    }
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}