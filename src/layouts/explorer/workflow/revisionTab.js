import React, { useEffect, useState } from 'react';
import Button from '../../../components/button';
import { BsCodeSquare } from 'react-icons/bs';
import {HiOutlineTrash} from 'react-icons/hi';
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from '../../../components/content-panel';
import FlexBox from '../../../components/flexbox';
import {GenerateRandomKey} from '../../../util';
import {BiChevronLeft} from 'react-icons/bi';
import DirektivEditor from '../../../components/editor';
import WorkflowDiagram from '../../../components/diagram';
import YAML from 'js-yaml'
import Modal, { ButtonDefinition } from '../../../components/modal';
import SankeyDiagram from '../../../components/sankey';
import { IoSettings } from 'react-icons/io5';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
function RevisionTab(props) {

    const {searchParams, setSearchParams, revision, setRevision, getWorkflowRevisionData, getWorkflowSankeyMetrics, executeWorkflow} = props
    const [load, setLoad] = useState(true)
    const [workflow, setWorkflowData] = useState(null)
    const [tabBtn, setTabBtn] = useState(searchParams.get('revtab') !== null ? parseInt(searchParams.get('revtab')): 0);

    useEffect(()=>{
        if(searchParams.get('revtab') === null) {
            setSearchParams({
                tab: searchParams.get('tab'),
                revision: revision,
                revtab: 0
            })
        }
    },[searchParams, revision, setSearchParams])

    useEffect(()=>{
        async function getRevWorkflow() {
            if(load && searchParams.get('revtab') !== null) {
                let wfdata = await getWorkflowRevisionData(revision)
                setWorkflowData(atob(wfdata.revision.source))
                setLoad(false)
            }
        }
        getRevWorkflow()
    },[load, searchParams, getWorkflowRevisionData, revision])

    return(
        <FlexBox>
            <FlexBox className="col gap">
                <FlexBox  style={{maxHeight:"32px"}}>
                    <Button onClick={()=>{
                        setRevision(null)
                        setSearchParams({
                            tab: searchParams.get('tab')
                        })
                    }} className="small light" style={{ minWidth: "160px", maxWidth: "160px" }}>
                        <FlexBox className="gap" style={{ alignItems: "center", justifyContent: "center" }}>
                            <BiChevronLeft style={{ fontSize: "16px" }} />
                            <div>Back to All Revisions</div>
                        </FlexBox>
                    </Button>
                </FlexBox>
                <FlexBox>
                <ContentPanel style={{ width: "100%", minWidth: "300px", flex: 1}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <BsCodeSquare />
                        </ContentPanelTitleIcon>
                        <div>
                        {revision}
                        </div>
                        <TabbedButtons revision={revision} setSearchParams={setSearchParams} searchParams={searchParams} tabBtn={tabBtn} setTabBtn={setTabBtn} />
                    </ContentPanelTitle>
                    <ContentPanelBody >
                        {tabBtn === 0 ? 
                            <FlexBox className="col" style={{overflow:"hidden"}}>
                                <FlexBox >
                                    <DirektivEditor value={workflow} readonly={true} dlang="yaml" />
                                </FlexBox>
                                <FlexBox className="gap" style={{backgroundColor:"#223848", color:"white", height:"40px", maxHeight:"40px", paddingLeft:"10px", minHeight:"40px", borderTop:"1px solid white", alignItems:'center'}}>
                                    <div style={{display:"flex", flex:1 }}>
                                    </div>
                                    <div style={{display:"flex", flex:1, justifyContent:"center"}}>
                                        <div onClick={async ()=>{
                                            await executeWorkflow("", revision)
                                        }} style={{alignItems:"center", gap:"3px",backgroundColor:"#355166", paddingTop:"3px", paddingBottom:"3px", paddingLeft:"6px", paddingRight:"6px", cursor:"pointer", borderRadius:"3px"}}>
                                            Run
                                        </div>
                                    </div>
                                    <div style={{display:"flex", flex:1, gap :"3px", justifyContent:"flex-end", paddingRight:"10px"}}>
                                    </div>
                                </FlexBox>
                            </FlexBox>
                            :
                            ""
                        }
                        {tabBtn === 1 ? <WorkflowDiagram disabled={true} workflow={YAML.load(workflow)}/>:""}
                        {tabBtn === 2 ? <SankeyDiagram revision={revision} getWorkflowSankeyMetrics={getWorkflowSankeyMetrics} />:""}
                    </ContentPanelBody>
                </ContentPanel>
                </FlexBox>
            </FlexBox>
        </FlexBox>
    )

}

export default RevisionTab;

function TabbedButtons(props) {

    let {tabBtn, setTabBtn, searchParams, setSearchParams, revision} = props;

    let tabBtns = [];
    let tabBtnLabels = ["YAML", "Diagram", "Sankey"];

    for (let i = 0; i < tabBtnLabels.length; i++) {
        let key = GenerateRandomKey();
        let classes = "tab-btn";
        if (i === tabBtn) {
            classes += " active-tab-btn"
        }

        tabBtns.push(<FlexBox key={key} className={classes}>
            <div onClick={() => {
                setTabBtn(i)
                setSearchParams({
                    tab: searchParams.get('tab'),
                    revision: revision,
                    revtab: i
                })
            }}>
                {tabBtnLabels[i]}
            </div>
        </FlexBox>)
    }

    return(
            <FlexBox className="tabbed-btns-container">
                <FlexBox className="tabbed-btns" >
                    {tabBtns}
                </FlexBox>
            </FlexBox>
    )
}


export function RevisionSelectorTab(props) {
    const {getRevisions, setRevisions, err, revisions, router, deleteRevision, getWorkflowSankeyMetrics, executeWorkflow, searchParams, setSearchParams, getWorkflowRevisionData} = props
    // const [load, setLoad] = useState(true)
    const [revision, setRevision] = useState(null)

    useEffect(()=>{
        if(searchParams.get('revision') !== null) {
            setRevision(searchParams.get('revision'))
        }
    },[searchParams])

    if (err) {
        // TODO report err
    }

    if(revision !== null) {
        return(
            <RevisionTab getWorkflowSankeyMetrics={getWorkflowSankeyMetrics} executeWorkflow={executeWorkflow} setRevision={setRevision} getWorkflowRevisionData={getWorkflowRevisionData}  searchParams={searchParams} setSearchParams={setSearchParams} revision={revision}/>
        )
    }

    return (
        <div className="col">
            <ContentPanel style={{width: "100%", minWidth: "300px"}}>
                <ContentPanelTitle>
                    <ContentPanelTitleIcon>
                        <BsCodeSquare/>
                    </ContentPanelTitleIcon>
                    <div>
                        All Revisions
                    </div>
                </ContentPanelTitle>
                <ContentPanelBody style={{flexDirection: "column"}}>
                    {revisions.map((obj) => {
                        return (
                            <FlexBox className="gap wrap" style={{
                                alignItems: "center"
                            }}>
                                <FlexBox className="wrap gap" style={{
                                    flex: "4",
                                    minWidth: "300px"
                                }}>
                                    <div>
                                        <FlexBox className="col revision-label-tuple">
                                            <div>
                                                ID
                                            </div>
                                            <div>
                                                {obj.node.name}
                                            </div>
                                        </FlexBox>
                                    </div>
                                </FlexBox>
                                {router.routes.length > 0 ? 
                                  <>
                                    {router.routes.map((obj)=>{
                                        return ""
                                    })}
                                  </>
                                : <>
                                    {obj.node.name === "latest" ? 
                                    <FlexBox style={{
                                        flex: "1",
                                        maxWidth: "150px"
                                    }}>
                                        <FlexBox className="col revision-label-tuple">
                                            <div>
                                                Traffic amount
                                            </div>
                                            <div style={{width:'100%'}}>
                                                <Slider defaultValue={100} className="traffic-mini2-distribution" disabled={true}/>
                                                <div>
                                                    100%
                                                </div>
                                            </div>
                                        </FlexBox>
                                    </FlexBox>
                                    :""}
                                </>}
                                {/* <FlexBox style={{
                                    flex: "1",
                                    minWidth: "300px"
                                }}>
                                    
                                </FlexBox> */}
                                <div>
                                    <FlexBox className="gap">
                                            <Modal
                                                    escapeToCancel
                                                    style={{
                                                        flexDirection: "row-reverse",
                                                    }}
                                                    title="Delete a revision" 
                                                    button={(
                                                        <Button className="small light bold">
                                                            <HiOutlineTrash className="red-text" style={{fontSize: "16px"}} />
                                                        </Button>
                                                    )}
                                                    actionButtons={
                                                        [
                                                            ButtonDefinition("Delete", async () => {
                                                                let err = await deleteRevision(obj.node.name)
                                                                if (err) return err
                                                                setRevisions(await getRevisions())
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
                                        <Button className="small light bold">
                                            Use Revision
                                        </Button>
                                        <Button className="small light bold" onClick={()=>{
                                            setSearchParams({tab: 1, revision: obj.node.name})
                                        }}>
                                            Open Revision
                                        </Button>
                                    </FlexBox>
                                </div>
                            </FlexBox>
                        )
                    })}
                </ContentPanelBody>
            </ContentPanel>
        </div>
    )

}

export function RevisionTrafficShaper(props) {
    const {editWorkflowRouter, setRouter, getWorkflowRouter, router, revisions} = props

    const [load, setLoad] = useState(true)
    const [rev1, setRev1] = useState(router.routes.length === 0 ? "latest": "")
    const [rev2, setRev2] = useState("")
    const [traffic, setTraffic] = useState(router.routes.length === 0 ? 100 : 0)

    useEffect(()=>{
        if(load){
            if (router.routes[0]){
                setRev1(router.routes[0].ref)
                setTraffic(router.routes[0].weight)
            }

            if(router.routes[1]){
                setRev2(router.routes[1].ref)
            }
            setLoad(false)
        }
    },[load, router.routes,rev1, rev2])

    console.log(traffic)
    useEffect(()=>{
        if(!load){
            if(rev1 === "") {
                setTraffic(0)
            }
            if(rev2 === "") {
                setTraffic(100)
            }
        }
    },[rev1, rev2, load])

    return(
        <>
        <ContentPanel>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <IoSettings />
                </ContentPanelTitleIcon>
                <div>
                    Traffic Shaping
                </div>
            </ContentPanelTitle>
            <ContentPanelBody style={{flexDirection:"column"}}>
                <FlexBox className="gap wrap" style={{justifyContent: "space-between"}}>
                    <FlexBox style={{maxWidth: "300px", justifyContent: "center"}}>
                        <FlexBox className="gap col">
                            <div>
                                <b>Revision 1</b>
                            </div>
                            <select onChange={(e)=>setRev1(e.target.value)} value={rev1}>
                                <option value="">Select a workflow revision</option>
                                {revisions.map((obj)=>{
                                    if(rev2 === obj.node.name){
                                        return ""
                                    }
                                    return(
                                        <option value={obj.node.name}>{obj.node.name}</option>
                                    )
                                })}
                            </select>
                        </FlexBox>
                    </FlexBox>
                    <FlexBox style={{ maxWidth: "300px", justifyContent: "center"}}>
                        <FlexBox className="gap col">
                            <div>
                                <b>Revision 2</b>
                            </div>
                            <select onChange={(e)=>setRev2(e.target.value)} value={rev2}>
                                <option value="">Select a workflow revision</option>
                                {revisions.map((obj)=>{
                                    if(rev1 === obj.node.name){
                                        return ""
                                    }
                                    return(
                                        <option value={obj.node.name}>{obj.node.name}</option>
                                    )
                                })}
                            </select>
                            {/* <input style={{width: "auto"}}></input> */}
                        </FlexBox>
                    </FlexBox>
                    <FlexBox style={{maxWidth: "300px", justifyContent: "center", paddingRight:"15px"}}>
                        <FlexBox className="gap col">
                            <div>
                                <b>Traffic Distribution</b>
                            </div>
                            <Slider disabled={rev1 !== "" && rev2 !== "" ? false: true} className="red-green" value={traffic} onChange={(e)=>{setTraffic(e)}}/>
                            <FlexBox style={{marginTop:"10px", fontSize:"10pt", color: "#C1C5C8"}}>
                                {rev1 !== "" ? 
                                <FlexBox className="col">
                                    <span title={rev1}>{rev1.substr(0,8)}</span>
                                    <span>{traffic}%</span>
                                </FlexBox>: ""}
                                {rev2 !== "" ?
                                <FlexBox  className="col" style={{justifyContent:'flex-end', textAlign:"right"}}>
                                    <span title={rev2}>{rev2.substr(0, 8)}</span>
                                    <span>{100-traffic}%</span>
                                </FlexBox>:""}
                            </FlexBox>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
                <FlexBox style={{marginTop:"10px", justifyContent:"flex-end"}}>
                    <Button onClick={async()=>{
                        let arr = []
                        if(rev1 !== "" && rev2 !== "") {
                            arr.push({
                                ref: rev1,
                                weight: parseInt(traffic)
                            })
                            arr.push({
                                ref: rev2,
                                weight: parseInt(100-traffic)
                            })
                        } else if(rev1 !== "") {
                            arr.push({
                                ref: rev1,
                                weight: 100
                            })
                        } else if(rev2 !== "") {
                            arr.push({
                                ref: rev2,
                                weight: 100
                            })
                        }
                        await editWorkflowRouter(arr, router.live)
                        setRouter(await getWorkflowRouter())
                    }} className="small">
                        Save
                    </Button>
                </FlexBox>
            </ContentPanelBody>
        </ContentPanel>
        </>
    )
}