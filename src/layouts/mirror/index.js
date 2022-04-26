import React, { useEffect, useState, useCallback } from 'react';
import './style.css';
import './rainbow.css';

import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelHeaderButtonIcon, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import { VscAdd, VscClose, VscSearch, VscEdit, VscTrash, VscFolderOpened, VscCode, VscRepo, VscVmRunning } from 'react-icons/vsc';
import { Config, GenerateRandomKey } from '../../util';
import { FiFolder } from 'react-icons/fi';
import { FcWorkflow } from 'react-icons/fc';
import { HiOutlineTrash } from 'react-icons/hi';
import { useMirror, useNodes } from 'direktiv-react-hooks';
import { useNavigate, useParams } from 'react-router';
import Modal, { ButtonDefinition, KeyDownDefinition } from '../../components/modal'
import DirektivEditor from '../../components/editor';
import Button from '../../components/button';
import HelpIcon from "../../components/help"
import Loader from '../../components/loader';
import { useSearchParams } from 'react-router-dom';
import { AutoSizer } from 'react-virtualized';
import Pagination from '../../components/pagination';
import Alert from '../../components/alert';
import NotFound from '../notfound';

import * as dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc"

// import './style.css';
import { BsDot } from 'react-icons/bs';
// import HelpIcon from '../../components/help';
import { useInstances } from 'direktiv-react-hooks';
// import { Config, GenerateRandomKey } from '../../util';

// import * as dayjs from "dayjs"
// import relativeTime from "dayjs/plugin/relativeTime";
// import utc from "dayjs/plugin/utc"
// import { useNavigate } from 'react-router-dom';
// import Loader from '../../components/loader';
import Tippy from '@tippyjs/react';

const PAGE_SIZE = 10



function MirrorPage(props) {
    const { namespace } = props
    const params = useParams()

    let path = `/`
    if(params["*"] !== undefined){
        path = `/${params["*"]}`
    }

    console.log("!!! path = ", path)
    console.log("!!! namespace = ", namespace)
    const {data, err, getInfo, getActivityLogs, setLock, updateSettings, cancelActivity, sync} = useMirror(Config.url, false, namespace, path, localStorage.getItem("apikey"))

    console.log("data = ", data)
    console.log("err = ", err)


    if (!namespace) {
        return <></>
    }


    return (
        <FlexBox className="col gap" style={{ paddingRight: "8px" }}>
            <FlexBox className="row gap">
                <ContentPanel style={{ width: "100%", minHeight: "40vh" }}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <VscAdd />
                        </ContentPanelTitleIcon>
                        <FlexBox className="gap" style={{ alignItems: "center" }}>Activity List</FlexBox>
                    </ContentPanelTitle>
                </ContentPanel>
                <ContentPanel style={{ width: "100%", minHeight: "40vh" }}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <VscAdd />
                        </ContentPanelTitleIcon>
                        <FlexBox className="gap" style={{ alignItems: "center" }}>Mirror Info
                            <FlexBox style={{ flex: "auto", justifyContent: "right", paddingRight: "6px", alignItems: "unset" }}>
                                <ContentPanelHeaderButton>
                                    <ContentPanelHeaderButtonIcon>
                                        <VscFolderOpened />
                                    </ContentPanelHeaderButtonIcon>
                                    <FlexBox className="gap" style={{ alignItems: "center" }}>Sync</FlexBox>
                                </ContentPanelHeaderButton>
                                <ContentPanelHeaderButton>
                                    <ContentPanelHeaderButtonIcon>
                                        <VscFolderOpened />
                                    </ContentPanelHeaderButtonIcon>
                                    <FlexBox className="gap" style={{ alignItems: "center" }}>Lock</FlexBox>
                                </ContentPanelHeaderButton>
                                <ContentPanelHeaderButton>
                                    <ContentPanelHeaderButtonIcon>
                                        <VscFolderOpened />
                                    </ContentPanelHeaderButtonIcon>
                                    <FlexBox className="gap" style={{ alignItems: "center" }}>Update Settings</FlexBox>
                                </ContentPanelHeaderButton>
                            </FlexBox>
                        </FlexBox>
                    </ContentPanelTitle>
                </ContentPanel>
            </FlexBox>
            <ContentPanel style={{ width: "100%", minHeight: "40vh" }}>
                <ContentPanelTitle>
                    <ContentPanelTitleIcon>
                        <VscAdd />
                    </ContentPanelTitleIcon>
                    <FlexBox className="gap" style={{ alignItems: "center" }}>Activity Logs</FlexBox>
                </ContentPanelTitle>
                <ContentPanelBody>
                    <ActivityTable activities={data?.activities?.edges}/>
                </ContentPanelBody>
            </ContentPanel>

        </FlexBox>
    );
}

