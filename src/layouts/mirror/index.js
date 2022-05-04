import React, { useEffect, useState, useCallback, useRef } from 'react';
import './style.css';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import { VscAdd, VscCopy, VscEye, VscEyeClosed, VscTerminal, VscLock, VscSync, VscUnlock } from 'react-icons/vsc';
import { Config, copyTextToClipboard, GenerateRandomKey } from '../../util';
import { useMirror, useMirrorLogs, useNodes } from 'direktiv-react-hooks';
import { useNavigate, useParams } from 'react-router';
import Button from '../../components/button';
import Loader from '../../components/loader';
import Pagination from '../../components/pagination';

import * as dayjs from "dayjs"

import { TerminalButton } from '../instance';
import Modal, { ButtonDefinition } from '../../components/modal';
import Alert from '../../components/alert';
import Tippy from '@tippyjs/react';
import { SuccessState, CancelledState, FailState, RunningState } from '../instances';

const PAGE_SIZE = 10



function MirrorPage(props) {
    const { namespace, setBreadcrumbChildren } = props
    const params = useParams()
    const navigate = useNavigate()
    const [activity, setActivity] = useState(null)
    const [currentlyLocking, setCurrentlyLocking] = useState(true)
    const [isReadOnly, setIsReadOnly] = useState(true)

    const [errorMsg, setErrorMsg] = useState(null)
    const [load, setLoad] = useState(true)

    let path = `/`
    if (params["*"] !== undefined) {
        path = `/${params["*"]}`
    }

    const { info, activities, err, setLock, updateSettings, cancelActivity, sync } = useMirror(Config.url, true, namespace, path, localStorage.getItem("apikey"), "first=50", "order.field=CREATED", "order.direction=DESC")
    const { data, getNode, err: nodeErr } = useNodes(Config.url, false, namespace, path, localStorage.getItem("apikey"), `first=1`)

    const setLockRef = useRef(setLock)
    const syncRef = useRef(sync)
    const getNodeRef = useRef(getNode)
    const setBreadcrumbChildrenRef = useRef(setBreadcrumbChildren)


    // Error Handling Non existent node and bad mirror
    useEffect(() => {
        if (err) {
            setErrorMsg("Error getting mirror info: " + nodeErr)
        } else if (nodeErr) {
            navigate(`/n/${namespace}/explorer${path}`)
        }
    }, [nodeErr, err, data, navigate, namespace, path])

    // Error Handling bad node
    useEffect(() => {
        if (!getNodeRef.current) {
            return
        }

        if (!load && data) {
            getNodeRef.current().then((nodeData) => {
                if (nodeData.node.expandedType !== "git") {
                    navigate(`/n/${namespace}/explorer${path}`)
                }
            }).catch((e) => {
                navigate(`/n/${namespace}/explorer${path}`)
            })
        }
    }, [data, load, navigate, namespace, path])

    // Keep track of getNodeRef
    useEffect(() => {
        getNodeRef.current = getNode
    }, [getNode])


    useEffect(() => {
        if (nodeErr) {
            setErrorMsg("Error getting node: " + nodeErr)
            return
        }

        const handler = setTimeout(() => {
            if (currentlyLocking) {
                getNode().then((nodeData) => {
                    setIsReadOnly(nodeData.node.readOnly)
                }).catch((e) => {
                    setErrorMsg("Error getting node: " + e.message)
                }).finally(() => {
                    setCurrentlyLocking(false)
                })
            }
        }, 1000)

        return () => {
            clearTimeout(handler);
        };
    }, [currentlyLocking, getNode, nodeErr])

    useEffect(() => {
        if (data && info) {
            setLoad(false)
        }
    }, [data, info, load])

    useEffect(() => {
        if (!setBreadcrumbChildrenRef.current || !syncRef.current) {
            return
        }

        setBreadcrumbChildrenRef.current((
            <FlexBox className="center row gap" style={{ justifyContent: "flex-end", paddingRight: "6px" }}>
                <Modal
                    escapeToCancel
                    activeOverlay
                    title="Sync Mirror"
                    titleIcon={
                        <VscSync />
                    }
                    style={{
                        maxWidth: "68px"
                    }}
                    modalStyle={{
                        width: "300px"
                    }}
                    button={(
                        <Button id="btn-sync-mirror" className="small light shadow" style={{ fontWeight: "bold", width: "fit-content" }}>
                            <FlexBox className="row center gap-sm">
                                <VscSync />
                                Sync
                            </FlexBox>
                        </Button>
                    )}
                    actionButtons={[
                        ButtonDefinition("Soft Sync", async () => {
                            await syncRef.current()
                        }, "small blue", () => { }, true, false),
                        ButtonDefinition("Hard Sync", async () => {
                            await syncRef.current(true)
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
                <Button className={`small light shadow ${currentlyLocking ? "loading disabled" : ""}`} style={{ fontWeight: "bold", width: "fit-content", whiteSpace: "nowrap" }} onClick={async () => {
                    if (isReadOnly) {
                        setCurrentlyLocking(true)

                        try {
                            await setLockRef.current(true)
                        } catch (e) {
                            setCurrentlyLocking(false)
                            setErrorMsg(e.message)
                        }
                    } else {
                        setCurrentlyLocking(true)
                        try {
                            await setLockRef.current(false)
                        } catch (e) {
                            setCurrentlyLocking(false)
                            setErrorMsg(e.message)
                        }
                    }
                }}>
                    <FlexBox className="row center gap-sm">
                        {isReadOnly ?
                            <>

                                <VscUnlock />
                                Make Writable
                            </>
                            :
                            <>
                                <VscLock />
                                Make ReadOnly
                            </>
                        }
                    </FlexBox>
                </Button>
                {isReadOnly ? <MirrorReadOnlyBadge /> : <MirrorWritableBadge />}
            </ FlexBox>
        ))
    }, [currentlyLocking, isReadOnly])

    // Keep Refs up to date
    useEffect(() => {
        setBreadcrumbChildrenRef.current = setBreadcrumbChildren
        setLockRef.current = setLock
        syncRef.current = sync
    }, [setBreadcrumbChildren, setLock, sync])


    // Unmount cleanup breadcrumb children
    useEffect(() => {
        return (() => {
            if (setBreadcrumbChildrenRef.current) {
                setBreadcrumbChildrenRef.current(<></>)
            }
        })
    }, [])

    if (!namespace) {
        return <></>
    }


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
                    {/* <BreadcrumbCorner>
                    </BreadcrumbCorner> */}
                    <FlexBox className="row gap wrap" style={{ flex: 1, maxHeight: "60vh" }}>
                        <ContentPanel id={`panel-activity-list`} style={{ width: "100%", minHeight: "60vh", maxHeight: "60vh", flex: 2 }}>
                            <ContentPanelTitle>
                                <ContentPanelTitleIcon>
                                    <VscAdd />
                                </ContentPanelTitleIcon>
                                <FlexBox className="gap" style={{ alignItems: "center" }}>Activity List</FlexBox>
                            </ContentPanelTitle>
                            <ContentPanelBody style={{ overflow: "auto" }}>
                                <FlexBox style={{ flexShrink: "1", height: "fit-content" }}>
                                    <ActivityTable activities={activities} setActivity={setActivity} cancelActivity={cancelActivity} setErrorMsg={setErrorMsg} />
                                </FlexBox>
                                <FlexBox style={{ flexGrow: "1" }}></FlexBox>
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

    // Mirror Info States
    const [infoURL, setInfoURL] = useState("")
    const [infoRef, setInfoRef] = useState("")
    const [infoCron, setInfoCron] = useState("")
    const [infoPublicKey, setInfoPublicKey] = useState("")
    const [infoPrivateKey, setInfoPrivateKey] = useState("")
    const [infoPassphrase, setInfoPassphrase] = useState("")

    const [infoURLOld, setInfoURLOld] = useState("")
    const [infoRefOld, setInfoRefOld] = useState("")
    const [infoCronOld, setInfoCronOld] = useState("")
    const [infoPublicKeyOld, ] = useState("")
    const [infoPrivateKeyOld, ] = useState("")
    const [infoPassphraseOld, ] = useState("")

    const [infoPendingChanges, setInfoPendingChanges] = useState(false)
    const [infoChangesTracker, setInfoChangesTracker] = useState({
        "url": false,
        "ref": false,
        "cron": false,
        "passphrase": false,
        "publicKey": false,
        "privateKey": false,
    })

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
    }, [infoURLOld, infoRefOld, infoCronOld, infoPublicKeyOld, infoPrivateKeyOld, infoPassphraseOld])

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
                                    width: "300px"
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
                                            "passphrase": infoChangesTracker.passphrase ? infoPassphrase : "-",
                                            "publicKey": infoChangesTracker.publicKey ? infoPublicKey : "-",
                                            "privateKey": infoChangesTracker.privateKey ? infoPrivateKey : "-",
                                           
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
    const { activities, err, placeholder, namespace, totalCount, pageInfo, setActivity, cancelActivity, setErrorMsg } = props
    const [load, setLoad] = useState(true)

    const [queryParams, setQueryParams] = useState([`first=${PAGE_SIZE}`])

    const updatePage = useCallback((newParam) => {
        setQueryParams(newParam)
    }, [])


    useEffect(() => {
        if (activities !== null || err !== null) {
            setLoad(false)
        }
    }, [activities, err])

    return (
        <Loader load={load} timer={3000}>
            {activities ? <>{
                activities !== null && activities.length === 0 ?
                    <div style={{ paddingLeft: "10px", fontSize: "10pt" }}>{`${placeholder ? placeholder : "No activities have been recently executed. Recent activities will appear here."}`}</div>
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
    const { namespace, activityID, follow, setClipData, clipData, setErrorMsg } = props;

    const cache = new CellMeasurerCache({
        fixedWidth: true,
        fixedHeight: false
    })

    const [logLength, setLogLength] = useState(0)
    const { data, err } = useMirrorLogs(Config.url, true, namespace, activityID, localStorage.getItem("apikey"))

    useEffect(() => {
        if (err) {
            setErrorMsg(`Could not get logs: ${err}`)
        }
    }, [err, setErrorMsg])

    useEffect(() => {
        if (!setClipData) {
            // Skip ClipData if unset
            return
        }

        if (data !== null) {
            if (clipData === null || logLength === 0) {
                let cd = ""
                for (let i = 0; i < data.length; i++) {
                    cd += `[${dayjs.utc(data[i].node.t).local().format("HH:mm:ss.SSS")}] ${data[i].node.msg}\n`
                }
                setClipData(cd)
                setLogLength(data.length)
            } else if (data.length !== logLength) {
                let cd = clipData
                for (let i = logLength - 1; i < data.length; i++) {
                    cd += `[${dayjs.utc(data[i].node.t).local().format("HH:mm:ss.SSS")}] ${data[i].node.msg}\n`
                }
                setClipData(cd)
                setLogLength(data.length)
            }
        }
    }, [data, clipData, setClipData, logLength])

    if (!activityID) {
        return <div>No Activity Selected</div>
    }


    if (!data) {
        return <div>Loading...</div>
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
        <div className="activity-logger" style={{ flex: "1 1 auto", lineHeight: "20px" }}>
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

    const [clipData, setClipData] = useState(null)
    const [follow, setFollow] = useState(true)
    const [width,] = useState(window.innerWidth);




    return (
        <>
            <FlexBox className="col">
                <FlexBox style={{ backgroundColor: "#002240", color: "white", borderRadius: "8px 8px 0px 0px", overflow: "hidden", padding: "8px" }}>
                    <Logs clipData={clipData} setClipData={setClipData} follow={true} activityID={activity} namespace={namespace} setErrorMsg={setErrorMsg} />
                </FlexBox>
                <div style={{ height: "40px", backgroundColor: "#223848", color: "white", maxHeight: "40px", minHeight: "40px", padding: "0px 10px 0px 10px", boxShadow: "0px 0px 3px 0px #fcfdfe", alignItems: 'center', borderRadius: " 0px 0px 8px 8px", overflow: "hidden" }}>
                    <FlexBox className="gap" style={{ width: "100%", flexDirection: "row-reverse", height: "100%", alignItems: "center" }}>
                        <TerminalButton className={`${activity ? "" : "terminal-disabled"}`} onClick={() => {
                            copyTextToClipboard(clipData)
                        }}>
                            <VscCopy /> Copy {width > 999 ? <span>to Clipboard</span> : ""}
                        </TerminalButton>
                        {follow ?
                            <TerminalButton className={`${activity ? "" : "terminal-disabled"}`} onClick={(e) => setFollow(!follow)}>
                                <VscEyeClosed /> Stop {width > 999 ? <span>watching</span> : ""}
                            </TerminalButton>
                            :
                            <TerminalButton className={`${activity ? "" : "terminal-disabled"}`} onClick={(e) => setFollow(!follow)} >
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
    let { state, startedDate, startedTime, id, type, setActivity, cancelActivity, setErrorMsg } = props;

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

        <tr className="activity-row" style={{ minHeight: "48px", maxHeight: "48px" }}>
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

export function MirrorReadOnlyBadge(props) {
    return (
        <Tippy content={`This mirrors contents are currently read-only. This can be unlocked in mirror setttings`} trigger={'mouseenter focus'} zIndex={10}>
            <div>
                <Button className={`small light disabled`} style={{ fontWeight: "bold", width: "fit-content", whiteSpace: "nowrap" }}>
                    <FlexBox className="row center gap-sm">
                        <VscLock />ReadOnly
                    </FlexBox>
                </Button>
            </div>
        </Tippy>
    )
}

export function MirrorWritableBadge(props) {
    return (
        <Tippy content={`This mirrors contents are currently read-only. This can be unlocked in mirror setttings`} trigger={'mouseenter focus'} zIndex={10}>
            <div>
                <Button className={`small light disabled`} style={{ fontWeight: "bold", width: "fit-content", whiteSpace: "nowrap" }}>
                    <FlexBox className="row center gap-sm">
                        <VscUnlock />Writable
                    </FlexBox>
                </Button>
            </div>
        </Tippy>
    )
}