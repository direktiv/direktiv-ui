import React, { useEffect, useState } from 'react';
import './style.css';
import FlexBox from '../../../components/flexbox';
import {Link, useSearchParams} from 'react-router-dom'
import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelTitle, ContentPanelTitleIcon } from '../../../components/content-panel';
import {BsCodeSquare} from 'react-icons/bs'
import { useWorkflow, useWorkflowServices, useWorkflowVariables } from 'direktiv-react-hooks';
import { Config } from '../../../util';
import { useNavigate, useParams } from 'react-router';
import {  GenerateRandomKey } from '../../../util';

import * as dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc"
import { InstanceRow } from '../../instances';
import { IoMdLock } from 'react-icons/io';
import { ServiceStatus } from '../../namespace-services';
import Modal, { ButtonDefinition } from '../../../components/modal';
import DirektivEditor from '../../../components/editor';
import { RiDeleteBin2Line } from 'react-icons/ri';
import AddWorkflowVariablePanel from './variables';
import Button from '../../../components/button';
import { IoEyeOutline } from 'react-icons/io5';
dayjs.extend(utc)
dayjs.extend(relativeTime);


function WorkflowPage(props) {
    const {namespace} = props
    const [searchParams, setSearchParams] = useSearchParams()
    const params = useParams()

    // set tab query param on load
    useEffect(()=>{
        if(searchParams.get('tab') === null) {
            setSearchParams({tab: 0}, {replace:true})
        }
    },[searchParams, setSearchParams])
    
    let filepath = "/"

    if(!namespace) {
        return <></>
    }

    if(params["*"] !== undefined){
        filepath = `/${params["*"]}`
    }

    return(
        <InitialWorkflowHook setSearchParams={setSearchParams} searchParams={searchParams} namespace={namespace} filepath={filepath}/>
    )
}

function InitialWorkflowHook(props){
    const {namespace, filepath, searchParams, setSearchParams} = props

    const [activeTab, setActiveTab] = useState(searchParams.get("tab") !== null ? parseInt(searchParams.get('tab')): 0)

    const {data, err, getWorkflowRouter, toggleWorkflow, executeWorkflow, getInstancesForWorkflow, getRevisions, deleteRevision, saveWorkflow, updateWorkflow, discardWorkflow} = useWorkflow(Config.url, true, namespace, filepath.substring(1))
    const [router, setRouter] = useState(null)

    useEffect(()=>{
        async function getD() {
            if(data !== null && router === null) {
                setRouter(await getWorkflowRouter())
            }
        }
        getD()
    },[router, data])

    if(data === null || router === null) {
        return <></>
    }
    return(
        <>
            <FlexBox id="workflow-page" className="gap col" style={{paddingRight: "8px"}}>
                <TabBar setRouter={setRouter} router={router} getWorkflowRouter={getWorkflowRouter} toggleWorkflow={toggleWorkflow}  setSearchParams={setSearchParams} activeTab={activeTab} setActiveTab={setActiveTab} />
                <FlexBox className="col gap">
                    { activeTab === 0 ? 
                        <OverviewTab namespace={namespace} getInstancesForWorkflow={getInstancesForWorkflow} filepath={filepath}/>
                    :<></>}
                    { activeTab === 1 ?
                        <RevisionSelectorTab searchParams={searchParams} setSearchParams={setSearchParams} deleteRevision={deleteRevision} namespace={namespace} getRevisions={getRevisions} filepath={filepath} />
                    :<></>}
                    { activeTab === 2 ?
                        <WorkingRevision 
                            executeWorkflow={executeWorkflow}
                            saveWorkflow={saveWorkflow} 
                            updateWorkflow={updateWorkflow} 
                            discardWorkflow={discardWorkflow} 
                            wf={atob(data.revision.source)} 
                        />
                    :<></>}
                    { activeTab === 4 ?
                        <SettingsTab namespace={namespace} workflow={filepath} />
                    :<></>}
                </FlexBox>
            </FlexBox>
        </>
    )
}

export default WorkflowPage;

