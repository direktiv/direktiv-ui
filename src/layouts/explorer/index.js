import React, {useEffect, useState, useCallback} from 'react';
import './style.css';
import './rainbow.css';

import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelHeaderButtonIcon, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import { VscAdd, VscClose,  VscSearch, VscEdit, VscTrash, VscFolderOpened, VscCode, VscRepo } from 'react-icons/vsc';
import { Config, GenerateRandomKey } from '../../util';
import { FiFolder } from 'react-icons/fi';
import { FcWorkflow } from 'react-icons/fc';
import { HiOutlineTrash } from 'react-icons/hi';
import { useNodes } from 'direktiv-react-hooks';
import { useNavigate, useParams } from 'react-router';
import Modal, {ButtonDefinition, KeyDownDefinition} from '../../components/modal'
import DirektivEditor from '../../components/editor';
import Button from '../../components/button';
import HelpIcon from "../../components/help"
import Loader from '../../components/loader';
import WorkflowPage from './workflow';
import { useSearchParams } from 'react-router-dom';
import WorkflowRevisions from './workflow/revision';
import WorkflowPod from './workflow/pod'
import { AutoSizer } from 'react-virtualized';
import Pagination from '../../components/pagination';
import Alert from '../../components/alert';
import NotFound from '../notfound';

import * as dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc"


const PAGE_SIZE = 10
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

