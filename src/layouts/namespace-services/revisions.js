import Tippy from '@tippyjs/react';
import { useNamespaceService } from "direktiv-react-hooks";
import { useEffect, useState } from "react";
import { VscLayers } from 'react-icons/vsc';
import { useNavigate, useParams } from "react-router";
import 'tippy.js/dist/tippy.css';
import { Service } from ".";
import AddValueButton from "../../components/add-button";
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from "../../components/content-panel";
import FlexBox from "../../components/flexbox";
import Modal, { ButtonDefinition, KeyDownDefinition } from "../../components/modal";
import { Config } from "../../util";

export default function NamespaceRevisionsPanel(props) {
    const {namespace} = props
    const {service} = useParams()

    if(!namespace) {
        return <></>
    }

    return (
        <NamespaceRevisions namespace={namespace} service={service} />
    )
}

export function RevisionCreatePanel(props){
    const {image, setImage, scale, setScale, size, setSize, cmd, setCmd, maxScale} = props

    return(
        <FlexBox className="col gap" style={{fontSize: "12px"}}>
            <FlexBox className="col gap">
                    <FlexBox className="col" style={{paddingRight:"10px"}}>
                        Image
                        <input value={image} onChange={(e)=>setImage(e.target.value)} placeholder="Enter an image name" />
                    </FlexBox>
                    <FlexBox className="col" style={{paddingRight:"10px"}}>
                        Scale
                        <Tippy content={scale} trigger={"mouseenter click"}>
                            <input type="range" style={{paddingLeft:"0px"}} min={"0"} max={maxScale.toString()} value={scale.toString()} onChange={(e)=>setScale(e.target.value)} />
                        </Tippy>
                        <datalist style={{display:"flex", alignItems:'center'}} id="sizeMarks">
                            <option style={{flex:"auto", textAlign:"left", lineHeight:"10px", paddingLeft:"8px"}} value="0" label="0"/>
                            <option style={{flex:"auto", textAlign:"right", lineHeight:"10px", paddingRight:"5px" }} value={maxScale} label={maxScale}/>
                        </datalist>
                    </FlexBox>
                    <FlexBox className="col" style={{paddingRight:"10px"}}>
                        Size
                        <input list="sizeMarks" style={{paddingLeft:"0px"}} type="range" min={"0"} value={size.toString()}  max={"2"} onChange={(e)=>setSize(e.target.value)}/>
                        <datalist style={{display:"flex", alignItems:'center'}} id="sizeMarks">
                            <option style={{flex:"auto", textAlign:"left", lineHeight:"10px"}} value="0" label="small"/>
                            <option style={{flex:"auto", textAlign:"center" , lineHeight:"10px"}} value="1" label="medium"/>
                            <option style={{flex:"auto", textAlign:"right", lineHeight:"10px" }} value="2" label="large"/>
                        </datalist>
                    </FlexBox>
                    <FlexBox className="col" style={{paddingRight:"10px"}}>
                        CMD
                        <input value={cmd} onChange={(e)=>setCmd(e.target.value)} placeholder="Enter the CMD for a service" />
                    </FlexBox>
            </FlexBox>
        </FlexBox>
    )
}

function NamespaceRevisions(props) {
    const {namespace, service} = props
    const navigate = useNavigate()
    const {revisions, config, deleteNamespaceServiceRevision, getNamespaceServiceConfig, createNamespaceServiceRevision} = useNamespaceService(Config.url, namespace, service, navigate, localStorage.getItem("apikey"))

    const [load, setLoad] = useState(true)
    const [image, setImage] = useState("")
    const [scale, setScale] = useState(0)
    const [size, setSize] = useState(0)
    const [cmd, setCmd] = useState("")
    const [maxScale, setMaxScale] = useState(0)
    
    useEffect(()=>{
        if(revisions !== null && revisions.length > 0) {
            setScale(revisions[0].minScale)
            setSize(revisions[0].size)
            setImage(revisions[0].image)
            setCmd(revisions[0].cmd)
        }
    },[revisions])

    useEffect(()=>{
        async function cfgGet() {
            try {
                await getNamespaceServiceConfig().then(response => setMaxScale(response.maxscale));
            } catch(e) {
                if(e.message === "get namespace service: not found"){
                    navigate(`/not-found`)
                }
            }
        }
        if(load && config === null) {
            cfgGet()
            setLoad(false)
        }
    },[config, getNamespaceServiceConfig, load, navigate])

    if(revisions === null) {
        return <></>
    }

    return(
        <FlexBox className="gap wrap" style={{paddingRight: "8px"}}>
            <FlexBox style={{flex: 6}}>
                <ContentPanel style={{width: "100%"}}>
                    <ContentPanelTitle>
                        <ContentPanelTitleIcon>
                            <VscLayers/>
                        </ContentPanelTitleIcon>
                        <FlexBox>
                            Service '{service}' Revisions
                        </FlexBox>
                        <div>
                            <Modal title={`New '${service}' revision`} 
                                escapeToCancel
                                modalStyle={{
                                    maxWidth: "300px"
                                }}
                                onOpen={() => {
                                }}
                                onClose={()=>{
                                }}
                                button={(
                                    <AddValueButton  label=" " />
                                )}  
                                keyDownActions={[
                                    KeyDownDefinition("Enter", async () => {
                                    }, ()=>{}, true)
                                ]}
                                requiredFields={[
                                    {tip: "image is required", value: image}
                                ]}
                                actionButtons={[
                                    ButtonDefinition("Add", async () => {
                                        await createNamespaceServiceRevision(image, parseInt(scale), parseInt(size), cmd, 100)
                                    }, "small", ()=>{}, true, false, true),
                                    ButtonDefinition("Cancel", () => {
                                    }, "small light", ()=>{}, true, false)
                                ]}
                            >
                                {config !== null ? 
                                <RevisionCreatePanel 
                                    image={image} setImage={setImage}
                                    scale={scale} setScale={setScale}
                                    size={size} setSize={setSize}
                                    cmd={cmd} setCmd={setCmd}
                                    maxScale={maxScale}
                                />:""}
                            </Modal>
                        </div>
                    </ContentPanelTitle>
                    <ContentPanelBody>

                        <FlexBox className="gap col">
                            <FlexBox className="gap col">
                                {revisions.sort((a, b)=> (a.created > b.created) ? -1 : 1).map((obj, i) => {

                                    let dontDelete = false
                                    return (
                                        <Service 
                                            latest={i===0}
                                            dontDelete={dontDelete && i !== 0} 
                                            revision={obj.rev}
                                            deleteService={deleteNamespaceServiceRevision}
                                            url={`/n/${namespace}/services/${service}/${obj.rev}`}
                                            conditions={obj.conditions}
                                            name={obj.name}
                                            status={obj.status}
                                        />
                                    )
                                })}
                            </FlexBox>
                        </FlexBox>

                    </ContentPanelBody>
                </ContentPanel>
            </FlexBox>
        </FlexBox>
    )
}