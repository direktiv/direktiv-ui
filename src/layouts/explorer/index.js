import React, {useEffect, useState} from 'react';
import './style.css';

import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelHeaderButtonIcon, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import { VscAdd, VscClose,  VscSearch, VscEdit, VscTrash, VscFolderOpened, VscCode } from 'react-icons/vsc';
import { Config, GenerateRandomKey } from '../../util';
import { FiFolder } from 'react-icons/fi';
import { FcWorkflow } from 'react-icons/fc';
import { HiOutlineTrash } from 'react-icons/hi';
import { useNodes } from 'direktiv-react-hooks';
import { useNavigate, useParams } from 'react-router';
import Modal, {ButtonDefinition} from '../../components/modal'
import DirektivEditor from '../../components/editor';
import Button from '../../components/button';
import HelpIcon from "../../components/help"
import Loader from '../../components/loader';
import WorkflowPage from './workflow';
import { useSearchParams } from 'react-router-dom';
import WorkflowRevisions from './workflow/revision';
import WorkflowPod from './workflow/pod'
import { AutoSizer } from 'react-virtualized';
import * as yup from "yup";
import { FaAppStoreIos } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import Alert from '../../components/alert';

const apiHelps = (namespace) => {
    let url = window.location.origin
    return(
        [
            {
                method: "GET",
                url: `${url}/api/namespaces/${namespace}/tree`,
                description: `List nodes`,
            },
            {
                method: "PUT",
                description: `Create a directory`,
                url: `${url}/api/namespaces/${namespace}/tree/NODE_NAME?op=create-directory`,
                body: `{
  "type": "directory"
}`,
                type: "json"
            },
            {
                method: "PUT",
                description: `Create a workflow `,
                url: `${url}/api/namespaces/${namespace}/tree/NODE_NAME?op=create-workflow`,
                body: `description: A simple 'no-op' state that returns 'Hello world!'
states:
- id: helloworld
type: noop
transform:
    result: Hello world!`,
                type: "yaml"
            },
            {
                method: "POST",
                description: "Rename a node",
                url: `${url}/api/namespaces/${namespace}/tree/NODE_NAME?op=rename-node`,
                body:`{
  "new": "NEW_NODE_NAME"
}`,
                type: "json"
            },
            {
                method: "DEL",
                description: `Delete a node`,
                url: `${url}/api/namespaces/${namespace}/tree/NODE_NAME?op=delete-node`,
            }
        ]
    )
}

// const apiHelps = [
//     {
//         method: "get",
//         url: "https:awsdev.direktiv.io/api/anmespaces/direktiv/tree/",
//         description: "List Nodes at: /directive",
//         body: `function toCelsiu (fahrenheit) { 
//             return (5/9)* (fahrenheit-32); 
// } 
// document.getElementByID(“demo”).innerHTML = toCelsus(77);
//         `,
//         type: "javascript"
//     },
//     {
//         method: "put",
//         url: "https:awsdev.direktiv.io/api/anmespaces/direktiv/tree/",
//         description: "List Nodes at: /directive",
//         body: `function toCelsiu (fahrenheit) { 
//             return (5/9)* (fahrenheit-32); 
// } 
// document.getElementByID(“demo”).innerHTML = toCelsus(77);
//         `,
//         type: "javascript"
//     },
//     {
//         method: "post",
//         url: "https:awsdev.direktiv.io/api/anmespaces/direktiv/tree/",
//         description: "List Nodes at: /directive",
//         body: `function toCelsiu (fahrenheit) { 
//             return (5/9)* (fahrenheit-32); 
// } 
// document.getElementByID(“demo”).innerHTML = toCelsus(77);
//         `,
//         type: "javascript"
//     },
//     {
//         method: "delete",
//         url: "https:awsdev.direktiv.io/api/anmespaces/direktiv/tree/",
//         description: "List Nodes at: /directive",
//         body: `function toCelsiu (fahrenheit) { 
//             return (5/9)* (fahrenheit-32); 
// } 
// document.getElementByID(“demo”).innerHTML = toCelsus(77);
//         `,
//         type: "javascript"
//     },
// ]