export default MirrorPage;

export function ActivityTable(props) {
    const { activities, err, panelStyle, bodyStyle, placeholder, namespace, totalCount, pageInfo } = props
    const [load, setLoad] = useState(true)

    const [queryParams, setQueryParams] = useState([`first=${PAGE_SIZE}`])
    const [queryFilters, setQueryFilters] = useState([])

    const [filterName, setFilterName] = useState("")
    const [filterCreatedBefore, setFilterCreatedBefore] = useState("")
    const [filterCreatedAfter, setFilterCreatedAfter] = useState("")
    const [filterState, setFilterState] = useState("")
    const [filterInvoker, setFilterInvoker] = useState("")

    const updatePage = useCallback((newParam) => {
        setQueryParams(newParam)
    }, [])

    console.log("!!!!!!!! activitieZZZs = ", activities)

    useEffect(() => {
        if (activities !== null || err !== null) {
            console.log("ello?")
            setLoad(false)
        }
        console.log("!!!!!!!! activities = ", activities)
    }, [activities, err])

    // Update filters array
    // useEffect(() => {
    //     // If manual filter was passed in props do not update filters during runtime
    //     if (filter) {
    //         return
    //     }

    //     let newFilters = []
    //     if (filterName !== "") {
    //         newFilters.push(`filter.field=AS&filter.type=CONTAINS&filter.val=${filterName}`)
    //     }

    //     if (filterCreatedBefore !== "") {
    //         newFilters.push(`filter.field=CREATED&filter.type=BEFORE&filter.val=${encodeURIComponent(new Date(filterCreatedBefore).toISOString())}`)
    //     }

    //     if (filterCreatedAfter !== "") {
    //         newFilters.push(`filter.field=CREATED&filter.type=AFTER&filter.val=${encodeURIComponent(new Date(filterCreatedAfter).toISOString())}`)
    //     }


    //     if (filterState !== "") {
    //         newFilters.push(`filter.field=STATUS&filter.type=MATCH&filter.val=${filterState}`)
    //     }

    //     if (filterInvoker !== "") {

    //         newFilters.push(`filter.field=TRIGGER&filter.type=CONTAINS&filter.val=${filterInvoker}`)
    //     }

    //     setQueryParams([`first=${PAGE_SIZE}`])
    //     setQueryFilters(newFilters)

    // }, [filter, filterName, filterCreatedBefore, filterCreatedAfter, filterState, filterInvoker])

    return (
        <Loader load={load} timer={3000}>
            {activities ? <>{
                activities !== null && activities.length === 0 ?
                    <div style={{ paddingLeft: "10px", fontSize: "10pt" }}>{`${placeholder ? placeholder : "No instances have been recently executed. Recent instances will appear here."}`}</div>
                    :
                    <table className="instances-table" style={{ width: "100%" }}>
                        <thead>
                            <tr>

                                <th className="center-align" style={{ maxWidth: "120px", minWidth: "120px", width: "120px" }}>State</th>
                                <th className="center-align">Name</th>
                                <th className="center-align">Started <span className="hide-on-med">at</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities !== null ?
                                <>
                                    <>
                                        {activities.map((obj) => {
                                            return (
                                                <ActivityRow
                                                    key={GenerateRandomKey()}
                                                    namespace={namespace}
                                                    state={obj.node.status}
                                                    name={obj.node.as}
                                                    id={obj.node.id}
                                                    invoker={obj.node.invoker}
                                                    startedDate={dayjs.utc(obj.node.createdAt).local().format("DD MMM YY")}
                                                    startedTime={dayjs.utc(obj.node.createdAt).local().format("HH:mm a")}
                                                    finishedDate={dayjs.utc(obj.node.updatedAt).local().format("DD MMM YY")}
                                                    finishedTime={dayjs.utc(obj.node.updatedAt).local().format("HH:mm a")}
                                                />
                                            )
                                        })}</>
                                </>
                                : ""}
                        </tbody>
                    </table>
            }</>:<></>}
            <FlexBox>
                {!!totalCount && <Pagination pageSize={PAGE_SIZE} pageInfo={pageInfo} updatePage={updatePage} total={totalCount} queryParams={queryParams} />}
            </FlexBox>
        </Loader>
    );
}

