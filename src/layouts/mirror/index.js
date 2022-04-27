import React, { useEffect, useState, useCallback } from 'react';
import './style.css';
import './rainbow.css';

import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelHeaderButtonIcon, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import { VscAdd, VscFolderOpened } from 'react-icons/vsc';
import { Config, GenerateRandomKey } from '../../util';
import { useMirror, useMirrorLogs } from 'direktiv-react-hooks';
import { useNavigate, useParams } from 'react-router';
import Button from '../../components/button';
import Loader from '../../components/loader';
import Pagination from '../../components/pagination';

import * as dayjs from "dayjs"

// import './style.css';
import { BsDot } from 'react-icons/bs';

const PAGE_SIZE = 10



function MirrorPage(props) {
    const { namespace } = props
    const params = useParams()
    const [activity, setActivity] = useState(null)

    let path = `/`
    if (params["*"] !== undefined) {
        path = `/${params["*"]}`
    }

    console.log("!!! path = ", path)
    console.log("!!! namespace = ", namespace)
    const { info, activities, err, getInfo, getActivityLogs, setLock, updateSettings, cancelActivity, sync } = useMirror(Config.url, true, "mirror", path, localStorage.getItem("apikey"))

    console.log("info = ", info)
    console.log("activities = ", activities)
    // console.log("err = ", getInfo())


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
                    <ContentPanelBody>
                        <ActivityTable activities={activities} setActivity={setActivity}/>
                    </ContentPanelBody>
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
                    <ActivityLogs activity={activity} />
                </ContentPanelBody>
            </ContentPanel>

        </FlexBox>
    );
}

export default MirrorPage;

export function ActivityTable(props) {
    const { activities, err, panelStyle, bodyStyle, placeholder, namespace, totalCount, pageInfo, setActivity } = props
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
                                <th className="center-align">ID</th>
                                <th className="center-align">Type</th>
                                <th className="center-align">Started <span className="hide-on-med">at</span></th>
                                <th className="center-align">ACTIONS</th>
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
                                                    id={obj.node.id}
                                                    type={obj.node.type}
                                                    startedDate={dayjs.utc(obj.node.createdAt).local().format("DD MMM YY")}
                                                    startedTime={dayjs.utc(obj.node.createdAt).local().format("HH:mm a")}
                                                    finishedDate={dayjs.utc(obj.node.updatedAt).local().format("DD MMM YY")}
                                                    finishedTime={dayjs.utc(obj.node.updatedAt).local().format("HH:mm a")}
                                                    setActivity={setActivity}
                                                />
                                            )
                                        })}</>
                                </>
                                : ""}
                        </tbody>
                    </table>
            }</> : <></>}
            <FlexBox>
                {!!totalCount && <Pagination pageSize={PAGE_SIZE} pageInfo={pageInfo} updatePage={updatePage} total={totalCount} queryParams={queryParams} />}
            </FlexBox>
        </Loader>
    );
}

export function ActivityLogs(props) {
    const {activity} = props
    const { data, err } = useMirrorLogs(Config.url, true, "mirror", activity, localStorage.getItem("apikey"))

    const [filterName, setFilterName] = useState("")

    useEffect(() => {
        console.log("useEffect filterName is: ", filterName)
        return () => {
            console.log("useEffect return filterName is: ", filterName)
        } 
    }, [filterName])

    

    return (
        <>
        <div onClick={()=>{
            setFilterName(filterName+"1")
        }}>
            filterName = {`"${filterName}"`}
        </div>
        <div>
            CURRENT Activity: {activity ? activity : "null"}
        </div>
        <div>
            {data ? JSON.stringify(data) : "DATA IS NULL"}
        </div>
        </>
    )
}

const success = "complete";
const fail = "failed";
const crashed = "crashed";
// there is no cancelled state
const cancelled = "cancelled";
const running = "pending";

export function ActivityRow(props) {
    let { state, startedDate, finishedDate, startedTime, finishedTime, id, namespace, type, setActivity } = props;
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

    return (

        <tr className="instance-row" style={{ cursor: "pointer" }}>
            <td className="label-cell">
                {label}
            </td>
            <td className="center-align">
                {id.split("-")[0]}
            </td>
            <td className="center-align">
                {type}
            </td>
            <td className="center-align">
                <span className="hide-on-860">{startedDate}, </span>
                {startedTime}
            </td>
            <td className="center-align">
                <FlexBox className="center gap">
                    <Button>
                        Cancel
                    </Button>
                    <Button className="small" onClick={async () => {
                        try {
                            setActivity(id)
                            console.log("setting activity to id")
                        } catch (e) {
                            console.log("e == ?", e)
                            alert(`got error when getting logs: ${e.message}`)
                        }
                    }}>
                        Logs
                    </Button>
                </FlexBox>
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

