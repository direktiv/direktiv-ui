import React from 'react';
import './style.css';
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import {VscFileCode} from 'react-icons/vsc';
import { BsDot } from 'react-icons/bs';
import HelpIcon from '../../components/help';
import { useInstances } from 'direktiv-react-hooks';
import { Config } from '../../util';

import * as dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc"
import { Link, useNavigate } from 'react-router-dom';

dayjs.extend(utc)
dayjs.extend(relativeTime);

function InstancesPage(props) {
    const {namespace} = props

    if(namespace === null) {
        return ""
    }

    return(
        <div style={{ paddingRight: "8px" }}>
            <ContentPanel>
                <ContentPanelTitle>
                    <ContentPanelTitleIcon>
                        <VscFileCode/>
                    </ContentPanelTitleIcon>
                    <FlexBox className="gap" style={{ alignItems: "center" }}>
                        <div>
                            Instances
                        </div>
                        <HelpIcon msg={"A list of recently executed instances."} />
                    </FlexBox>
                </ContentPanelTitle>
                <ContentPanelBody>
                    <InstancesTable namespace={namespace} /> 
                </ContentPanelBody>
            </ContentPanel>
        </div>
    );
}

export default InstancesPage;

function InstancesTable(props) {
    const {namespace} = props
    const {data, err} = useInstances(Config.url, true, namespace)
    console.log('current data', data, err)
    if(data === null) {
        return ""
    }

    let pageData = (
        <p>
            Recently run instances will be displayed here.
        </p>
    )

    if (data !== null) {
        if (data.length > 0) {
            pageData = [];
            data.map((obj)=>{
                return(
                    <InstanceRow 
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
                })
        }
    }

    return(
        <>
        {
            data.length === 0 ? <div style={{paddingLeft:"10px", fontSize:"10pt"}}>No instances have been recently executed. Recent instances will appear here.</div>:
    <table className="instances-table">

     <>       <thead>
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
                {data !== null ? 
                <>
                    <>
                    {data.map((obj)=>{
                    return(
                        <InstanceRow 
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
            </tbody></>
        </table>}</>
    );
}

const success = "complete";
const fail = "failed";
// there is no cancelled state
// const cancelled = "cancelled";
const running = "pending";

function InstanceRow(props) {
    let {state, name, started, startedFrom, finished, finishedFrom, id, namespace} = props;
    const navigate = useNavigate()

    console.log(state)
    let label;
    if (state === success) {
        label = <SuccessState />
    } else if (state === fail) {
        label = <FailState />
    }  else  if (state === running) {
        label = <RunningState />
    }

    return(
    
    <tr onClick={()=>{
        navigate(`/n/${namespace}/instances/${id}`)
    }} className="instance-row" style={{cursor: "pointer"}}>
        <td>
            {label}
        </td>
        <td>
                {name}
        </td>
        <td>
            {started}<span style={{fontSize:"10pt", marginLeft:"3px"}} className="grey-text hide-on-small">({startedFrom})</span>
        </td>
        <td>
            {finished}<span style={{fontSize:"10pt", marginLeft:"3px"}} className="grey-text hide-on-small">({finishedFrom})</span>
        </td>
    </tr>
    )
}

function StateLabel(props) {

    let {className, label} = props;

    return (
        <div>
            <FlexBox className={className} style={{ alignItems: "center" }} >
                <BsDot style={{ height: "32px", width: "32px", marginRight: "-8px" }} />
                <div className="hide-on-small">{label}</div>
            </FlexBox>
        </div>
    )
}

function SuccessState() {
    return (
        <StateLabel className={"success-label"} label={"Successful"} />
    )
}

function FailState() {
    return (
        <StateLabel className={"fail-label"} label={"Failed"} />
    )
}

function CancelledState() {
    return (
        <StateLabel className={"cancel-label"} label={"Cancelled"} />
    )
}

function RunningState() {
    return (
        <StateLabel className={"running-label"} label={"Running"} />
    )
}