function WorkingRevision(props) {
    const {wf, updateWorkflow, discardWorkflow, saveWorkflow, executeWorkflow} = props

    const [load, setLoad] = useState(true)
    const [oldWf, setOldWf] = useState("")
    const [workflow, setWorkflow] = useState("")

    useEffect(()=>{
        if(wf !== workflow && load) {
            setLoad(false)
            setWorkflow(wf)
            setOldWf(wf)
        }
    },[wf, workflow])
   
    useEffect(()=>{
        if (oldWf !== wf) {
            setWorkflow(wf)
            setOldWf(wf)
        }
    },[oldWf, wf])

    return(
        <FlexBox style={{width:"100%"}}>
            <ContentPanel style={{width:"100%"}}>
                <ContentPanelTitle>
                    <ContentPanelTitleIcon>
                        <BsCodeSquare />
                    </ContentPanelTitleIcon>
                    <div>
                        Working Revision
                    </div>
                </ContentPanelTitle>
                <ContentPanelBody>
                    <FlexBox className="col" style={{overflow:"hidden"}}>
                        <FlexBox >
                            <DirektivEditor dlang="yaml" value={oldWf} dvalue={workflow} setDValue={setWorkflow} />
                        </FlexBox>
                        <FlexBox className="gap" style={{backgroundColor:"#223848", color:"white", height:"40px", maxHeight:"40px", paddingLeft:"10px", minHeight:"40px", borderTop:"1px solid white", alignItems:'center'}}>
                            <div style={{display:"flex", flex:1 }}>
                                <div onClick={async ()=> {
                                    await discardWorkflow()
                                }} style={{alignItems:"center", gap:"3px",backgroundColor:"#355166", paddingTop:"3px", paddingBottom:"3px", paddingLeft:"6px", paddingRight:"6px", cursor:"pointer", borderRadius:"3px"}}>
                                    Undo
                                </div>
                            </div>
                            <div style={{display:"flex", flex:1, justifyContent:"center"}}>
                                <div onClick={async ()=>{
                                    let id = await executeWorkflow()
                                    console.log(id, "ID")
                                }} style={{alignItems:"center", gap:"3px",backgroundColor:"#355166", paddingTop:"3px", paddingBottom:"3px", paddingLeft:"6px", paddingRight:"6px", cursor:"pointer", borderRadius:"3px"}}>
                                    Run
                                </div>
                            </div>
                            <div style={{display:"flex", flex:1, gap :"3px", justifyContent:"flex-end", paddingRight:"10px"}}>
                                <div onClick={async()=>{
                                    await updateWorkflow(workflow)
                                }} style={{alignItems:"center", gap:"3px",backgroundColor:"#355166", paddingTop:"3px", paddingBottom:"3px", paddingLeft:"6px", paddingRight:"6px", cursor:"pointer", borderRadius:"3px"}}>
                                    Save
                                </div>
                                <div onClick={async()=>{
                                    await saveWorkflow()
                                }} style={{alignItems:"center", gap:"3px",backgroundColor:"#355166", paddingTop:"3px", paddingBottom:"3px", paddingLeft:"6px", paddingRight:"6px", cursor:"pointer", borderRadius:"3px"}}>
                                    Save as new revision
                                </div>
                            </div>
                        </FlexBox>
                    </FlexBox>
                </ContentPanelBody>
            </ContentPanel>
        </FlexBox>
    )
}

function TabBar(props) {

    let {activeTab, setActiveTab, setSearchParams, toggleWorkflow, getWorkflowRouter, router, setRouter} = props;
    let tabLabels = [
        "Overview",
        "Revisions",
        "Working Revisions",
        "Dependency Graph", 
        "Settings"
    ]


    let tabDOMs = [];
    for (let i = 0; i < 5; i++) {

        let className = "tab-bar-item"
        if (i === activeTab) {
            className += " active"
        }

        let key = GenerateRandomKey("tab-item-")
        tabDOMs.push(
            <FlexBox key={key} className={className} onClick={() => {
                setActiveTab(i)
                setSearchParams({tab: i}, {replace:true})
            }}>
                {tabLabels[i]}
            </FlexBox>
        )
    }

    return (
        <FlexBox className="tab-bar">
            {tabDOMs}
            <FlexBox className="tab-bar-item gap uninteractive">
            <label className="switch">
                <input onChange={async()=>{
                    await toggleWorkflow(!router.live)
                    setRouter(await getWorkflowRouter())
                }} type="checkbox" checked={router ? router.live : false}/>
                <span className="slider-broadcast"></span>
            </label>
            <div className="rev-toggle-label hide-on-small">
                Enabled
            </div>
            </FlexBox>
        </FlexBox>
    )
}

