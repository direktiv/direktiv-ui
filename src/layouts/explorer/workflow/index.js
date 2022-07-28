import { useWorkflow, useWorkflowServices } from 'direktiv-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VscFileCode } from 'react-icons/vsc';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from '../../../components/content-panel';
import FlexBox from '../../../components/flexbox';
import { PaginationV4, usePageHandler } from '../../../components/paginationv2';
import { Config, GenerateRandomKey } from '../../../util';
import './style.css';

import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { InstanceRow } from '../../instances';

import { VscChevronDown, VscChevronUp, VscError, VscLayers, VscNote, VscPass, VscPieChart, VscTag, VscTypeHierarchySub, VscVmRunning } from 'react-icons/vsc';

import YAML from 'js-yaml';
import DiagramEditor from '../../../components/diagram-editor';
import DirektivEditor from '../../../components/editor';
import { Service } from '../../namespace-services';
import { RevisionSelectorTab, TabbedButtons } from './revisionTab';
import AddWorkflowVariablePanel from './variables';

import WorkflowDiagram from '../../../components/diagram';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Button from '../../../components/button';
import Modal, { ButtonDefinition } from '../../../components/modal';

import { PieChart } from 'react-minimal-pie-chart';
import { AutoSizer } from "react-virtualized";
import Alert from '../../../components/alert';
import HelpIcon from "../../../components/help";
import Loader from '../../../components/loader';
import SankeyDiagram from '../../../components/sankey';

import Form from "@rjsf/core";
import { windowBlocker } from '../../../components/diagram-editor/usePrompt';
import Tabs from '../../../components/tabs';

dayjs.extend(utc)
dayjs.extend(relativeTime);

const PAGE_SIZE = 4

function WorkflowPage(props) {
    const {namespace} = props
    const [searchParams, setSearchParams] = useSearchParams()
    const params = useParams()
    const [load, setLoad] = useState(true);

    // set tab query param on load
    useEffect(()=>{
        if(searchParams.get('tab') === null) {
            setSearchParams({tab: 0}, {replace:true})
        }

        setLoad(false)
    },[searchParams, setSearchParams, setLoad])
    
    let filepath = "/"

    if(!namespace) {
        return <> </>
    }

    if(params["*"] !== undefined){
        filepath = `/${params["*"]}`
    }

    return(
        <Loader load={load} timer={3000}>
            <InitialWorkflowHook setSearchParams={setSearchParams} searchParams={searchParams} namespace={namespace} filepath={filepath}/>
        </Loader>
    )
}

function InitialWorkflowHook(props){
    const {namespace, filepath, searchParams, setSearchParams} = props

    const [activeTab, setActiveTab] = useState(searchParams.get("tab") !== null ? parseInt(searchParams.get('tab')): 0)
    const [tabBlocker, setTabBlocker] = useState(false)

    useEffect(()=>{
        setActiveTab(searchParams.get("tab") !== null ? parseInt(searchParams.get('tab')): 0)
    }, [searchParams])
    // todo handle err from hook below
    const {data,  getSuccessFailedMetrics, tagWorkflow, addAttributes, deleteAttributes, setWorkflowLogToEvent, editWorkflowRouter, getWorkflowSankeyMetrics, getWorkflowRevisionData, getWorkflowRouter, toggleWorkflow, executeWorkflow, getInstancesForWorkflow, getRevisions, getTags, deleteRevision, saveWorkflow, updateWorkflow, discardWorkflow, removeTag, executeWorkflowRouter} = useWorkflow(Config.url, true, namespace, filepath.substring(1), localStorage.getItem("apikey"))
    const [router, setRouter] = useState(null)


    const [revisions, setRevisions] = useState(null)
    // todo handle revsErr
    const [, setRevsErr] = useState("")

    // fetch revisions using the workflow hook from above
    useEffect(()=>{
        async function listData() {
            if(revisions === null){
                // get workflow revisions
                let resp = await getRevisions()
                if(Array.isArray(resp.results)){
                    setRevisions(resp.results)
                } else {
                    setRevsErr(resp)
                }
            }
        }
        listData()
    },[getRevisions, revisions])

    useEffect(()=>{
        async function getD() {
            if(data !== null && router === null) {
                setRouter(await getWorkflowRouter())
            }
        }
        getD()
    },[router, data, getWorkflowRouter])

    if(data === null || router === null) {
        return <></>
    }
    
    return(
        <>
            <FlexBox id="workflow-page" className="gap col" style={{paddingRight: "8px"}}>
                <TabBar setRouter={setRouter} router={router} getWorkflowRouter={getWorkflowRouter} toggleWorkflow={toggleWorkflow}  setSearchParams={setSearchParams} activeTab={activeTab} setActiveTab={setActiveTab} 
                block={tabBlocker}
                setBlock={setTabBlocker}
                blockMsg={"Warning Unsaved Changes. Are you sure you want to leave?"}/>
                <FlexBox className="col gap">
                    { activeTab === 0 ? 
                        <OverviewTab getSuccessFailedMetrics={getSuccessFailedMetrics} router={router} namespace={namespace} getInstancesForWorkflow={getInstancesForWorkflow} filepath={filepath}/>
                    :<></>}
                    { activeTab === 1 ?
                        <>
                        <RevisionSelectorTab 
                        workflowName={filepath.substring(1)}
                        tagWorkflow={tagWorkflow}
                         namespace={namespace}
                          filepath={filepath} updateWorkflow={updateWorkflow} setRouter={setRouter} editWorkflowRouter={editWorkflowRouter} getWorkflowRouter={getWorkflowRouter} setRevisions={setRevisions} revisions={revisions} router={router} getWorkflowSankeyMetrics={getWorkflowSankeyMetrics} executeWorkflow={executeWorkflow} getWorkflowRevisionData={getWorkflowRevisionData} searchParams={searchParams} setSearchParams={setSearchParams} deleteRevision={deleteRevision}  getRevisions={getRevisions} getTags={getTags} removeTag={removeTag} executeWorkflowRouter={executeWorkflowRouter}
                          />
                        </>
                    :<></>}
                    { activeTab === 2 ?
                        <WorkingRevision 
                            getWorkflowSankeyMetrics={getWorkflowSankeyMetrics}
                            searchParams={searchParams}
                            setSearchParams={setSearchParams}
                            namespace={namespace}
                            executeWorkflow={executeWorkflow}
                            saveWorkflow={saveWorkflow} 
                            updateWorkflow={updateWorkflow} 
                            discardWorkflow={discardWorkflow} 
                            updateRevisions={() => {
                                setRevisions(null)
                            }}
                            wf={atob(data.revision.source)} 
                            tabBlocker={tabBlocker} 
                            setTabBlocker={setTabBlocker}
                        />
                    :<></>}
                    { activeTab === 3 ?
                        <SettingsTab addAttributes={addAttributes} deleteAttributes={deleteAttributes} workflowData={data} setWorkflowLogToEvent={setWorkflowLogToEvent} namespace={namespace} workflow={filepath} />
                    :<></>}
                </FlexBox>
            </FlexBox>
        </>
    )
}

