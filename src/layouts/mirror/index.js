import React, { useEffect, useState, useCallback, useRef } from 'react';
import './style.css';
import './rainbow.css';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelHeaderButtonIcon, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import { VscAdd, VscFolderOpened, VscCopy, VscEye, VscEyeClosed, VscSourceControl, VscScreenFull, VscTerminal, VscLock, VscSync, VscUnlock } from 'react-icons/vsc';
import { Config, copyTextToClipboard, GenerateRandomKey } from '../../util';
import { useMirror, useMirrorLogs, useNodes } from 'direktiv-react-hooks';
import { useNavigate, useParams } from 'react-router';
import Button from '../../components/button';
import Loader from '../../components/loader';
import Pagination from '../../components/pagination';

import * as dayjs from "dayjs"

// import './style.css';
import { BsDot } from 'react-icons/bs';
import { MLogs } from './logs';
import { TerminalButton } from '../instance';
import Modal, { ButtonDefinition } from '../../components/modal';
import Alert from '../../components/alert';

const PAGE_SIZE = 10



function MirrorPage(props) {
    const { namespace } = props
    const params = useParams()
    const [activity, setActivity] = useState(null)
    const [currentlyLocking, setCurrentlyLocking] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [load, setLoad] = useState(true)

    let path = `/`
    if (params["*"] !== undefined) {
        path = `/${params["*"]}`
    }

    console.log("!!! path = ", path)
    console.log("!!! namespace = ", namespace)
    const { info, activities, err, getInfo, getActivityLogs, setLock, updateSettings, cancelActivity, sync } = useMirror(Config.url, true, namespace, path, localStorage.getItem("apikey"), "last=50", "order.field=CREATED", "order.direction=DESC")
    const { data } = useNodes(Config.url, true, namespace, path, localStorage.getItem("apikey"), `first=1`)

    useEffect(() => {
        if (data) {
            setCurrentlyLocking(false)
        }
    }, [data])

    useEffect(() => {
        if (data && info) {
            setLoad(false)
        }
    }, [data, info])

    console.log("info = ", info)
    console.log("data!!! = ", data)
    console.log("activities = ", activities)
    // console.log("err = ", getInfo())


    if (!namespace) {
        return <></>
    }



    // <FlexBox className="row gap center" style={{ height: "72px", width: "200px", position: "absolute", right: "0px", top: "0px", justifyContent: "flex-end", paddingRight: "6px" }}>
    //             <Button className="small light shadow" style={{ fontWeight: "bold" }}>
    //                 <FlexBox className="row center gap-sm">
    //                     <VscSync />
    //                     Sync
    //                 </FlexBox>
    //             </Button>
    //             <Button className="small light shadow" style={{ fontWeight: "bold" }}>
    //                 <FlexBox className="row center gap-sm">
    //                     <VscLock />
    //                     <VscUnlock />
    //                     Locked
    //                 </FlexBox>
    //             </Button>
    //         </FlexBox>


    return (
        <>
            <Loader load={load} timer={1000}>
                {
                    errorMsg ?
                        <FlexBox style={{ maxHeight: "50px", paddingRight: "6px", paddingBottom: "8px" }}>
                            <Alert setErrorMsg={setErrorMsg} className="critical" style={{ height: "100%" }}>{`Error: ${errorMsg}`}</Alert>
                        </FlexBox>
                        : <></>
                }
                <FlexBox className="col gap" style={{ paddingRight: "8px" }}>
                    <FlexBox className="row center" style={{ height: "72px", width: "200px", position: "absolute", right: "0px", top: "0px", justifyContent: "flex-end", paddingRight: "6px" }}>
                        <Modal
                            escapeToCancel
                            activeOverlay
                            title="Sync Mirror"
                            titleIcon={
                                <VscSync />
                            }
                            style={{
                                maxWidth: "260px"
                            }}
                            modalStyle={{
                                overflow: "hidden",
                                padding: "0px"
                            }}
                            button={(
                                <Button className="small light shadow" style={{ fontWeight: "bold" }}>
                                    <FlexBox className="row center gap-sm">
                                        <VscSync />
                                        Sync
                                    </FlexBox>
                                </Button>
                            )}
                            actionButtons={[
                                ButtonDefinition("Soft Sync", async () => {
                                    await sync()
                                }, "small blue", () => { }, true, false),
                                ButtonDefinition("Hard Sync", async () => {
                                    await sync(true)
                                }, "small blue", () => { }, true, false),
                                ButtonDefinition("Cancel", () => { }, "small light", () => { }, true, false)
                            ]}
                        >
                            <FlexBox className="col gap" style={{ paddingTop: "8px" }}>
                                <FlexBox className="col center info-update-label">
                                    Would you like to do a normal sync or force a hard sync?
                                </FlexBox>
                            </FlexBox>
                        </Modal>
                        <Button className={`small light shadow ${currentlyLocking ? "loading disabled" : ""}`} style={{ fontWeight: "bold" }} onClick={async () => {
                            if (data?.node?.readOnly) {
                                setCurrentlyLocking(true)
                                try {
                                    await setLock(true)
                                } catch (e) {
                                    setCurrentlyLocking(false)
                                    setErrorMsg(e.message)
                                }
                            } else {
                                setCurrentlyLocking(true)
                                try {
                                    await setLock(false)
                                } catch (e) {
                                    setCurrentlyLocking(false)
                                    setErrorMsg(e.message)
                                }
                            }
                        }}>
                            <FlexBox className="row center gap-sm">
                                {data?.node?.readOnly ?
                                    <>
                                        <VscLock />
                                        Locked
                                    </>
                                    :
                                    <>
                                        <VscUnlock />
                                        Unlocked
                                    </>

                                }
                            </FlexBox>
                        </Button>
                    </FlexBox>
                    <FlexBox className="row gap wrap" style={{ flex: 1, maxHeight: "60vh" }}>
                        <ContentPanel id={`panel-activity-list`} style={{ width: "100%", minHeight: "60vh", maxHeight: "60vh", flex: 2 }}>
                            <ContentPanelTitle>
                                <ContentPanelTitleIcon>
                                    <VscAdd />
                                </ContentPanelTitleIcon>
                                <FlexBox className="gap" style={{ alignItems: "center" }}>Activity List</FlexBox>
                            </ContentPanelTitle>
                            <ContentPanelBody style={{ overflow: "auto" }}>
                                <FlexBox >
                                    <ActivityTable activities={activities} setActivity={setActivity} cancelActivity={cancelActivity} setErrorMsg={setErrorMsg} />
                                </FlexBox>
                            </ContentPanelBody>
                        </ContentPanel>
                        <MirrorInfoPanel info={info} updateSettings={updateSettings} namespace={namespace} style={{ width: "100%", height: "100%", flex: 1 }} />
                    </FlexBox>
                    <ContentPanel style={{ width: "100%", minHeight: "20vh", flex: 1 }}>
                        <ContentPanelTitle>
                            <ContentPanelTitleIcon>
                                <VscAdd />
                            </ContentPanelTitleIcon>
                            <FlexBox className="gap" style={{ alignItems: "center" }}>Activity Logs</FlexBox>
                        </ContentPanelTitle>
                        <ContentPanelBody>
                            <ActivityLogs activity={activity} namespace={namespace} setErrorMsg={setErrorMsg} />
                        </ContentPanelBody>
                    </ContentPanel>

                </FlexBox>
            </Loader>
        </>
    );
}