dayjs.extend(utc)
dayjs.extend(relativeTime);

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
    
    const [name, setName] = useState("")
    const [load, setLoad] = useState(true)

    const [orderFieldKey, setOrderFieldKey] = useState(orderFieldKeys[0])
     
    const [queryParams, setQueryParams] = useState([`first=${PAGE_SIZE}`])
    const {data, err, templates, pageInfo, createNode, createMirrorNode, deleteNode, renameNode, getMirrorInfo, updateMirrorSettings, syncMirror, getMirrorActivityLogs, cancelMirrorActivity, setLockMirror, totalCount } = useNodes(Config.url, true, namespace, path, localStorage.getItem("apikey"), ...queryParams, `order.field=${orderFieldDictionary[orderFieldKey]}`, `filter.field=NAME`, `filter.val=${search}`, `filter.type=CONTAINS`)

    const [wfData, setWfData] = useState(templates["noop"].data)
    const [wfTemplate, setWfTemplate] = useState("noop")


    // Mirror
    function devGetPublicKey() {
        return localStorage.getItem('dev-publicKey') ? localStorage.getItem('dev-publicKey') : ""
    }
    const [mirrorSettings, setMirrorSettings] = useState({
        "url": {edit: false, value: ""},
        "ref": {edit: false, value: ""},
        "cron": {edit: false, value: ""},
        "publicKey": {edit: false, value: devGetPublicKey()},
        "privateKey": {edit: false, value: ""},
        "passphrase": {edit: false, value: ""}
    })
    const [mirrorInfo, setMirrorInfo] = useState({})
    const [mirrorActivityLogs, setMirrorActivityLogs] = useState([])



    function devSettingsSetPublicKey(settings) {
        if (settings["publicKey"] && settings["publicKey"].value !== "") {
            localStorage.setItem('dev-publicKey', settings["publicKey"].value)
        }

        return settings
    }


    function resetQueryParams() {
        setQueryParams([`first=${PAGE_SIZE}`])
        setSearch("")
    }

    // control loading icon todo work out how to display this error
    useEffect(()=>{
        if(data !== null || err !== null) {
            setLoad(false)
            if (data.node.expandedType === "git") {
                getMirrorInfo().then((minfo) =>{
                    console.log("MIRROR INFO =====", minfo)
                    setMirrorInfo(minfo)
                })
            }
        }
    },[data, err])

    // Reset pagination queries when searching
    useEffect(()=>{
        setQueryParams([`first=${PAGE_SIZE}`])
    },[search])

    useEffect(()=>{
        if(path !== currPath) {
            setCurrPath(path)
            setLoad(true)
        }
    },[path, currPath])

    //pagination
    const updatePage = useCallback((newParam)=>{
        setQueryParams(newParam)
    }, [])

    if (err === "Not Found") {
        return <NotFound/>
    }

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
            <FlexBox key="delete-me-1">
                <div>
                    <Modal
                        titleIcon={<VscCode/>}
                        button={
                            <Button className="small light" style={{ display: "flex", minWidth: "120px" }}>
                                <ContentPanelHeaderButtonIcon>
                                    <VscCode style={{ maxHeight: "12px", marginRight: "4px" }} />
                                </ContentPanelHeaderButtonIcon>
                                <span className='rainbow-text'>Show Data</span>
                            </Button>
                        }
                        escapeToCancel
                        withCloseButton
                        maximised
                        title={"DELETE ME"}
                    >
                        <div>
                            <DirektivEditor height={400} lang={"json"} value={data ? JSON.stringify(data, null, 2): "NO DATA"}/>
                            
                        </div>
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
                                setWfData(templates["noop"].data)
                                setWfTemplate("noop")
                                setName("")
                            }}
                            actionButtons={[
                                ButtonDefinition("Add", async () => {
                                    const result = await createNode(name, "workflow", wfData)
                                    if(result.node && result.namespace){
                                        navigate(`/n/${result.namespace}/explorer/${result.node.path.substring(1)}`)
                                    }
                                }, `small blue`, ()=>{}, true, false, true),
                                ButtonDefinition("Cancel", () => {
                                }, "small light", ()=>{}, true, false)
                            ]}

                            keyDownActions={[
                                KeyDownDefinition("Enter", async () => {
                                    if(name.trim()) {
                                        await createNode(name, "workflow", wfData)
                                    } else {
                                        throw new Error("Please fill in name")
                                    }
                                }, ()=>{}, true, "workflow-name")
                            ]}

                            requiredFields={[
                                {tip: "workflow name is required", value: name},
                                {tip: "workflow cannot be empty", value: wfData}
                            ]}
                        >
                            <FlexBox className="col gap" style={{fontSize: "12px", minHeight: "500px", minWidth: "550px"}}>
                                <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                                    <input id={"workflow-name"} value={name} onChange={(e)=>setName(e.target.value)} autoFocus placeholder="Enter workflow name"/>
                                </div>
                                <select value={wfTemplate} onChange={(e)=>{
                                    setWfTemplate(e.target.value)
                                    // todo set wfdata to template on change
                                    setWfData(templates[e.target.value].data)
                                }}>
                                    {Object.keys(templates).map((obj)=>{
                                        let key = GenerateRandomKey("")
                                        return(
                                            <option key={key} value={obj}>{templates[obj].name}</option>
                                        )
                                    })}
                                </select>
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
                                    setName("")
                                    
                                }}
                                actionButtons={[
                                    ButtonDefinition("Add", async () => {
                                        await createNode(name, "directory")
                                    }, `small blue ${name.trim() ? "" : "disabled"}`, ()=>{}, true, false, true),
                                    ButtonDefinition("Cancel", () => {
                                    }, "small light", ()=>{}, true, false)
                                ]}

                                keyDownActions={[
                                    KeyDownDefinition("Enter", async () => {
                                        await createNode(name, "directory")
                                        setName("")
                                    }, ()=>{}, true)
                                ]}

                                requiredFields={[
                                    {tip: "directory name is required", value: name}
                                ]}

                            >
                                <FlexBox  className="col gap" style={{fontSize: "12px"}}>
                                    <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                                        <input value={name} onChange={(e)=>setName(e.target.value)} autoFocus placeholder="Enter a directory name" />
                                    </div>
                                </FlexBox>
                            </Modal>
                        </div>
                    </ContentPanelHeaderButton>
                    <ContentPanelHeaderButton className="explorer-action-btn">
                        <div>
                            <Modal title="New Mirror Directory" 
                                escapeToCancel
                                button={(
                                    <div style={{display:"flex"}}>
                                        <ContentPanelHeaderButtonIcon>
                                            <VscAdd/>
                                        </ContentPanelHeaderButtonIcon>
                                        <span className="hide-on-small">Mirror Directory</span>
                                        <span className="hide-on-medium-and-up">Dir</span>
                                    </div>
                                )}  
                                onClose={()=>{
                                }}
                                actionButtons={[
                                    ButtonDefinition("Add", async () => {
                                        let mSettings = {}
                                        Object.entries(mirrorSettings).map(([key, value]) => {
                                            mSettings[key] = value.value
                                        })
                                        await createMirrorNode(name, mSettings)
                                    }, `small blue ${name.trim() ? "" : "disabled"}`, ()=>{}, true, false, true),
                                    ButtonDefinition("Cancel", () => {
                                    }, "small light", ()=>{}, true, false)
                                ]}

                                keyDownActions={[
                                    KeyDownDefinition("Enter", async () => {
                                        let mSettings = {}
                                        Object.entries(mirrorSettings).map(([key, value]) => {
                                            mSettings[key] = value.value
                                        })
                                        await createMirrorNode(name, mSettings)
                                        setName("")
                                    }, ()=>{}, true)
                                ]}

                                requiredFields={[
                                    {tip: "directory name is required", value: name}
                                ]}

                            >
                                <FlexBox  className="col gap" style={{fontSize: "12px"}}>
                                    <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                                        <input value={name} onChange={(e)=>setName(e.target.value)} autoFocus placeholder="Enter a directory name" />
                                    </div>
                                    {Object.entries(mirrorSettings).map(([key, value]) => {
                                        return(
                                        <div style={{width: "100%", paddingRight: "12px", display: "flex"}}>
                                            <textarea style={{width:"100%"}} value={value.value} onChange={(e)=>{
                                                let newSettings = mirrorSettings
                                                newSettings[key].value = e.target.value
                                                newSettings = devSettingsSetPublicKey(newSettings)
                                                setMirrorSettings({...newSettings})
                                            }} autoFocus placeholder={`Enter a mirror ${key}`}/>
                                        </div>
                                        )
                                    })}
                                </FlexBox>
                            </Modal>
                        </div>
                    </ContentPanelHeaderButton>
                    {
                        data && data.node.expandedType === "git" ?
                            <>
                                <ContentPanelHeaderButton className="explorer-action-btn">
                                    <div>
                                        <Modal title="Mirror Activities"
                                            escapeToCancel
                                            button={(
                                                <div style={{ display: "flex" }}>
                                                    <ContentPanelHeaderButtonIcon>
                                                        <VscRepo />
                                                    </ContentPanelHeaderButtonIcon>
                                                    <span className="hide-on-small rainbow-text">Activities</span>
                                                    <span className="hide-on-medium-and-up">Activities</span>
                                                </div>
                                            )}
                                            actionButtons={[
                                                ButtonDefinition("Close", () => {
                                                }, "small light", () => { }, true, false),
                                                ButtonDefinition("Refresh", async () => {
                                                    getMirrorInfo().then((minfo) => {
                                                        console.log("MIRROR INFO =====", minfo)
                                                        setMirrorInfo(minfo)
                                                    })
                                                }, "small blue", () => { }, false, false),

                                            ]}
                                        >
                                            <FlexBox className="col gap" style={{ fontSize: "12px", maxHeight: "30vh", overflow: "scroll" }}>
                                                {mirrorInfo && mirrorInfo.activities ?
                                                    <>
                                                        {
                                                            mirrorInfo.activities.edges.map((obj) => {
                                                                return (
                                                                    <FlexBox className="row gap">
                                                                        <Button className="small" onClick={async () => {
                                                                            try {
                                                                                const actLogs = await getMirrorActivityLogs(obj.node.id)
                                                                                setMirrorActivityLogs(actLogs.edges)
                                                                            } catch (e) {
                                                                                console.log("e == ?", e)
                                                                                alert(`got error when getting logs: ${e.message}`)
                                                                            }
                                                                        }}>
                                                                            Logs
                                                                        </Button>
                                                                        <Button className="small" onClick={() => {
                                                                            cancelMirrorActivity(obj.node.id).catch((e) => {
                                                                                alert(`got error when getting cancelling: ${e.message}`)
                                                                            })
                                                                        }}>
                                                                            Cancel
                                                                        </Button>
                                                                        {Object.entries(obj.node).map(([key, value]) => {
                                                                            return (
                                                                                <div style={{ fontWeight: "normal" }}>
                                                                                    <span style={{ fontWeight: "bold" }}>{key}:</span>
                                                                                    {key === "createdAt" || key === "updatedAt" ?
                                                                                        `${dayjs.utc(value).local().format("DD MMM YY")} ${dayjs.utc(value).local().format("HH:mm a")}` : value}
                                                                                </div>
                                                                            )

                                                                        })}
                                                                    </FlexBox>
                                                                )
                                                            })
                                                        }
                                                    </> : <></>
                                                }
                                            </FlexBox>
                                            <FlexBox className="col gap" style={{ fontSize: "12px", maxHeight: "30vh", minHeight: "50px", backgroundColor: "#f0f0f0", overflow: "scroll" }}>
                                                <div>LOGS: TotalCount {mirrorActivityLogs.length}</div>
                                                <div>
                                                    {/* {JSON.stringify(mirrorActivityLogs)} */}
                                                </div>
                                                {
                                                    mirrorActivityLogs.map((obj) => {
                                                        return (
                                                            <span style={{ lineHeight: "12px" }}>{JSON.stringify(obj.node.msg)}</span>
                                                        )
                                                    })
                                                }
                                            </FlexBox>
                                        </Modal>
                                    </div>
                                </ContentPanelHeaderButton>
                                <ContentPanelHeaderButton className="explorer-action-btn">
                                    <div>
                                        <Modal title="Mirror Settings"
                                            escapeToCancel
                                            button={(
                                                <div style={{ display: "flex" }}>
                                                    <ContentPanelHeaderButtonIcon>
                                                        <VscRepo />
                                                    </ContentPanelHeaderButtonIcon>
                                                    <span className="hide-on-small rainbow-text">Mirror Settings</span>
                                                    <span className="hide-on-medium-and-up">Mirror</span>
                                                </div>
                                            )}
                                            onClose={() => {
                                                setMirrorSettings({
                                                    "url": { edit: false, value: "" },
                                                    "ref": { edit: false, value: "" },
                                                    "cron": { edit: false, value: "" },
                                                    "publicKey": { edit: false, value: devGetPublicKey() },
                                                    "privateKey": { edit: false, value: "" },
                                                    "passphrase": { edit: false, value: "" }
                                                })
                                            }}
                                            onOpen={() => {
                                                let mSettings = mirrorSettings
                                                Object.entries(mirrorInfo.info).map(([key, value]) => {
                                                    if (mSettings[key] !== undefined) {
                                                        mSettings[key].value = value
                                                    }
                                                })
                                                setMirrorSettings({ ...mSettings })

                                            }}
                                            actionButtons={[
                                                ButtonDefinition("Close", () => {
                                                }, "small light", () => { }, true, false),
                                                ButtonDefinition("Update Settings", async () => {
                                                    let mSettings = {}
                                                    Object.entries(mirrorSettings).map(([key, value]) => {
                                                        if (value.edit) {
                                                            mSettings[key] = value.value
                                                        } else {
                                                            mSettings[key] = "-"
                                                        }
                                                    })
                                                    await updateMirrorSettings(mSettings)

                                                    getMirrorInfo().then((minfo) => {
                                                        console.log("MIRROR INFO =====", minfo)
                                                        setMirrorInfo(minfo)
                                                    })
                                                }, "small blue", () => { }, true, false),
                                                ButtonDefinition(`${data && data.node && data.node.readOnly ? "Unlock" : "Lock"}`, async () => {
                                                    await setLockMirror(!data.node.readOnly)
                                                    const minfo =  await getMirrorInfo()
                                                    console.log("MIRROR INFO =====", minfo)
                                                    setMirrorInfo(minfo)
                                                }, "small blue", () => { }, false, false),
                                                ButtonDefinition("Soft Sync", async () => {
                                                    console.log("Soft Sync = ", await syncMirror())
                                                }, "small blue", () => { }, true, false),
                                                ButtonDefinition("Hard Sync", async () => {
                                                    console.log("Soft Sync = ", await syncMirror(true))
                                                }, "small blue", () => { }, true, false),

                                            ]}

                                            keyDownActions={[
                                            ]}

                                            requiredFields={[
                                            ]}
                                        >
                                            <FlexBox className="col gap" style={{ fontSize: "12px" }}>
                                                <div className='rainbow-text'>
                                                    Click labels to edit
                                                </div>
                                                {Object.entries(mirrorSettings).map(([key, value]) => {
                                                    return (
                                                        <div style={{ width: "100%", paddingRight: "12px", display: "flex" }}>
                                                            <label className={`${value.edit ? "rainbow-text" : ""}`} style={{ marginRight: "6px", cursor: "pointer" }} onClick={() => {
                                                                let newSettings = mirrorSettings
                                                                newSettings[key].edit = !newSettings[key].edit
                                                                newSettings = devSettingsSetPublicKey(newSettings)
                                                                setMirrorSettings({ ...newSettings })
                                                            }}>{key}:</label>
                                                            <textarea style={{width:"100%"}} value={value.value} onChange={(e) => {
                                                                let newSettings = mirrorSettings
                                                                newSettings[key].value = e.target.value
                                                                newSettings = devSettingsSetPublicKey(newSettings)
                                                                setMirrorSettings({ ...newSettings })
                                                            }} autoFocus readOnly={!value.edit} />
                                                        </div>
                                                    )
                                                })}
                                            </FlexBox>
                                        </Modal>
                                    </div>
                                </ContentPanelHeaderButton>
                            </>
                            :
                            <></>
                    }
                    <div className="explorer-sort-by explorer-action-btn hide-on-small">
                    <FlexBox className="gap" style={{marginRight: "8px"}}>
                        <FlexBox className="center">
                            Sort by:
                        </FlexBox>
                        <FlexBox className="center">
                            <select onChange={(e)=>{
                                setOrderFieldKey(e.target.value)
                                setQueryParams([`first=${PAGE_SIZE}`])
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
                                return (<DirListItem className={`${data && obj.node.expandedType === "git" ? "rainbow-text":""}`} namespace={namespace} renameNode={renameNode} deleteNode={deleteNode} path={obj.node.path} key={GenerateRandomKey("explorer-item-")} name={obj.node.name} resetQueryParams={resetQueryParams}/>)
                            } else if (obj.node.type === "workflow") {
                                return (<WorkflowListItem namespace={namespace} renameNode={renameNode} deleteNode={deleteNode} path={obj.node.path} key={GenerateRandomKey("explorer-item-")} name={obj.node.name} />)
                            }
                            return <></>
                        })}</>}</>: <></>}
                    </FlexBox>
            </ContentPanelBody>
            <FlexBox>
                { !!totalCount && <Pagination pageSize={PAGE_SIZE} pageInfo={pageInfo} updatePage={updatePage} total={totalCount}/>}
            </FlexBox>
        </ContentPanel>
    </Loader>
  
    </FlexBox>
    )
}