function Explorer(props) {
    const params = useParams()
    const [searchParams] = useSearchParams() // removed 'setSearchParams' from square brackets (this should not affect anything: search 'destructuring assignment')

    const {namespace}  = props
    let filepath = `/`
    if(!namespace){
        return <></>
    }
    if(params["*"] !== undefined){
        filepath = `/${params["*"]}`
    }

    // pod revisions
    if (searchParams.get('function') && searchParams.get('version') && searchParams.get('revision')){
        return (
            <WorkflowPod filepath={filepath} namespace={namespace} service={searchParams.get('function')} version={searchParams.get('version')} revision={searchParams.get('revision')}/>
        )
    }
    // service revisions
    if (searchParams.get('function') && searchParams.get('version')){
        return(
            <WorkflowRevisions filepath={filepath} namespace={namespace} service={searchParams.get('function')} version={searchParams.get('version')}/>
        )
    }

    return(
        <>
            <ExplorerList  namespace={namespace} path={filepath}/>
        </>
    )
}

export default Explorer;

function SearchBar(props) {
    const {search, setSearch} = props
    return(
        <div className="explorer-searchbar">
            <FlexBox className="" style={{height: "29px"}}>
                <VscSearch className="auto-margin" />
                <input search={search} onChange={(e)=>{setSearch(e.target.value)}} placeholder={"Search items"} style={{ boxSizing: "border-box" }}></input>
            </FlexBox>
        </div>
    );
}

const orderFieldDictionary = {
    "Name": "NAME", // Default
    "Created": "CREATED"
}

const orderFieldKeys = Object.keys(orderFieldDictionary)