export default MirrorPage;

export function MirrorInfoPanel(props) {
    const { info, style, updateSettings } = props
    const [load, setLoad] = useState(true)

    // Mirror Info States
    const [infoURL, setInfoURL] = useState(null)
    const [infoRef, setInfoRef] = useState(null)
    const [infoCron, setInfoCron] = useState(null)
    const [infoPublicKey, setInfoPublicKey] = useState("")
    const [infoPrivateKey, setInfoPrivateKey] = useState("")
    const [infoPassphrase, setInfoPassphrase] = useState("")

    const [infoURLOld, setInfoURLOld] = useState(null)
    const [infoRefOld, setInfoRefOld] = useState(null)
    const [infoCronOld, setInfoCronOld] = useState(null)
    const [infoPublicKeyOld, setInfoPublicKeyOld] = useState("")
    const [infoPrivateKeyOld, setInfoPrivateKeyOld] = useState("")
    const [infoPassphraseOld, setInfoPassphraseOld] = useState("")

    const [infoPendingChanges, setInfoPendingChanges] = useState(false)
    const [infoChangesTracker, setInfoChangesTracker] = useState({
        "url": false,
        "ref": false,
        "cron": false,
        "passphrase": false,
        "publicKey": false,
        "privateKey": false,
    })

    // Mirror Info Refs
    const infoURLRef = useRef("")
    const infoRefRef = useRef()
    const infoCronRef = useRef()
    const infoPublicKeyRef = useRef()
    const infoPrivateKeyRef = useRef()
    const infoPassphraseRef = useRef()
    const infoChangesTrackerRef = useRef(infoChangesTracker)

    const resetStates = useCallback(() => {
        setInfoChangesTracker({
            "url": false,
            "ref": false,
            "cron": false,
            "passphrase": false,
            "publicKey": false,
            "privateKey": false,
        })

        setInfoURL(infoURLOld)
        setInfoRef(infoRefOld)
        setInfoCron(infoCronOld)
        setInfoPublicKey(infoPublicKeyOld)
        setInfoPrivateKey(infoPrivateKeyOld)
        setInfoPassphrase(infoPassphraseOld)
    }, infoURLOld, infoRefOld, infoCronOld, infoPublicKeyOld, infoPrivateKeyOld, infoPassphraseOld)

    useEffect(() => {
        infoChangesTrackerRef.current = infoChangesTracker
    }, [infoChangesTracker])



    useEffect(() => {
        if (!info) {
            return
        }

        if (info?.url !== null) {
            setInfoURLOld(info.url)
            if (!infoChangesTrackerRef.url) {
                setInfoURL(info.url)
            }
        }

        if (info?.ref !== null) {
            setInfoRefOld(info.ref)
            if (!infoChangesTrackerRef.ref) {
                setInfoRef(info.ref)
            }
        }

        if (info?.cron !== null) {
            setInfoCronOld(info.cron)
            if (!infoChangesTrackerRef.cron) {
                setInfoCron(info.cron)
            }
        }

    }, [info])

    useEffect(() => {
        console.log("should pend =", infoChangesTracker.url || infoChangesTracker.ref || infoChangesTracker.cron || infoChangesTracker.passphrase || infoChangesTracker.publicKey || infoChangesTracker.privateKey)
        setInfoPendingChanges(infoChangesTracker.url || infoChangesTracker.ref || infoChangesTracker.cron || infoChangesTracker.passphrase || infoChangesTracker.publicKey || infoChangesTracker.privateKey)
    }, [infoChangesTracker])

    return (
        <ContentPanel id={`panel-mirror-info`} style={{ ...style }}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscAdd />
                </ContentPanelTitleIcon>
                <FlexBox className="gap" style={{ alignItems: "center" }}>Mirror Info
                    <FlexBox style={{ flex: "auto", justifyContent: "right", paddingRight: "6px", alignItems: "unset" }}>
                        <ContentPanelHeaderButton className={`${infoPendingChanges ? "" : "disabled"}`} style={infoPendingChanges ? {} : { color: "grey" }}>
                            <Modal
                                escapeToCancel
                                activeOverlay
                                title="Update Mirror Settings"
                                titleIcon={
                                    <VscTerminal />
                                }
                                style={{
                                    maxWidth: "260px"
                                }}
                                modalStyle={{
                                    overflow: "hidden",
                                    padding: "0px"
                                }}
                                button={(
                                    <div>
                                        Update Settings
                                    </div>
                                )}
                                actionButtons={[
                                    ButtonDefinition("Update Settings", async () => {
                                        await updateSettings({
                                            "url": infoChangesTracker.url ? infoURL : "-",
                                            "ref": infoChangesTracker.ref ? infoRef : "-",
                                            "cron": infoChangesTracker.cron ? infoCron : "-",
                                            "publicKey": infoChangesTracker.passphrase ? infoPassphrase : "-",
                                            "privateKey": infoChangesTracker.publicKey ? infoPublicKey : "-",
                                            "passphrase": infoChangesTracker.privateKey ? infoPrivateKey : "-",
                                        })

                                        resetStates()
                                    }, "small blue", () => { }, true, false),
                                    ButtonDefinition("Cancel", () => { }, "small light", () => { }, true, false)
                                ]}
                            >
                                <FlexBox className="col gap" style={{ height: "fit-content" }}>
                                    <FlexBox className="col center info-update-label">
                                        The following changes will been made
                                    </FlexBox>
                                    {infoChangesTracker.url ?
                                        <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                                            <span className={`info-input-title readonly`}>URL</span>
                                            <input className={`info-input-value readonly`} value={infoURL} />
                                        </FlexBox> : <></>}
                                    {infoChangesTracker.ref ?
                                        <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                                            <span className={`info-input-title readonly`}>Ref</span>
                                            <input className={`info-input-value readonly`} value={infoRef} />
                                        </FlexBox> : <></>}
                                    {infoChangesTracker.cron ?
                                        <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                                            <span className={`info-input-title readonly`}>Cron</span>
                                            <input className={`info-input-value readonly`} readonly={true} value={infoCron} />
                                        </FlexBox> : <></>}
                                    {infoChangesTracker.passphrase ?
                                        <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                                            <span className={`info-input-title readonly`}>Passphrase</span>
                                            <input className={`info-input-value readonly`} readonly={true} type="password" value={infoPassphrase} />
                                        </FlexBox> : <></>}
                                    {infoChangesTracker.publicKey ?
                                        <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                                            <span className={`info-input-title readonly`}>Public Key</span>
                                            <textarea className={`info-textarea-value readonly`} readonly={true} style={{ width: "100%", resize: "none" }} value={infoPublicKey} />
                                        </FlexBox> : <></>}
                                    {infoChangesTracker.privateKey ?
                                        <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                                            <span className={`info-input-title readonly`} >Private Key</span>
                                            <textarea className={`info-textarea-value readonly`} readonly={true} style={{ width: "100%", resize: "none" }} value={infoPrivateKey} />
                                        </FlexBox> : <></>}
                                </FlexBox>
                            </Modal>
                        </ContentPanelHeaderButton>
                    </FlexBox>
                </FlexBox>
            </ContentPanelTitle>
            <ContentPanelBody style={{ overflow: "auto" }}>
                <FlexBox className="col gap" style={{ height: "fit-content" }}>
                    <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                        <FlexBox className="row" style={{ justifyContent: "space-between" }}>
                            <span className={`info-input-title ${infoChangesTracker.url ? "edited" : ""}`}>URL</span>
                            <span className={`info-input-undo ${infoChangesTracker.url ? "" : "hide"}`} onClick={(e) => {
                                setInfoURL(infoURLOld)
                                setInfoChangesTracker((old) => {
                                    old.url = false
                                    return { ...old }
                                })
                            }}>Undo Changes</span>
                        </FlexBox>
                        <input value={infoURL} onChange={(e) => {
                            setInfoURL(e.target.value)
                            setInfoChangesTracker((old) => {
                                old.url = true
                                return { ...old }
                            })
                        }} placeholder="Enter URL" />
                    </FlexBox>
                    <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                        <FlexBox className="row" style={{ justifyContent: "space-between" }}>
                            <span className={`info-input-title ${infoChangesTracker.ref ? "edited" : ""}`}>Ref</span>
                            <span className={`info-input-undo ${infoChangesTracker.ref ? "" : "hide"}`} onClick={(e) => {
                                setInfoRef(infoRefOld)
                                setInfoChangesTracker((old) => {
                                    old.ref = false
                                    return { ...old }
                                })
                            }}>Undo Changes</span>
                        </FlexBox>
                        <input value={infoRef} onChange={(e) => {
                            setInfoRef(e.target.value)
                            setInfoChangesTracker((old) => {
                                old.ref = true
                                return { ...old }
                            })
                        }} placeholder="Enter Ref" />
                    </FlexBox>
                    <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                        <FlexBox className="row" style={{ justifyContent: "space-between" }}>
                            <span className={`info-input-title ${infoChangesTracker.cron ? "edited" : ""}`}>Cron</span>
                            <span className={`info-input-undo ${infoChangesTracker.cron ? "" : "hide"}`} onClick={(e) => {
                                setInfoCron(infoCronOld)
                                setInfoChangesTracker((old) => {
                                    old.cron = false
                                    return { ...old }
                                })
                            }}>Undo Changes</span>
                        </FlexBox>
                        <input value={infoCron} onChange={(e) => {
                            setInfoCron(e.target.value)
                            setInfoChangesTracker((old) => {
                                old.cron = true
                                return { ...old }
                            })
                        }} placeholder="Enter cron" />
                    </FlexBox>
                    <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                        <FlexBox className="row" style={{ justifyContent: "space-between" }}>
                            <span className={`info-input-title ${infoChangesTracker.passphrase ? "edited" : ""}`}>Passphrase</span>
                            <span className={`info-input-undo ${infoChangesTracker.passphrase ? "" : "hide"}`} onClick={(e) => {
                                setInfoPassphrase(infoPassphraseOld)
                                setInfoChangesTracker((old) => {
                                    old.passphrase = false
                                    return { ...old }
                                })
                            }}>Undo Changes</span>
                        </FlexBox>
                        <input type="password" value={infoPassphrase} onChange={(e) => {
                            setInfoPassphrase(e.target.value)
                            setInfoChangesTracker((old) => {
                                old.passphrase = true
                                return { ...old }
                            })
                        }} placeholder="Enter Passphrase" />
                    </FlexBox>
                    <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                        <FlexBox className="row" style={{ justifyContent: "space-between" }}>
                            <span className={`info-input-title ${infoChangesTracker.publicKey ? "edited" : ""}`}>Public Key</span>
                            <span className={`info-input-undo ${infoChangesTracker.publicKey ? "" : "hide"}`} onClick={(e) => {
                                setInfoPublicKey(infoPublicKeyOld)
                                setInfoChangesTracker((old) => {
                                    old.publicKey = false
                                    return { ...old }
                                })
                            }}>Undo Changes</span>
                        </FlexBox>
                        <textarea style={{ width: "100%", resize: "none" }} value={infoPublicKey} onChange={(e) => {
                            setInfoPublicKey(e.target.value)
                            setInfoChangesTracker((old) => {
                                old.publicKey = true
                                return { ...old }
                            })
                        }} placeholder="Enter Public Key" />
                    </FlexBox>
                    <FlexBox className="col gap" style={{ paddingRight: "10px" }}>
                        <FlexBox className="row" style={{ justifyContent: "space-between" }}>
                            <span className={`info-input-title ${infoChangesTracker.privateKey ? "edited" : ""}`} >Private Key</span>
                            <span className={`info-input-undo ${infoChangesTracker.privateKey ? "" : "hide"}`} onClick={(e) => {
                                setInfoPrivateKey(infoPrivateKeyOld)
                                setInfoChangesTracker((old) => {
                                    old.privateKey = false
                                    return { ...old }
                                })
                            }}>Undo Changes</span>
                        </FlexBox>
                        <textarea type="password" style={{ width: "100%", resize: "none" }} value={infoPrivateKey} onChange={(e) => {
                            setInfoPrivateKey(e.target.value)
                            setInfoChangesTracker((old) => {
                                old.privateKey = true
                                return { ...old }
                            })
                        }} placeholder="Enter Private Key" />
                    </FlexBox>
                </FlexBox>

            </ContentPanelBody>
        </ContentPanel>

    );
}