function DirListItem(props) {

    let {name, path, deleteNode, renameNode, namespace, resetQueryParams, className} = props;

    const navigate = useNavigate()
    const [renameValue, setRenameValue] = useState(path)
    const [rename, setRename] = useState(false)
    const [err, setErr] = useState("")
    const [recursiveDelete, setRecursiveDelete] = useState(false)


    return(
        <div style={{cursor:"pointer"}} onClick={(e)=>{
            resetQueryParams()
            navigate(`/n/${namespace}/explorer/${path.substring(1)}`)
        }} className={`explorer-item`}>
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
                    <FlexBox className={`explorer-item-name ${className ? className : ""}`}>
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
                                            await deleteNode(pLast, recursiveDelete)
                                        }, "small red", ()=>{}, true, false),
                                        ButtonDefinition("Cancel", () => {
                                        }, "small light", ()=>{}, true, false)
                                    ]
                                } 
                            >
                                    <FlexBox className="col gap">
                                <FlexBox className="center-y gap" style={{fontWeight:"bold"}}>
                                    Recursive Delete:
                                    <label className="switch">
                                        <input onChange={()=>{
                                            setRecursiveDelete(!recursiveDelete)
                                        }} type="checkbox" checked={recursiveDelete}/>
                                        <span className="slider-broadcast"></span>
                                    </label>
                                </FlexBox>
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
                                                    await deleteNode(pLast, false)
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
