import React, { useEffect, useState } from 'react'
import './style.css'
import { Config, copyTextToClipboard, GenerateRandomKey } from '../../util';
import Button from '../../components/button';
import { useParams } from 'react-router';
import ContentPanel, { ContentPanelBody, ContentPanelHeaderButton, ContentPanelHeaderButtonIcon, ContentPanelTitle, ContentPanelTitleIcon } from '../../components/content-panel';
import FlexBox from '../../components/flexbox';
import {useInstance, useInstanceLogs, useWorkflow} from 'direktiv-react-hooks';
import { CancelledState, FailState, InstancesTable, RunningState, SuccessState } from '../instances';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { VscCopy, VscEye, VscEyeClosed, VscSourceControl, VscScreenFull, VscTerminal } from 'react-icons/vsc';

import * as dayjs from "dayjs"
import YAML from 'js-yaml'

import DirektivEditor from '../../components/editor';
import WorkflowDiagram from '../../components/diagram';

import Modal, { ButtonDefinition } from '../../components/modal';
import Alert from '../../components/alert';
import Loader from '../../components/loader';


export function MLogs(props){ 
    const cache = new CellMeasurerCache({
        fixedWidth: true,
        fixedHeight: false
    })

    let {namespace, instanceID, follow, setClipData, clipData} = props;
    const [logLength, setLogLength] = useState(0)
    let {data, err} = useInstanceLogs(Config.url, true, namespace, instanceID, localStorage.getItem("apikey"))
    useEffect(()=>{
        if (!setClipData) {
            // Skip ClipData if unset
            return 
        }

        console.log("logDataChange = ", data)

        if(data !== null) {
            if(clipData === null || logLength === 0) {

                let cd = ""
                for(let i=0; i < data.length; i++) {
                    cd += `[${dayjs.utc(data[i].node.t).local().format("HH:mm:ss.SSS")}] ${data[i].node.msg}\n`
                }
                setClipData(cd)
                setLogLength(data.length)
            } else if (data.length !== logLength) {
                let cd = clipData
                for(let i=logLength-1; i < data.length; i++) {
                    cd += `[${dayjs.utc(data[i].node.t).local().format("HH:mm:ss.SSS")}] ${data[i].node.msg}\n`

                }
                setClipData(cd)
                setLogLength(data.length)
            }
        }
    },[data, clipData, setClipData, logLength])


    if (!data) {
        return <></>
    }

    if (err) {
        return <></> // TODO 
    }

    function rowRenderer({index, parent, key, style}) {
        if(!data[index]){
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
          <div style={{...style, minWidth:"800px", width:"800px"}}>
            <div style={{display:"inline-block",minWidth:"112px", color:"#b5b5b5"}}>
                <div className="log-timestamp">
                    <div>[</div>
                        <div style={{display: "flex", flex: "auto", justifyContent: "center"}}>{dayjs.utc(data[index].node.t).local().format("HH:mm:ss.SSS")}</div>
                    <div>]</div>
                </div>
            </div> 
            <span style={{marginLeft:"5px", whiteSpace:"pre-wrap"}}>
                {data[index].node.msg}
            </span>
            <div style={{height: `fit-content`}}></div>
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