function ExplorerList(props) {
    const {namespace, path} = props
    const navigate= useNavigate()
    
    //api helper modal
    const [search, setSearch] = useState("")

    const [currPath, setCurrPath] = useState("")
    
    const [directoryName, setDirectoryName] = useState("")
    const [workflowName, setWorkflowName] = useState("")
    const [load, setLoad] = useState(true)

    const [orderFieldKey, setOrderFieldKey] = useState(orderFieldKeys[0])

    const [wfData, setWfData] = useState(templates["noop"])
    const [wfTemplate, setWfTemplate] = useState("noop")

    // const [pageNo, setPageNo] = useState(1);

    const [isDirectoryButtonDisabled, setIsDirectoryButtonDisabled] = useState(false)
    const [isWorkflowButtonDisabled, setIsWorkflowButtonDisabled] = useState(false)

    const {data, err, templates, createNode, deleteNode, renameNode } = useNodes(Config.url, true, namespace, path, localStorage.getItem("apikey"), `order.field=${orderFieldDictionary[orderFieldKey]}`, `filter.field=NAME`, `filter.val=${search}`, `filter.type=CONTAINS`)

    const directoryValidationSchema = yup.object().shape({
        directoryName: yup.string().required()
    })

    const workflowValidationSchema = yup.object().shape({
        workflowName: yup.string().required(),
        workflowData: yup.string().required()
    })

    useEffect(() => {

        directoryValidationSchema.isValid({ directoryName: directoryName })
            .then((result) => setIsDirectoryButtonDisabled(!result))

        workflowValidationSchema.isValid({ workflowName: workflowName, workflowData: wfData })
            .then((result) => setIsWorkflowButtonDisabled(!result))

    },[directoryValidationSchema, workflowValidationSchema, workflowName, directoryName, wfData])

    // control loading icon todo work out how to display this error
    useEffect(()=>{
        if(data !== null || err !== null) {
            setLoad(false)
        }
    },[data, err])

    useEffect(()=>{
        if(path !== currPath) {
            setCurrPath(path)
            setLoad(true)
        }
    },[path, currPath])

    if(data !== null) {
        if(data.node.type === "workflow") {
            return <WorkflowPage namespace={namespace}/>
        }
    }

    return(
        <FlexBox className="col gap"  style={{paddingRight: "8px"}}>
        <Loader load={load} timer={1000}>
        <FlexBox className="gap" style={{maxHeight: "32px"}}>
            <FlexBox>
                <div>
                    <Modal
                        titleIcon={<VscCode/>}
                        button={
                            <Button className="small light" style={{ display: "flex", minWidth: "120px" }}>
                                <ContentPanelHeaderButtonIcon>
                                    <VscCode style={{ maxHeight: "12px", marginRight: "4px" }} />
                                </ContentPanelHeaderButtonIcon>
                                API Commands
                            </Button>
                        }
                        escapeToCancel
                        withCloseButton
                        maximised
                        title={"Namespace API Interactions"}
                    >
                        {
                            apiHelps(namespace).map((help)=>(
                                <ApiFragment
                                    description={help.description}
                                    url={help.url}
                                    method={help.method}
                                    body={help.body}
                                    type={help.type}
                                />
                            ))
                        }
                    </Modal>
                </div>
                
            </FlexBox>
            <FlexBox style={{flexDirection: "row-reverse"}}>
                <SearchBar search={search} setSearch={setSearch}/>
            </FlexBox>
        </FlexBox>
        <ContentPanel>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscFolderOpened/>
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Explorer
                    </div>
                    <HelpIcon msg={"Directory/workflow browser."} />
                </FlexBox>
                <FlexBox className="gap" style={{flexDirection: "row-reverse"}}>
                    <ContentPanelHeaderButton className="explorer-action-btn">
                        <Modal title="New Workflow" 
                            escapeToCancel
                            button={(
                                <div style={{display:"flex"}}>
                                    <ContentPanelHeaderButtonIcon>
                                        <VscAdd/>
                                    </ContentPanelHeaderButtonIcon>
                                    <span className="hide-on-small">Workflow</span>
                                    <span className="hide-on-medium-and-up">WF</span>
                                </div>
                            )}  
                            onClose={()=>{
                                setWfData(templates["noop"])
                                setWfTemplate("noop")
                                setWorkflowName("")
                            }}
                            actionButtons={[
                                ButtonDefinition("Add",async () => {
                                    const result = await createNode(name, "workflow", wfData)
                                    if(result.node && result.namespace){
                                        navigate(`/n/${result.namespace}/explorer/${result.node.path.substring(1)}`)
                                    }
                                }, `small ${isWorkflowButtonDisabled ? "disabled": "blue"}`, (err)=>{return err}, true, true),
                                ButtonDefinition("Cancel", () => {
                                }, "small light", ()=>{}, true, true)
                            ]}
                        >
                            <FlexBox className="col gap" style={{fontSize: "12px", minHeight: "500px", minWidth: "550px"}}>
                                <FlexBox className="gap" style={{margin: "-4px 0 -4px 0", maxHeight: 30}}>
                                    Name
                                    <span className="required-label">*</span>
                                </FlexBox>
                                <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                                    <input id={"workflow-name"} value={workflowName} onChange={(e)=>setWorkflowName(e.target.value)} autoFocus placeholder="Enter workflow name"/>
                                </div>
                                <FlexBox className="gap" style={{margin: "1px 0 -5px 0", maxHeight: 30}}>
                                    Template
                                </FlexBox>
                                <select value={wfTemplate} onChange={(e)=>{
                                    setWfTemplate(e.target.value)
                                    // todo set wfdata to template on change
                                    setWfData(templates[e.target.value])
                                }}>
                                    {Object.keys(templates).map((obj)=>{
                                        let key = GenerateRandomKey("")
                                        return(
                                            <option key={key} value={obj}>{obj}</option>
                                        )
                                    })}
                                </select>
                                <FlexBox className="gap" style={{margin: "0 0 -5px 0", maxHeight: 30}}>
                                    Data
                                    <span className="required-label">*</span>
                                </FlexBox>
                                <FlexBox className="gap">
                                    <FlexBox style={{overflow:"hidden"}}>
                                    <AutoSizer>
                                        {({height, width})=>(
                                        <DirektivEditor dlang={"yaml"} width={width} value={wfData} setDValue={setWfData} height={height}/>
                                        )}
                                    </AutoSizer>
                                    </FlexBox>
                                </FlexBox>
                            </FlexBox>
                        </Modal>
                    </ContentPanelHeaderButton>
                    <ContentPanelHeaderButton className="explorer-action-btn">
                        <div>
                            <Modal title="New Directory" 
                                escapeToCancel
                                button={(
                                    <div style={{display:"flex"}}>
                                        <ContentPanelHeaderButtonIcon>
                                            <VscAdd/>
                                        </ContentPanelHeaderButtonIcon>
                                        <span className="hide-on-small">Directory</span>
                                        <span className="hide-on-medium-and-up">Dir</span>
                                    </div>
                                )}
                                onClose={()=>{
                                    setDirectoryName("")
                                }}
                                actionButtons={[
                                    ButtonDefinition("Add", async () => {
                                        await createNode(directoryName, "directory")
                                        setDirectoryName("")
                                    }, `small ${isDirectoryButtonDisabled ? "disabled": "blue"}`, (err)=>{return err}, true, true),
                                    ButtonDefinition("Cancel", () => {
                                    }, "small light", ()=>{}, true, false)
                                ]}
                            >
                                <FlexBox  className="col gap" style={{fontSize: "12px"}}>
                                    <FlexBox className="col" style={{paddingRight:"10px"}}>
                                        <FlexBox style={{display:"flex", alignItems:"center", margin: "-3px 0 8px 0", fontSize: "12px", fontWeight: "bold"}} className="gap">
                                            Directory
                                            <span className="required-label">*</span>
                                        </FlexBox>
                                        <input value={directoryName} onChange={(e)=>setDirectoryName(e.target.value)} autoFocus placeholder="Enter a directory name" />
                                    </FlexBox>
                                </FlexBox>
                            </Modal>
                        </div>
                    </ContentPanelHeaderButton>
                    <div className="explorer-sort-by explorer-action-btn hide-on-small">
                    <FlexBox className="gap" style={{marginRight: "8px"}}>
                        <FlexBox className="center">
                            Sort by:
                        </FlexBox>
                        <FlexBox className="center">
                            <select onChange={(e)=>{
                                setOrderFieldKey(e.target.value)
                                }} value={orderFieldKey} className="dropdown-select" style={{paddingBottom: "0px", paddingTop: "0px", height:"27px"}}>
                                <option value="">{orderFieldKey}</option>
                                {orderFieldKeys.map((key)=>{
                                    if(key === orderFieldKey){
                                        return ""
                                    }
                                    return(
                                        <option key={GenerateRandomKey()} value={key}>{key}</option>
                                    )
                                })}
                            </select>
                        </FlexBox>
                        </FlexBox>
                    </div>
                </FlexBox>
            </ContentPanelTitle>
            <ContentPanelBody style={{height:"100%"}}>
                    <FlexBox className="col">
                        {data !== null ? <>
                        {data.children.edges.length === 0 ? 
                                <div className="explorer-item">
                                    <FlexBox className="explorer-item-container">
                                        <FlexBox style={{display:"flex", alignItems:"center"}} className="explorer-item-icon">
                                            <VscSearch />
                                        </FlexBox>
                                        <FlexBox style={{fontSize:"10pt"}} className="explorer-item-name">
                                            No results found under '{path}'.
                                        </FlexBox>
                                        <FlexBox className="explorer-item-actions gap">
                        
                                        </FlexBox>
                                    </FlexBox>
                                </div>
                        :
                        <>
                        {data.children.edges.map((obj) => {
                            if (obj.node.type === "directory") {
                                return (<DirListItem namespace={namespace} renameNode={renameNode} deleteNode={deleteNode} path={obj.node.path} key={GenerateRandomKey("explorer-item-")} name={obj.node.name} />)
                            } else if (obj.node.type === "workflow") {
                                return (<WorkflowListItem namespace={namespace} renameNode={renameNode} deleteNode={deleteNode} path={obj.node.path} key={GenerateRandomKey("explorer-item-")} name={obj.node.name} />)
                            }
                            return <></>
                        })}</>}</>: <></>}
                    </FlexBox>
            </ContentPanelBody>
        </ContentPanel>
    {/* <FlexBox>
        <Pagination max={10} currentIndex={pageNo} pageNoSetter={setPageNo} />
    </FlexBox> */}
    </Loader>
  
    </FlexBox>
    )
}