export function ActivityTable(props) {
    const { activities, err, panelStyle, bodyStyle, placeholder, namespace, totalCount, pageInfo, setActivity, cancelActivity, setErrorMsg } = props
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
                                <th className="center-align">Type</th>
                                <th className="center-align">Started <span className="hide-on-med">at</span></th>
                                <th className="center-align" style={{ maxWidth: "120px", minWidth: "120px", width: "120px" }}></th>
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
                                                    cancelActivity={cancelActivity}
                                                    setErrorMsg={setErrorMsg}
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

function Logs(props) {
    const cache = new CellMeasurerCache({
        fixedWidth: true,
        fixedHeight: false
    })

    let { namespace, activityID, follow, setClipData, clipData, setErrorMsg } = props;
    const [logLength, setLogLength] = useState(0)
    const { data, err } = useMirrorLogs(Config.url, true, namespace, activityID, localStorage.getItem("apikey"))

    useEffect(() => {
        if (err) {
            setErrorMsg(`Could not get logs: ${err}`)
        }
    }, [err])

    useEffect(() => {
        if (!setClipData) {
            // Skip ClipData if unset
            return
        }

        console.log("logDataChangex2 = ", data)

        if (data !== null) {
            if (clipData === null || logLength === 0) {

                let cd = ""
                for (let i = 0; i < data.length; i++) {
                    cd += `[${dayjs.utc(data[i].node.t).local().format("HH:mm:ss.SSS")}] ${data[i].node.msg}\n`
                    console.log("logDataChangex2 adding cd = ", cd)
                }
                setClipData(cd)
                setLogLength(data.length)
            } else if (data.length !== logLength) {
                let cd = clipData
                for (let i = logLength - 1; i < data.length; i++) {
                    cd += `[${dayjs.utc(data[i].node.t).local().format("HH:mm:ss.SSS")}] ${data[i].node.msg}\n`

                    console.log("logDataChangex2 adding cd2 = ", cd)

                }
                setClipData(cd)
                setLogLength(data.length)
            }
        }
    }, [data, clipData, setClipData, logLength])


    if (!data) {
        return <></>
    }

    if (err) {
        return <></> // TODO 
    }

    function rowRenderer({ index, parent, key, style }) {
        if (!data[index]) {
            return ""
        }

        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                <div style={{ ...style, minWidth: "800px", width: "800px" }}>
                    <div style={{ display: "inline-block", minWidth: "112px", color: "#b5b5b5" }}>
                        <div className="log-timestamp">
                            <div>[</div>
                            <div style={{ display: "flex", flex: "auto", justifyContent: "center" }}>{dayjs.utc(data[index].node.t).local().format("HH:mm:ss.SSS")}</div>
                            <div>]</div>
                        </div>
                    </div>
                    <span style={{ marginLeft: "5px", whiteSpace: "pre-wrap" }}>
                        {data[index].node.msg}
                    </span>
                    <div style={{ height: `fit-content` }}></div>
                </div>
            </CellMeasurer>
        );
    }


    return (
        <div style={{ flex: "1 1 auto", lineHeight: "20px" }}>
            <AutoSizer>
                {({ height, width }) => (
                    <div style={{ height: "100%", minHeight: "100%" }}>
                        <List
                            width={width}
                            height={height}
                            rowRenderer={rowRenderer}
                            deferredMeasurementCache={cache}
                            scrollToIndex={follow ? data.length - 1 : 0}
                            rowCount={data.length}
                            rowHeight={cache.rowHeight}
                            scrollToAlignment={"start"}
                        />
                    </div>
                )}
            </AutoSizer>
        </div>
    )
}