const success = "complete";
const fail = "failed";
const crashed = "crashed";
// there is no cancelled state
const cancelled = "cancelled";
const running = "pending";

export function ActivityRow(props) {
    let { state, name, wf, startedDate, finishedDate, startedTime, finishedTime, id, namespace, invoker } = props;
    const navigate = useNavigate()

    let label;
    if (state === success) {
        label = <SuccessState />
    } else if (state === cancelled) {
        label = <CancelledState />
    } else if (state === fail || state === crashed) {
        label = <FailState />
    } else if (state === running) {
        label = <RunningState />
    }

    let wfStr = name.split(':')[0]
    let revStr = name.split(':')[1]

    let pathwf = wfStr.split("/")
    let wfname = pathwf[pathwf.length - 1]
    pathwf.pop()

    return (

        <tr onClick={() => {
            navigate(`/n/${namespace}/instances/${id}`)
        }} className="instance-row" style={{ cursor: "pointer" }}>
            <td className="label-cell">
                {label}
            </td>
            {!wf ?
                <Tippy content={`/${wfStr}`} trigger={'mouseenter focus'} zIndex={10}>
                    <td className="center-align" style={{ fontSize: "12px", lineHeight: "20px", display: "flex", justifyContent: "center", marginTop: "12px", whiteSpace: "nowrap" }}>
                        {pathwf.length > 0 ?
                            <div style={{ marginLeft: "10px", textOverflow: "ellipsis", overflow: "hidden" }}>
                                /{pathwf.join("/")}
                            </div> :
                            <></>
                        }
                        <div>
                            /{wfname}
                        </div>

                    </td>
                </Tippy> : ""}
            <td className="center-align">
                <span className="hide-on-860">{startedDate}, </span>
                {startedTime}
            </td>
        </tr>
    )
}

function StateLabel(props) {

    let { className, label } = props;
    className += " label-cell"

    return (
        <div>
            <FlexBox className={className} style={{ alignItems: "center", padding: "0px", width: "fit-content" }} >
                <BsDot style={{ height: "32px", width: "32px" }} />
                <div className="hide-on-med" style={{ marginLeft: "-8px", marginRight: "16px" }}>{label}</div>
            </FlexBox>
        </div>
    )
}

export function SuccessState() {
    return (
        <StateLabel className={"success-label"} label={"Successful"} />
    )
}

export function FailState() {
    return (
        <StateLabel className={"fail-label"} label={"Failed"} />
    )
}

export function CancelledState() {
    return (
        <StateLabel className={"cancel-label"} label={"Cancelled"} />
    )
}

export function RunningState() {
    return (
        <StateLabel className={"running-label"} label={"Running"} />
    )
}