function WorkflowInstances(props) {
    const {instances, namespace} = props

    return(
        <ContentPanelBody>
            <>
            <div style={{width: "100%"}}>
        {
            instances !== null && instances.length === 0 ? <div style={{paddingLeft:"10px", fontSize:"10pt"}}>No instances have been recently executed. Recent instances will appear here.</div>:
            <table className="instances-table" style={{width: "100%"}}>
            <thead>
                <tr>
                    <th>
                        State
                    </th>
                    <th>
                        Name
                    </th>
                    <th>
                        Started <span className="hide-on-small">at</span>
                    </th>
                    <th>
                        <span className="hide-on-small">Last</span> Updated
                    </th>
                </tr>
            </thead>
            <tbody>
                {instances !== null ? 
                <>
                    <>
                    {instances.map((obj)=>{
                    let key = GenerateRandomKey("instance-")
                    return(
                        <InstanceRow
                            key={key}
                            namespace={namespace}
                            state={obj.node.status} 
                            name={obj.node.as} 
                            id={obj.node.id}
                            started={dayjs.utc(obj.node.createdAt).local().format("HH:mm a")} 
                            startedFrom={dayjs.utc(obj.node.createdAt).local().fromNow()}
                            finished={dayjs.utc(obj.node.updatedAt).local().format("HH:mm a")}
                            finishedFrom={dayjs.utc(obj.node.updatedAt).local().fromNow()}
                        />
                    )
                    })}</>
                </>
                :<></>}
            </tbody>
        </table>}
            </div>
            </>
        </ContentPanelBody>
    )
}

function OverviewTab(props) {
    const {getInstancesForWorkflow,  namespace, filepath} = props

    const [load, setLoad] = useState(true)
    const [instances, setInstances] = useState([])
    const [err, setErr] = useState(null)

    // fetch instances using the workflow hook from above
    useEffect(()=>{
        async function listData() {
            if(load){
                // get the instances
                let resp = await getInstancesForWorkflow()
                if(Array.isArray(resp)){
                    setInstances(resp)
                } else {
                    setErr(resp)
                }

            }
            setLoad(false)
        }
        listData()
    },[load, getInstancesForWorkflow])


    return(
        <>
            <div className="gap">
                <FlexBox className="gap wrap">
                    <FlexBox style={{ minWidth: "370px", width:"60%", maxHeight: "342px"}}>
                        <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                            <ContentPanelTitle>
                                <ContentPanelTitleIcon>
                                    <BsCodeSquare />
                                </ContentPanelTitleIcon>
                                <div>
                                    Instances
                                </div>
                            </ContentPanelTitle>
                            <WorkflowInstances instances={instances} namespace={namespace} />
                        </ContentPanel>
                    </FlexBox>
                    <FlexBox style={{ minWidth: "370px", maxHeight: "342px" }}>
                        <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                            <ContentPanelTitle>
                                <ContentPanelTitleIcon>
                                    <BsCodeSquare />
                                </ContentPanelTitleIcon>
                                <div>
                                    Success/Failure Rate
                                </div>
                            </ContentPanelTitle>
                        </ContentPanel>
                    </FlexBox>
                </FlexBox>
            </div>
            <FlexBox style={{maxHeight: "140px"}}>
                <ContentPanel style={{ width: "100%", minWidth: "300px" }}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <BsCodeSquare />
                        </ContentPanelTitleIcon>
                        <div>
                            Traffic Distribution
                        </div>
                    </ContentPanelTitle>
                </ContentPanel>
            </FlexBox>
            <FlexBox>
                <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <BsCodeSquare />
                        </ContentPanelTitleIcon>
                        <div>
                            Workflow Services
                        </div>
                    </ContentPanelTitle>
                    <WorkflowServices namespace={namespace} filepath={filepath} />
                </ContentPanel>
            </FlexBox>
        </>
    )
}