function DirListItem(props) {

    let {name, path, deleteNode, renameNode, namespace} = props;

    const navigate = useNavigate()
    const [renameValue, setRenameValue] = useState(path)
    const [rename, setRename] = useState(false)
    const [err, setErr] = useState("")


    return(
        <div style={{cursor:"pointer"}} onClick={(e)=>{
            navigate(`/n/${namespace}/explorer/${path.substring(1)}`)
        }} className="explorer-item">
            <FlexBox className="col">
                <FlexBox className="explorer-item-container gap wrap">
                    <FlexBox className="explorer-item-icon">
                        <FiFolder className="auto-margin" />
                    </FlexBox>
                {
                    rename ? 
                    <FlexBox className="explorer-item-name" style={{alignItems: "center"}}>
                        <input style={{ width: "100%", height:"38px" }} onClick={(ev)=>ev.stopPropagation()} type="text" value={renameValue} onKeyPress={async (e)=>{
                            if(e.key === "Enter"){
                                try { 
                                    await renameNode("/", path, renameValue)
                                    setRename(!rename)
                                } catch(err) {
                                    setErr(err.message)
                                }
                            }
                        }} onChange={(e)=>setRenameValue(e.target.value)} autoFocus/>
                     </FlexBox>
                    :
                    <FlexBox className="explorer-item-name">
                        {name}
                    </FlexBox>
                }
                <FlexBox >
                    {err !== "" ? 
                    <FlexBox>
                        <Alert className="rename-error critical">{err}</Alert>
                    </FlexBox>
                    :<FlexBox />
                    }
                    <FlexBox className="explorer-item-actions gap">
                    {rename ? 
                        <FlexBox onClick={(ev)=>{
                            setRename(!rename)
                            setErr("")
                            ev.stopPropagation()
                        }}>
                            <VscClose className="auto-margin" />
                        </FlexBox>
                        :
                        <FlexBox onClick={(ev)=>{
                            setRename(!rename)
                            setErr("")
                            ev.stopPropagation()
                        }}>
                            <VscEdit className="auto-margin" />
                        </FlexBox>}
                        <FlexBox onClick={(ev)=>ev.stopPropagation()}>

                        <Modal
                                escapeToCancel
                                style={{
                                    flexDirection: "row-reverse",
                                }}
                                title="Delete a directory" 
                                button={(
                                    <FlexBox>
                                        <VscTrash className="auto-margin red-text" />
                                    </FlexBox>
                                )}
                                actionButtons={
                                    [
                                        ButtonDefinition("Delete", async () => {
                                            let p = path.split('/', -1);
                                            let pLast = p[p.length-1];
                                            await deleteNode(pLast)
                                        }, "small red", ()=>{}, true, false),
                                        ButtonDefinition("Cancel", () => {
                                        }, "small light", ()=>{}, true, false)
                                    ]
                                } 
                            >
                                    <FlexBox className="col gap">
                                <FlexBox >
                                    Are you sure you want to delete '{name}'?
                                    <br/>
                                    This action cannot be undone.
                                </FlexBox>
                            </FlexBox>
                        </Modal>
                        </FlexBox>

                    </FlexBox>
                </FlexBox>
                </FlexBox>
            </FlexBox>
        </div>
    )
}