export function ActivityLogs(props) {
    const { activity, namespace, setErrorMsg } = props
    const data = ["dont", "care"]

    const [filterName, setFilterName] = useState("")
    const [clipData, setClipData] = useState(null)
    const [follow, setFollow] = useState(true)
    const [width,] = useState(window.innerWidth);

    useEffect(() => {
        console.log("useEffect filterName is: ", filterName)
        return () => {
            console.log("useEffect return filterName is: ", filterName)
        }
    }, [filterName])

    useEffect(() => {
        console.log("logDataChange = ", data)
    }, [data])





    return (
        <>
            <FlexBox className="col">
                <FlexBox style={{ backgroundColor: "#002240", color: "white", borderRadius: "8px 8px 0px 0px", overflow: "hidden", padding: "8px" }}>
                    <Logs clipData={clipData} setClipData={setClipData} follow={true} activityID={activity} namespace={namespace} setErrorMsg={setErrorMsg} />
                </FlexBox>
                <div style={{ height: "40px", backgroundColor: "#223848", color: "white", maxHeight: "40px", minHeight: "40px", padding: "0px 10px 0px 10px", boxShadow: "0px 0px 3px 0px #fcfdfe", alignItems: 'center', borderRadius: " 0px 0px 8px 8px", overflow: "hidden" }}>
                    <FlexBox className="gap" style={{ width: "100%", flexDirection: "row-reverse", height: "100%", alignItems: "center" }}>
                        <TerminalButton onClick={() => {
                            copyTextToClipboard(clipData)
                        }}>
                            <VscCopy /> Copy {width > 999 ? <span>to Clipboard</span> : ""}
                        </TerminalButton>
                        {follow ?
                            <TerminalButton onClick={(e) => setFollow(!follow)} className={"btn-terminal"}>
                                <VscEyeClosed /> Stop {width > 999 ? <span>watching</span> : ""}
                            </TerminalButton>
                            :
                            <TerminalButton onClick={(e) => setFollow(!follow)} className={"btn-terminal"} >
                                <VscEye /> <div>Follow {width > 999 ? <span>logs</span> : ""}</div>
                            </TerminalButton>
                        }
                    </FlexBox>
                </div>
            </FlexBox>
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
    let { state, startedDate, finishedDate, startedTime, finishedTime, id, namespace, type, setActivity, cancelActivity, setErrorMsg } = props;
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
                {type}
            </td>
            <td className="center-align">
                <span className="hide-on-860">{startedDate}, </span>
                {startedTime}
            </td>
            <td className="center-align">
                <FlexBox className="center gap">
                    <Button className={`small light`} style={state !== "pending" ? { visibility: "hidden" } : {}} onClick={async () => {
                        try {
                            await cancelActivity(id)
                        } catch (e) {
                            setErrorMsg(`Failed to cancel: ${e.message}`)
                        }

                    }}>
                        Cancel
                    </Button>
                    <Button className="small blue" onClick={async () => {
                        setActivity(id)
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