export default WorkflowPage;

function WorkingRevisionErrorBar(props) {
    const { errors, showErrors } = props

    return (
        <div className={`editor-drawer ${showErrors ? "expanded" : ""}`}>
            <FlexBox className="col">
                <FlexBox className="row" style={{ justifyContent: "flex-start", alignItems: "center", borderBottom: "1px solid #536470", padding: "6px 10px 6px 10px" }}>
                    <div style={{ paddingRight: "6px" }}>
                        Problem
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%", backgroundColor: "#384c5a", width: "18px", height: "18px", fontWeight: "bold", textAlign: "center" }}>
                        <pre style={{ margin: "0px", fontSize: "medium" }}>{errors.length}</pre>
                    </div>
                </FlexBox>
                <FlexBox className="col" style={{ padding: "6px 10px 6px 10px", overflowY: "scroll" }}>
                    {errors.length > 0 ?
                        <>
                            {errors.map((err) => {
                                return (
                                    <FlexBox className="row" style={{ justifyContent: "flex-start", alignItems: "center", paddingBottom: "4px" }}>
                                        <VscError style={{ paddingRight: "6px", color: "#ec4f79" }} />
                                        <div>
                                            {err}
                                        </div>
                                    </FlexBox>)

                            })}

                        </>
                        :
                        <FlexBox className="row" style={{ justifyContent: "flex-start", alignItems: "center" }}>
                            <VscPass style={{ paddingRight: "6px", color: "#28a745" }} />
                            <div>
                                No Errors
                            </div>
                        </FlexBox>
                    }
                </FlexBox>
            </FlexBox>
        </div>
    )
}