function WorkflowServices(props) {
    const {namespace, filepath} = props

    const {data, err} = useWorkflowServices(Config.url, true, namespace, filepath.substring(1))
    if (data === null) {
        return <></>
    }

    return(
        <ContentPanelBody>
            <ul style={{listStyle:"none", margin:0, paddingLeft:"10px"}}>
                {data.map((obj)=>{
                    return(
                        <Link to={`/n/${namespace}/explorer/${filepath.substring(1)}?function=${obj.info.name}&version=${obj.info.revision}`}>
                            <li style={{display:"flex", alignItems:'center', gap :"10px"}}>
                                <ServiceStatus status={obj.status}/>
                                {obj.info.name}({obj.info.image})
                            </li>
                        </Link>
                    )
                })}
            </ul>
        </ContentPanelBody>
    )
}
 
function RevisionView(props) {
    const {searchParams, setSearchParams, revision} = props
    return(
        <FlexBox>
        <FlexBox className="col gap" style={{maxHeight:"100px"}}>
            <FlexBox>
                Back to All Revisions
            </FlexBox>
            <FlexBox>
            <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                <ContentPanelTitle>
                    <ContentPanelTitleIcon>
                        <BsCodeSquare />
                    </ContentPanelTitleIcon>
                    <div>
                       {revision}
                    </div>
                    <FlexBox style={{maxWidth:"150px"}}>
                        <FlexBox>
                            <Button className="reveal-btn small shadow">
                                <FlexBox className="gap">
                                    <div>
                                       YAML
                                    </div>
                                </FlexBox>
                            </Button>
                        </FlexBox>
                        <FlexBox>
                            <Button className="reveal-btn small shadow">
                                <FlexBox className="gap">
                                    <div>
                                       Diagram
                                    </div>
                                </FlexBox>
                            </Button>
                        </FlexBox>
                        <FlexBox>
                            <Button className="reveal-btn small shadow">
                                <FlexBox className="gap">
                                    <div>
                                       Sankey
                                    </div>
                                </FlexBox>
                            </Button>
                        </FlexBox>
                    </FlexBox>
                </ContentPanelTitle>
                <ContentPanelBody>
                    
                </ContentPanelBody>
            </ContentPanel>
            </FlexBox>
        </FlexBox>
    </FlexBox>
    )

}