function WorkflowListItem(props) {

    let {name, path, deleteNode, renameNode, namespace} = props;

    const navigate= useNavigate()
    const [renameValue, setRenameValue] = useState(path)
    const [rename, setRename] = useState(false)
    const [err, setErr] = useState("")

    return(
        <div style={{cursor:"pointer"}} onClick={()=>{
            navigate(`/n/${namespace}/explorer/${path.substring(1)}`)
        }} className="explorer-item">
            <FlexBox className="col">
                <FlexBox className="explorer-item-container gap wrap">
                    <FlexBox className="explorer-item-icon">
                        <FcWorkflow className="auto-margin" />
                    </FlexBox>
                {
                    rename ? 
                    <FlexBox className="explorer-item-name" style={{alignItems: "center", maxWidth: "300px", minWidth: "300px"}}>
                        <input onClick={(ev)=>ev.stopPropagation()} type="text" value={renameValue} onKeyPress={async (e)=>{
                            if(e.key === "Enter"){
                                try { 
                                    await renameNode("/", path, renameValue)
                                    setRename(!rename)
                                } catch(err) {
                                    setErr(err.message)
                                }
                            }
                        }} onChange={(e)=>setRenameValue(e.target.value)} autoFocus style={{maxWidth:"300px", height:"38px"}}/>
                     </FlexBox>
                    :
                    <FlexBox className="explorer-item-name">
                        {name}
                    </FlexBox>
                }
                    <FlexBox>
                        {err !== "" ? 
                        <FlexBox>
                            <Alert className="rename-error critical">{err}</Alert>
                        </FlexBox>
                        :<FlexBox />
                        }
                        <FlexBox className="explorer-item-actions gap">
                            {rename ? 
                            <FlexBox onClick={(ev)=>{
                                setRename(!rename)
                                setErr("")
                                ev.stopPropagation()
                            }}>
                                <VscClose className="auto-margin" />
                            </FlexBox>
                            :
                            <FlexBox onClick={(ev)=>{
                                setRename(!rename)
                                setErr("")
                                ev.stopPropagation()
                            }}>
                                <VscEdit className="auto-margin" />
                            </FlexBox>}
                            <FlexBox onClick={(ev)=>ev.stopPropagation()}>

                                <Modal
                                        escapeToCancel
                                        style={{
                                            flexDirection: "row-reverse",
                                        }}
                                        title="Delete a workflow" 
                                        button={(
                                            <FlexBox style={{alignItems:'center'}}>
                                                <HiOutlineTrash className="auto-margin red-text" />
                                            </FlexBox>
                                        )}
                                        actionButtons={
                                            [
                                                ButtonDefinition("Delete", async () => {
                                                    let p = path.split('/', -1);
                                                    let pLast = p[p.length-1];
                                                    await deleteNode(pLast)
                                                }, "small red", ()=>{}, true, false),
                                                ButtonDefinition("Cancel", () => {
                                                }, "small light", ()=>{}, true, false)
                                            ]
                                        } 
                                    >
                                            <FlexBox className="col gap">
                                        <FlexBox >
                                            Are you sure you want to delete '{name}'?
                                            <br/>
                                            This action cannot be undone.
                                        </FlexBox>
                                    </FlexBox>
                                    </Modal>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
                </FlexBox>
            </FlexBox>
        </div>
    )
}

export function ApiFragment(props) {
    const { url, method, body, description } = props
    return (
        <FlexBox className='helper-wrap col'>
            <FlexBox className='helper-title row'>
                <FlexBox className='row vertical-center'>
                    <Button className={`btn-method ${method}`}>{method}</Button>
                    <div className='url'>{url}</div>
                </FlexBox>
                <div className='description' style={{textAlign:"right"}}>{description}</div>
            </FlexBox>
            {body ? 
            <FlexBox>    
                <DirektivEditor 
                    height={150}
                    value={props.body} readonly dlang={props.type}/>
            </FlexBox>:""}
        </FlexBox>
    )
}