function WorkingRevision(props) {
    const {updateRevisions, searchParams, setSearchParams, getWorkflowSankeyMetrics, wf, updateWorkflow, discardWorkflow, saveWorkflow, executeWorkflow,namespace, tabBlocker, setTabBlocker} = props

    const navigate = useNavigate()
    const [load, setLoad] = useState(true)
    const [oldWf, setOldWf] = useState("")
    const [workflow, setWorkflow] = useState("")
    const [input, setInput] = useState("{\n\t\n}")

    const [tabIndex, setTabIndex] = useState(0)
    const [workflowJSONSchema, setWorkflowJSONSchema] = useState(null)
    const [inputFormSubmitRef, setInputFormSubmitRef] = useState(null)

    const [canSave, setCanSave] = useState(false)

    const [tabBtn, setTabBtn] = useState(searchParams.get('revtab') !== null ? parseInt(searchParams.get('revtab')): 0);

    useEffect(()=>{
        setTabBtn(searchParams.get('revtab') !== null ? parseInt(searchParams.get('revtab')): 0)
    }, [searchParams])

    // Error States
    const [errors, setErrors] = useState([])
    const [showErrors, setShowErrors] = useState(false)

    // Loading States
    // Tracks if a button tied to a operation is currently executing.
    const [opLoadingStates, setOpLoadingStates] = useState({
        "IsLoading": false,
        "Save": false,
        "Update": false,
        "Undo": false
    })

    // Push a operation loading state to a target.
    const pushOpLoadingState = useCallback((target, value)=>{
        let old = opLoadingStates
        old[target] = value

        // If any operation is executing, this is set to ture
        old["IsLoading"] = (opLoadingStates["Save"] || opLoadingStates["Update"] || opLoadingStates["Undo"])
        setOpLoadingStates({...old})
    },[opLoadingStates])

    useEffect(()=>{
        if(wf !== workflow && load) {
            setLoad(false)
            setWorkflow(wf)
        }
    },[wf, workflow, load])

    useEffect(()=>{
        if (load) {return}
        if(workflow !== oldWf) {
            setCanSave(true)
        } else {
            setCanSave(false)
        }
    },[load, workflow, oldWf])

    useEffect(()=>{
        if (oldWf !== wf) {
            setWorkflow(wf)
            setOldWf(wf)
            pushOpLoadingState("Save", false)
        }
    },[oldWf, wf, pushOpLoadingState])

    const saveFn = useCallback(()=>{
        if (!canSave) {
            setErrors(["Can't save - no changes have been made."])
            setShowErrors(true)
            pushOpLoadingState("Save", false)
            return
        }
        setErrors([])
        pushOpLoadingState("Save", true)
        updateWorkflow(workflow).then(()=>{
            setShowErrors(false)
            setTabBlocker(false)
        }).catch((opError) => {
            setErrors([opError.message])
            setShowErrors(true)
            pushOpLoadingState("Save", false)
        })
    }, [workflow, pushOpLoadingState, updateWorkflow, canSave, setTabBlocker])

    return(
        <FlexBox style={{width:"100%"}}>
            <ContentPanel style={{width:"100%"}}>
                <ContentPanelTitle>
                    <ContentPanelTitleIcon>
                        <VscFileCode />
                    </ContentPanelTitleIcon>
                    <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                        <div>
                            Active Revision
                        </div>
                        <HelpIcon msg={"Latest revision where you can edit and create new revisions."} />
                        <TabbedButtons revision={"latest"} setSearchParams={setSearchParams} searchParams={searchParams} tabBtn={tabBtn} setTabBtn={setTabBtn} enableDiagramEditor={!canSave} block={tabBlocker} blockMsg={"Warning Unsaved Changes. Are you sure you want to leave?"} setBlock={setTabBlocker}/>
                    </FlexBox>
                </ContentPanelTitle>
                <ContentPanelBody style={{padding: "0px"}}>
                {tabBtn === 0 ?
                    <FlexBox className="col" style={{ overflow: "hidden" }}>
                        <FlexBox>
                            <DirektivEditor saveFn={saveFn} style={{borderRadius: "0px"}} dlang="yaml" value={workflow} dvalue={oldWf} setDValue={setWorkflow} disableBottomRadius={true}/>
                        </FlexBox>
                        <FlexBox className="gap editor-footer">
                            <WorkingRevisionErrorBar errors={errors} showErrors={showErrors}/>
                            <div style={{ display: "flex", flex: 1 }}>
                                <Button 
                                    className="terminal small" 
                                    loading={opLoadingStates["IsLoading"]} 
                                    tip={"Revert workflow to previous revision"}
                                    disabledTip={"Cannot revert while theres changes"}
                                    disabled={canSave}
                                    onClick={async () => {
                                        setErrors([])
                                        await discardWorkflow()
                                        setShowErrors(false)
                                }}>
                                    Revert
                                </Button>
                            </div>
                            <div style={{display:"flex", flex:1, justifyContent:"center"}}>
                                { workflow !== oldWf ?
                                <Button tip={"Requires save"} className="terminal small" disabled={true}>
                                    Run
                                </Button>
                                : <Modal 
                                    style={{ justifyContent: "center" }}
                                    className="run-workflow-modal"
                                    modalStyle={{color: "black", width: "600px", minWidth:"30vw"}}
                                    title={`Run Workflow`}
                                    buttonDisabled={opLoadingStates["IsLoading"]}
                                    onClose={()=>{
                                        setInput("{\n\t\n}")
                                        setTabIndex(0)
                                        setWorkflowJSONSchema(null)
                                    }}
                                    actionButtons={[
                                        ButtonDefinition(`${tabIndex === 0 ? "Run": "Generate JSON"}`, async () => {
                                            if (tabIndex === 1) {
                                                inputFormSubmitRef.click()
                                                return
                                            }
                                            let r = ""
                                            r = await executeWorkflow(input)
                                            if(r.includes("execute workflow")){
                                                // is an error
                                                throw new Error(r)
                                            } else {
                                                navigate(`/n/${namespace}/instances/${r}`)
                                            }
                                        }, `small ${tabIndex === 1 && workflowJSONSchema === null ? "disabled" : ""}`, ()=>{}, tabIndex === 0, false),
                                        ButtonDefinition("Cancel", async () => {
                                        }, "small light", ()=>{}, true, false)
                                    ]}
                                    onOpen={()=>{
                                        try{
                                            let wfObj =  YAML.load(oldWf)
                                            if (wfObj && wfObj.states && wfObj.states.length > 0 && wfObj.states[0].type === "validate") {
                                                setWorkflowJSONSchema(  wfObj.states[0].schema)
                                                setTabIndex(1)
                                            }
                                        } catch (e){}
                                    }}
                                    button={(
                                        <Button tip={"Run Workflow"}className="terminal small" disabled={opLoadingStates["IsLoading"]}>
                                            Run
                                        </Button>
                                    )}
                                >
                                    <FlexBox style={{ height: "45vh", minWidth: "250px", minHeight: "160px", overflow:"hidden" }}>
                                        <Tabs
                                            id={"wf-execute-input"}
                                            key={"inputForm"}
                                            callback={setTabIndex}
                                            tabIndex={tabIndex}
                                            style={tabIndex === 1 ? { overflowY: "auto", paddingTop: "1px" } : { paddingTop: "1px" }}
                                            headers={["JSON", "Form"]}
                                            tabs={[(
                                                <FlexBox>
                                                    <AutoSizer>
                                                        {({ height, width }) => (
                                                            <DirektivEditor height={height} width={width} dlang="json" dvalue={input} setDValue={setInput} />
                                                        )}
                                                    </AutoSizer>
                                                </FlexBox>
                                            ), (<FlexBox className="col" style={{ overflow: "hidden" }}>
                                                {workflowJSONSchema === null ?
                                                    <div className='container-alert' style={{ textAlign: "center", height: "80%" }}>
                                                        Workflow first state must be a validate state to generate form.
                                                    </div> : <></>
                                                }
                                                <div className="formContainer">
                                                    <Form onSubmit={(form) => {
                                                        setInput(JSON.stringify(form.formData, null, 2))
                                                        setTabIndex(0)
                                                    }}
                                                        schema={workflowJSONSchema ? workflowJSONSchema : {}} >
                                                        <button ref={setInputFormSubmitRef} style={{ display: "none" }} />
                                                    </Form>
                                                </div>
                                            </FlexBox>)]} />
                                    </FlexBox>
                                </Modal>}
                            </div>
                            <div style={{ display: "flex", flex: 1, gap: "3px", justifyContent: "flex-end", paddingRight: "10px"}}>

                                <Button 
                                    tip={"Save workflow to latest"} 
                                    disabledTip={"No changes to workflow"}
                                    className="terminal small"
                                    loading={opLoadingStates["Save"]} 
                                    disabled={!canSave}
                                    onClick={async () => {
                                        setErrors([])
                                        pushOpLoadingState("Save", true)
                                        updateWorkflow(workflow).then(()=>{
                                            setShowErrors(false)
                                            setTabBlocker(false)
                                        }).catch((opError) => {
                                            setErrors([opError.message])
                                            setShowErrors(true)
                                            pushOpLoadingState("Save", false)
                                        })
                                }}>
                                    Save
                                </Button>

                                <Button 
                                    tip={"Save latest workflow as new revision"} 
                                    disabledTip={"Requires save"}
                                    className="terminal small"
                                    loading={opLoadingStates["IsLoading"]} 
                                    disabled={canSave}
                                    onClick={async () => {
                                        setErrors([])
                                        try{
                                            const result = await saveWorkflow()
                                            if(result?.node?.name)
                                            {
                                                updateRevisions()
                                                setShowErrors(false)
                                                navigate(`/n/${namespace}/explorer${result.path}?tab=1&revision=${result.revision.name}&revtab=0`)
                                            }else{
                                                setErrors("Something went wrong")
                                                setShowErrors(true)
                                            }
                                        }catch(e){
                                            setErrors(e.toString())
                                            setShowErrors(true)
                                        }
                                }}>
                                    Make Revision
                                </Button>

                                <Button 
                                    tip={`${showErrors ? "Hide Problems": "Show Problems"}`} 
                                    className="terminal small"
                                    style={{width:"24px", paddingLeft: "0px", paddingRight: "0px"}}
                                    onClick={async () => {
                                        setShowErrors(!showErrors)
                                }}>
                                    <FlexBox className="center">
                                        {showErrors?
                                        <VscChevronDown style={{ width: "80%", height: "80%" }} />
                                        :
                                        <VscChevronUp style={{ width: "80%", height: "80%" }} />
                                        }
                                    </FlexBox>
                                </Button>
                            </div>
                        </FlexBox>
                    </FlexBox>:""}
                    {tabBtn === 1 ? <DiagramEditor block={tabBlocker} setBlock={setTabBlocker} workflow={oldWf} namespace={namespace} updateWorkflow={(data)=>{
                        setWorkflow(data)
                        setTabBtn(0)
                    }}/>:""}
                    {tabBtn === 2 ? <WorkflowDiagram disabled={true} workflow={oldWf}/>:""}
                    {tabBtn === 3 ? <SankeyDiagram revision={"latest"} getWorkflowSankeyMetrics={getWorkflowSankeyMetrics} />:""}
                </ContentPanelBody>
            </ContentPanel>
        </FlexBox>
    )
}