function RevisionSelectorTab(props) {
    const {getRevisions, deleteRevision, searchParams, setSearchParams} = props
    const [load, setLoad] = useState(true)
    const [revisions, setRevisions] = useState([])
    const [revision, setRevision] = useState(null)
    const [err, setErr] = useState(null)

    // fetch revisions using the workflow hook from above
    useEffect(()=>{
        async function listData() {
            if(load){
                // get the instances
                let resp = await getRevisions()
                if(Array.isArray(resp)){
                    setRevisions(resp)
                } else {
                    setErr(resp)
                }

            }
            setLoad(false)
        }
        listData()
    },[load, getRevisions])

    useEffect(()=>{
        if(searchParams.get('revision') !== null) {
            setRevision(searchParams.get('revision'))
        }
    },[searchParams])
    if(revision !== null) {
        return(
            <RevisionView  searchParams={searchParams} setSearchParams={setSearchParams} revision={revision}/>
        )
    }

    return(
        <>
            <FlexBox className="gap col wrap" style={{height:"100%"}}>
                <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <BsCodeSquare />
                        </ContentPanelTitleIcon>
                        <div>
                            All Revisions
                        </div>
                    </ContentPanelTitle>
                    <ContentPanelBody>
                        <table>
                            <tbody>
                                {
                                    revisions.map((obj)=>{
                                        return(
                                            <tr>
                                                <td>
                                                    {obj.node.name}
                                                </td>
                                                <td>
                                                <Modal
                                                    escapeToCancel
                                                    style={{
                                                        flexDirection: "row-reverse",
                                                    }}
                                                    title="Delete a revision" 
                                                    button={(
                                                        <div className="secrets-delete-btn grey-text auto-margin red-text" style={{display: "flex", alignItems: "center", height: "100%"}}>
                                                        <RiDeleteBin2Line className="auto-margin"/>
                                                    </div>
                                                    )}
                                                    actionButtons={
                                                        [
                                                            ButtonDefinition("Delete", async () => {
                                                                let err = await deleteRevision(obj.node.name)
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
                                                </td>
                                                <td>
                                                    set working rev
                                                </td>
                                                <td onClick={()=>{
                                                    setSearchParams({tab: 1, revision: obj.node.name}, {replace: true})
                                                }}>
                                                    open revision
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </ContentPanelBody>
                </ContentPanel>
                <ContentPanel style={{ width: "100%", minWidth: "300px", minHeight:"200px"}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <BsCodeSquare />
                        </ContentPanelTitleIcon>
                        <div>
                            Revision Traffic Shaping
                        </div>
                    </ContentPanelTitle>
                    <ContentPanelBody>
                        testing
                    </ContentPanelBody>
                </ContentPanel>
            </FlexBox>
        </>
    )
}


function RevisionSelectedTab(props) {
    return(
        <>
            <FlexBox>
                <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <BsCodeSquare />
                        </ContentPanelTitleIcon>
                        <div>
                            Revision Name
                        </div>
                        <FlexBox style={{justifyContent: "end", paddingRight: "8px"}}>
                            <div>
                                <FlexBox className="revision-panel-btn-bar">
                                    <div>Editor</div>
                                    <div>Diagram</div>
                                    <div>Sankey</div>
                                </FlexBox>
                            </div>
                        </FlexBox>
                    </ContentPanelTitle>
                    <ContentPanelBody>
                        testing
                    </ContentPanelBody>
                </ContentPanel>
            </FlexBox>
        </>
    )
}

function SettingsTab(props) {

    const {namespace, workflow} = props

    return (
        <>
            <FlexBox className="gap wrap col">
                <div style={{width: "100%", minHeight: "200px"}}>
                    <AddWorkflowVariablePanel namespace={namespace} workflow={workflow} />
                </div>
                <FlexBox className="gap wrap">
                    <FlexBox style={{maxHeight: "200px", flexGrow: "5"}}>
                        <div style={{width: "100%", minHeight: "200px"}}>
                            <ContentPanel style={{width: "100%", height: "100%"}}>
                                <ContentPanelTitle>
                                    <ContentPanelTitleIcon>
                                        <IoMdLock/>
                                    </ContentPanelTitleIcon>
                                    Add Attributes
                                    <ContentPanelHeaderButton>
                                        + Add
                                    </ContentPanelHeaderButton>
                                </ContentPanelTitle>
                                <ContentPanelBody>

                                </ContentPanelBody>
                            </ContentPanel>
                        </div>
                    </FlexBox>
                    <FlexBox style={{maxHeight: "200px", flexGrow: "1"}}>          
                        <div style={{width: "100%", minHeight: "200px"}}>
                            <ContentPanel style={{width: "100%", height: "100%"}}>
                                <ContentPanelTitle>
                                    <ContentPanelTitleIcon>
                                        <IoMdLock/>
                                    </ContentPanelTitleIcon>
                                    Log to Event
                                </ContentPanelTitle>
                                <ContentPanelBody>
                                    <FlexBox className="gap" style={{
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <label className="switch">
                                            <input type="checkbox" />
                                            <span className="slider-broadcast"></span>
                                        </label>
                                        <div className="rev-toggle-label hide-on-small">
                                            Enabled
                                        </div>                          
                                    </FlexBox>
                                </ContentPanelBody>
                            </ContentPanel>
                        </div>
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        </>
    )

}