function TabBar(props) {

    let {activeTab, setActiveTab, setSearchParams, toggleWorkflow, getWorkflowRouter, router, setRouter, block, setBlock, blockMsg} = props;
    const tabLabels = [
        "Overview",
        "Revisions",
        "Active Revision",
        "Settings"
    ]


    let tabDOMs = [];
    for (let i = 0; i < 4; i++) {

        let className = "tab-bar-item"
        if (i === activeTab) {
            className += " active"
        }

        let key = GenerateRandomKey("tab-item-")
        tabDOMs.push(
            <FlexBox key={key} className={className} onClick={(e) => {
                if (block) {
                    e.stopPropagation();
                    if (!windowBlocker(blockMsg)) {
                        return
                    }

                    setBlock(false)
                }

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
            <div className="rev-toggle-label hide-600">
                {!router.live ? 
                    "Disabled":
                    "Enabled"}
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
                    <th className="center-align" style={{maxWidth: "120px", minWidth: "120px", width: "120px"}}>
                        State
                    </th>
                    {/* <th className="center-align">
                        Name
                    </th> */}
                    <th className="center-align">
                        Revision
                    </th>
                    <th className="center-align">
                        Started <span className="hide-600">at</span>
                    </th>
                    <th className="center-align">
                        <span className="hide-600">Last</span> Updated
                    </th>
                </tr>
            </thead>
            <tbody>
                {instances !== null ? 
                <>
                    <>
                    {instances.map((obj)=>{

                    let state = obj.status;
                    if (obj.errorCode === "direktiv.cancels.api") {
                        state = "cancelled"
                    }

                    let key = GenerateRandomKey("instance-")
                    return(
                        <InstanceRow
                            wf={true}
                            key={key}
                            namespace={namespace}
                            state={state} 
                            name={obj.as} 
                            id={obj.id}
                            startedDate={dayjs.utc(obj.createdAt).local().format("DD MMM YY")} 
                            startedTime={dayjs.utc(obj.createdAt).local().format("HH:mm a")} 
                            finishedDate={dayjs.utc(obj.updatedAt).local().format("DD MMM YY")}
                            finishedTime={dayjs.utc(obj.updatedAt).local().format("HH:mm a")} 
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
    const {getInstancesForWorkflow,  namespace, filepath, router, getSuccessFailedMetrics} = props
    const [load, setLoad] = useState(true)
    const [instances, setInstances] = useState([])
    const [err, setErr] = useState(null)
    const [pageInfo, setPageInfo] = useState(null)
    
    const pageHandler = usePageHandler(PAGE_SIZE)

    // fetch instances using the workflow hook from above
    useEffect(() => {
        async function listData() {
            // get the instances
            try {
                let resp = await getInstancesForWorkflow(pageHandler.pageParams)
                setPageInfo(resp?.instances?.pageInfo)
                if (Array.isArray(resp?.instances?.results)) {
                    setInstances(resp?.instances?.results)
                } else {
                    setErr(resp)
                }
            } catch (e) {
                setErr(e)
            }
        }

        listData()
    }, [pageHandler.pageParams, getInstancesForWorkflow])

    if (err) {
        // TODO report error
    }

    return(
        <>
            <div className="gap">
                <FlexBox className="gap wrap">
                    <FlexBox style={{ minWidth: "370px", width:"60%", maxHeight: "342px"}}>
                        <ContentPanel style={{ width: "100%", minWidth: "300px", overflowY: "auto"}}>
                            <ContentPanelTitle>
                                <ContentPanelTitleIcon>
                                    <VscVmRunning />
                                </ContentPanelTitleIcon>
                                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                                    <div>
                                        Instances
                                    </div>
                                    <HelpIcon msg={"List of instances for this workflow."} />
                                </FlexBox>
                            </ContentPanelTitle>
                            <WorkflowInstances instances={instances} namespace={namespace} />
                            <FlexBox className="row" style={{justifyContent:"flex-end", paddingBottom:"1em", flexGrow: 0}}>
                                <PaginationV4 pageHandler={pageHandler} pageInfo={pageInfo}/>
                            </FlexBox>
                        </ContentPanel>
                    </FlexBox>
                    <FlexBox style={{ minWidth: "370px", maxHeight: "342px" }}>
                        <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                            <ContentPanelTitle>
                                <ContentPanelTitleIcon>
                                    <VscPieChart />
                                </ContentPanelTitleIcon>
                                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                                    <div>
                                        Success/Failure Rate
                                    </div>
                                    <HelpIcon msg={"Success and failure of the workflow being run."} />
                                </FlexBox>
                            </ContentPanelTitle>
                            <ContentPanelBody>
                                <SuccessFailureGraph getSuccessFailedMetrics={getSuccessFailedMetrics} />
                            </ContentPanelBody>
                        </ContentPanel>
                    </FlexBox>
                </FlexBox>
            </div>
            <FlexBox style={{maxHeight: "140px", minHeight:"140px"}}>
                <ContentPanel style={{ width: "100%", minWidth: "300px" }}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <VscTypeHierarchySub />
                        </ContentPanelTitleIcon>
                        <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                            <div>
                                Traffic Distribution
                            </div>
                            <HelpIcon msg={"Distributed traffic between different workflow revisions."} />
                        </FlexBox>
                    </ContentPanelTitle>
                    <TrafficDistribution routes={router.routes}/>
                </ContentPanel>
            </FlexBox>
            <FlexBox>
                <ContentPanel style={{ width: "100%", minWidth: "300px"}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <VscLayers />
                        </ContentPanelTitleIcon>
                        <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                            <div>
                                Workflow Services
                            </div>
                            <HelpIcon msg={"A List of services for this workflow."} />
                        </FlexBox>
                    </ContentPanelTitle>
                    <WorkflowServices namespace={namespace} filepath={filepath} />
                </ContentPanel>
            </FlexBox>
        </>
    )
}

function SuccessFailureGraph(props){

    const {getSuccessFailedMetrics} = props
    const [metrics, setMetrics] = useState([
        {title: 'Success', value: 0, color: "url(#success)", percentage: 0},
        {title: 'Failed', value: 0, color: "url(#failed)", percentage: 0}
    ])
    const [total, setTotal] = useState(0)
    const [load, setLoad] = useState(true)
    const [err, setErr] = useState("")

    useEffect(()=>{
        async function get() {
            try {
                if(load){
                    let ms = metrics
                    let mets = await getSuccessFailedMetrics()
                    let t = 0
                    if(mets.success && mets.failure) {
                        if(mets.success[0]){
                            ms[0].value = mets.success[0].value[1]
                            t = t + parseInt(mets.success[0].value[1])
                        }
                        if(mets.failure[0]){
                            ms[1].value = mets.failure[0].value[1]
                            t = t + parseInt(mets.failure[0].value[1])
                        }
    
                        if(mets.success[0]) {
                            ms[0].percentage = (ms[0].value / t * 100).toFixed(2)
                        }
                        if(mets.failure[0]){
                            ms[1].percentage = (ms[1].value / t * 100).toFixed(2)
                        }
    
                        if(t > 0) {
                            setMetrics(ms)
                            setTotal(t)
                        } else {
                            setErr("No metrics have been found.")
                        }
                        
                    } else {
                        setErr(mets)
                    }
                    setLoad(false)
                }
            } catch(e){
                setErr(e.message)
                setLoad(false)
            }
        }
        get()
    },[load, getSuccessFailedMetrics, metrics])

    if(load){
        return ""
    }
    if(err !== "") {
        return(
            <FlexBox style={{justifyContent:"center", alignItems:'center', color:"red", fontSize:"10pt"}}>
                <div className="error-message-metrics">{err.replace("get failed metrics:", "")}</div>
            </FlexBox>
        )
    }

    return(
        <FlexBox className="col" style={{maxHeight:"250px", marginTop:"20px"}}>
            <PieChart
                totalValue={total}
                label=""
                labelStyle={{
                    fontSize:"6pt",
                    fontWeight: "bold",
                    fill: "white"
                }}
                data ={metrics}
            >
            <defs>
                <radialGradient id="failed" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F3537E" />
                    <stop offset="80%" stopColor="#DE184D" />
                </radialGradient>
                <radialGradient id="success" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1FEAC5" />
                    <stop offset="100%" stopColor="#25B49A" />
                </radialGradient>
            </defs>
            </PieChart>
            <FlexBox style={{marginTop:"10px", gap:"50px"}}>
                <FlexBox className="col">
                    <FlexBox style={{justifyContent:"center", alignItems:"center", gap:"5px", fontWeight:"bold", fontSize:"12pt"}}>
                        <div style={{height:"8px", width:"8px", background:"linear-gradient(180deg, #1FEAC5 0%, #25B49A 100%)"}} />
                        Success
                    </FlexBox>
                    <FlexBox style={{justifyContent:"center"}}>
                        {metrics[0].percentage}%
                    </FlexBox>
                </FlexBox>
                <FlexBox className="col">
                    <FlexBox style={{justifyContent:"center", alignItems:"center", gap:"5px", fontWeight:"bold", fontSize:"12pt"}}>
                        <div style={{height:"8px", width:"8px", background:"linear-gradient(180deg, #F3537E 0%, #DE184D 100%)"}} />
                        Failure
                    </FlexBox>
                    <FlexBox style={{justifyContent:"center"}}>
                        {metrics[1].percentage}%
                    </FlexBox>
                </FlexBox>
            </FlexBox>
        </FlexBox>
        
    )
}

function TrafficDistribution(props) {
    const {routes} = props

    if (!routes) {
        return <></>
    }

    // using latest for traffic
    if (routes.length === 0) {
        return (
            <ContentPanelBody>
                <FlexBox className="col gap" style={{justifyContent:"center"}}>
                    <Slider className="traffic-distribution" disabled={true}/>
                    <FlexBox className="col" style={{fontSize:"10pt", marginTop:"5px", maxHeight:"20px", color: "#C1C5C8"}}>
                        latest<span style={{fontSize:"8pt"}}>100%</span>
                    </FlexBox>
                </FlexBox>
            </ContentPanelBody>
        )
    }


    return(
        <ContentPanelBody>
            <FlexBox className="col gap" style={{justifyContent:'center'}}>
                <FlexBox style={{fontSize:"10pt", marginTop:"5px", maxHeight:"20px", color: "#C1C5C8"}}>
                    {routes[0] ? 
                    <FlexBox className="col">
                        <span title={routes[0].ref}>{routes[0].ref.substr(0, 8)}</span>
                    </FlexBox>:""}
                    {routes[1] ? 
                    <FlexBox className="col" style={{ textAlign:'right'}}>
                        <span title={routes[1].ref}>{routes[1].ref.substr(0,8)}</span>
                    </FlexBox>:""}
                </FlexBox>
                <Slider value={routes[0] ? routes.length === 2 ? `${routes[0].weight}`: `100` : 0} className="traffic-distribution" disabled={true}/>
                <FlexBox style={{fontSize:"10pt", marginTop:"5px", maxHeight:"50px", color: "#C1C5C8"}}>
                    {routes[0] ? 
                    <FlexBox className="col">
                        <span>{routes.length === 2 ? `${routes[0].weight}%`: `100%`}</span>
                    </FlexBox>:""}
                    {routes[1] ? 
                    <FlexBox className="col" style={{ textAlign:'right'}}>
                        <span>{routes[1].weight}%</span>
                    </FlexBox>:""}
                </FlexBox>
            </FlexBox>
        </ContentPanelBody>
    )
}

function WorkflowServices(props) {
    const {namespace, filepath} = props
    const {data, err, deleteWorkflowService} = useWorkflowServices(Config.url, true, namespace, filepath.substring(1), localStorage.getItem("apikey"))

    if (data === null) {
        return     <div className="col">
        <FlexBox style={{ height:"40px", }}>
                <FlexBox className="gap" style={{alignItems:"center", paddingLeft:"8px"}}>
                    <div style={{fontSize:"10pt", }}>
                        No services have been created.
                    </div>
                </FlexBox>
        </FlexBox>
    </div>
    }

    if (err) {
        // TODO report error
    }

    return(
        <ContentPanelBody>
            <FlexBox className="col gap">
                {data.length === 0 ? 
                       <div className="col">
                       <FlexBox style={{ height:"40px", }}>
                               <FlexBox className="gap" style={{alignItems:"center", paddingLeft:"8px"}}>
                                   <div style={{fontSize:"10pt", }}>
                                       No services have been created.
                                   </div>
                               </FlexBox>
                       </FlexBox>
                   </div>
                :""}
                {data.map((obj)=>{
                    return(
                        <Service
                            key={`key-${obj.info.revision}`}
                            allowRedeploy={true}
                            dontDelete={true}
                            url={`/n/${namespace}/explorer/${filepath.substring(1)}?function=${obj.info.name}&version=${obj.info.revision}`}
                            name={obj.info.name}
                            revision={obj.info.revision}
                            status={obj.status}
                            image={obj.info.image}
                            conditions={obj.conditions}
                            deleteService={deleteWorkflowService}
                        />
      
                    )
                })}
            </FlexBox>
        </ContentPanelBody>
    )
}

function WorkflowAttributes(props) {
    const {attributes, deleteAttributes, addAttributes} = props


    const [load, setLoad] = useState(true)
    const [attris, setAttris] = useState(attributes)
    const tagInput = useRef()

    useEffect(()=>{
        if(load){
            setAttris(attributes)
            setLoad(false)
        }
    },[attributes,load])

    const removeTag = async(i) => {
        // await deleteAttribute(attris[i])
        await deleteAttributes([attris[i]])
        const newTags = [...attris]
        newTags.splice(i,1)
        setAttris(newTags)
    }

    const inputKeyDown = async (e) => {
        const val = e.target.value
        if((e.key === " " || e.key === "Enter") && val) {
            if(attris.find(tag => tag.toLowerCase() === val.toLowerCase())){
                return;
            }
            try {
                await addAttributes([val])
                setAttris([...attris, val])
                tagInput.current.value = null
            } catch(e) {
                
            }
        } else if (e.key === "Backspace" && !val) {
            removeTag(attris.length - 1)
        }
    }

    return(
            // <FlexBox>
                <div className="input-tag" style={{width: "100%", padding:"2px"}}>
                    <ul className="input-tag__tags">
                        {attris.map((tag, i) => (
                            <li key={tag}>
                                {tag}
                                <button type="button" onClick={() => { removeTag(i); }}>+</button>
                            </li>
                        ))}
                        <li className="input-tag__tags__input"><input placeholder="Enter attribute" type="text" onKeyDown={inputKeyDown} ref={tagInput} /></li>
                    </ul>
                </div>
            // </FlexBox>
    )
}

function SettingsTab(props) {

    const {namespace, workflow, addAttributes, deleteAttributes, workflowData, setWorkflowLogToEvent} = props
    const [logToEvent, setLogToEvent] = useState(workflowData.eventLogging)

    const [lteStatus, setLTEStatus] = useState(null);
    const [lteStatusMessage, setLTEStatusMessage] = useState(null);

    return (
        <>
            <FlexBox className="gap wrap col">
                <div style={{width: "100%"}}>
                    <AddWorkflowVariablePanel namespace={namespace} workflow={workflow} />
                </div>
                <FlexBox className="gap">
                    <FlexBox  style={{flex:1, maxHeight: "156px", minWidth:"300px"}}>          
                        <div style={{width: "100%", minHeight: "144px"}}>
                            <ContentPanel style={{width: "100%", height: "100%"}}>
                                <ContentPanelTitle>
                                    <ContentPanelTitleIcon>
                                        <VscNote/>
                                    </ContentPanelTitleIcon>
                                    <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                                        <div>
                                            Log to Event
                                        </div>
                                        <HelpIcon msg={"Ability to trigger cloud event logging for that workflow."} />
                                    </FlexBox>
                                </ContentPanelTitle>
                                <ContentPanelBody className="col" style={{
                                    alignItems: "center"
                                }}>
                                    <FlexBox className="gap" style={{flexDirection: "column", alignItems: "center"}}>
                                        <FlexBox style={{width:"100%"}}>
                                            <input value={logToEvent} onChange={(e)=>setLogToEvent(e.target.value)} type="text" placeholder="Enter the 'event' type to send logs to" />
                                        </FlexBox>
                                        <div style={{width:"99.5%", margin:"auto", background: "#E9ECEF", height:"1px"}}/>
                                        <FlexBox className="gap" style={{justifyContent:"flex-end", width:"100%"}}>
                                            { lteStatus ? <Alert className={`${lteStatus} small`}>{lteStatusMessage}</Alert> : <></> }
                                            <Button onClick={async()=>{
                                                try { 
                                                    await setWorkflowLogToEvent(logToEvent)
                                                } catch(err) {
                                                    setLTEStatus("failed")
                                                    setLTEStatusMessage(err.message)
                                                    return err
                                                }

                                                setLTEStatus("success")
                                                setLTEStatusMessage("'Log to Event' value set!")
                                            }} className="small">
                                                Save
                                            </Button>
                                        </FlexBox>
                                    </FlexBox>
                                </ContentPanelBody>
                            </ContentPanel>
                        </div>
                    </FlexBox>

                    <FlexBox style={{flex: 4,maxWidth:"1200px", height:"fit-content", minHeight: "156px"}}>
                        {/* <div style={{width: "100%", minHeight: "200px"}}> */}
                            <ContentPanel style={{width: "100%"}}>
                                <ContentPanelTitle>
                                    <ContentPanelTitleIcon>
                                        <VscTag/>
                                    </ContentPanelTitleIcon>
                                    <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                                        <div>
                                            Add Attributes
                                        </div>
                                        <HelpIcon msg={"Attributes to define the workflow."} />
                                    </FlexBox>
                                    {/* <ContentPanelHeaderButton>
                                        + Add
                                    </ContentPanelHeaderButton> */}
                                </ContentPanelTitle>
                                <ContentPanelBody>
                                    <WorkflowAttributes attributes={workflowData.node.attributes} deleteAttributes={deleteAttributes} addAttributes={addAttributes}/>
                                </ContentPanelBody>
                            </ContentPanel>
                        {/* </div> */}
                    </FlexBox>
                </FlexBox>

            </FlexBox>
        </>
    )

}

