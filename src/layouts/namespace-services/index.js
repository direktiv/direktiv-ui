import { useNamespaceServices } from "direktiv-react-hooks";
import { IoChevronDownOutline, IoChevronForwardOutline, IoPlay } from "react-icons/io5";
import "./style.css"
import React, {useEffect, useState} from "react"
import { RiDeleteBin2Line } from "react-icons/ri";
import { FaCircle} from "react-icons/fa"
import ContentPanel, { ContentPanelBody, ContentPanelTitle, ContentPanelTitleIcon } from "../../components/content-panel";
import FlexBox from "../../components/flexbox";
import { Config, GenerateRandomKey } from "../../util";
import Modal, { ButtonDefinition } from "../../components/modal";
import AddValueButton from "../../components/add-button";
import {Link} from 'react-router-dom'
import HelpIcon from "../../components/help"
import * as yup from "yup";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function ServicesPanel(props) {
    const {namespace} = props

    if(!namespace) {
        return <></>
    }
    return(
        <FlexBox className="gap wrap" style={{paddingRight:"8px"}}>
            <NamespaceServices namespace={namespace}/>
        </FlexBox>
    )
}

export function ServiceCreatePanel(props) {
    const {name, setName, image, setImage, scale, setScale, size, setSize, cmd, setCmd, maxScale} = props

    return(
        <FlexBox className="col gap" style={{fontSize: "12px"}}>
            <FlexBox className="gap" style={{margin: "-12px 0 -9px 0"}}>
                Name
                <span className="required-label">*</span>
            </FlexBox>
            <FlexBox className="gap" style={{paddingRight:"10px"}}>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter name for service" />
            </FlexBox>
            <FlexBox className="gap" style={{margin: "-9px 0 -9px 0"}}>
                Image
                <span className="required-label">*</span>
            </FlexBox>
            <FlexBox className="gap" style={{paddingRight:"10px"}}>
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
            <FlexBox className="gap" style={{margin: "-12px 0 -8px 0"}}>
                CMD
            </FlexBox>
            <FlexBox className="gap" style={{paddingRight:"10px"}}>
                <input value={cmd} onChange={(e)=>setCmd(e.target.value)} placeholder="Enter the CMD for a service" />
            </FlexBox>
        </FlexBox>
    )
}

function NamespaceServices(props) {
    const {namespace} = props

    const [load, setLoad] = useState(true)
    const [serviceName, setServiceName] = useState("")
    const [image, setImage] = useState("")
    const [scale, setScale] = useState(0)
    const [size, setSize] = useState(0)
    const [cmd, setCmd] = useState("")
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)
    const [maxScale, setMaxScale] = useState(0)

    const serviceValidationSchema = yup.object().shape({
        name: yup.string().required(),
        image: yup.string().required()
    })

    useEffect(() => {

        serviceValidationSchema.isValid({ name: serviceName, image: image })
            .then((result) => setIsButtonDisabled(!result))

    },[serviceValidationSchema, image, serviceName])

    const {data, err, config, getNamespaceConfig, getNamespaceServices, createNamespaceService, deleteNamespaceService} = useNamespaceServices(Config.url, true, namespace, localStorage.getItem("apikey"))

    useEffect(()=>{
        async function getcfg() {
            await getNamespaceConfig().then(response => setMaxScale(response.maxscale));
            await getNamespaceServices();
        }
        if(load && config === null && data === null) {
            getcfg()
            setLoad(false)
        }
    },[config, getNamespaceConfig, data, getNamespaceServices, load])

    if (err !== null) {
        // error happened with listing services
        console.log(err)
    }

    if(data === null) {
        return <></>
    }

    return(
        <ContentPanel style={{width:"100%", minWidth: "300px"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <IoPlay/>
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                            <div>
                                Services 
                            </div>
                            <HelpIcon msg={"Services that are available to be used by workflows in the same namespace."} />
                        </FlexBox>
                <div>
                <Modal title="New namespace service" 
                    escapeToCancel
                    modalStyle={{
                        maxWidth: "300px"
                    }}
                    onOpen={() => {
                    }}
                    onClose={()=>{
                        setServiceName("")
                        setImage("")
                        setScale(0)
                        setSize(0)
                        setCmd("")
                    }}
                    button={(
                        <AddValueButton  label=" " />
                    )}
                    actionButtons={[
                        ButtonDefinition("Add", async () => {
                            await createNamespaceService(serviceName, image, parseInt(scale), parseInt(size), cmd)
                        }, `small ${isButtonDisabled ? "disabled": "blue"}`,(err)=>{return err},true,false),
                        ButtonDefinition("Cancel", () => {
                        }, "small light", ()=>{}, true, false)
                    ]}
                >
                    {config !== null ? 
                        <ServiceCreatePanel cmd={cmd} setCmd={setCmd} size={size} setSize={setSize} name={serviceName} setName={setServiceName} image={image} setImage={setImage} scale={scale} setScale={setScale} maxScale={maxScale} />
                        :
                        ""
                    }
                </Modal>
            </div>
            </ContentPanelTitle>
            <ContentPanelBody className="secrets-panel">
                <FlexBox className="gap col">
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
                        :
                        <>
                        {
                            data.map((obj)=>{
                                return(
                                    <Service 
                                        url={`/n/${namespace}/services/${obj.info.name}`} 
                                        deleteService={deleteNamespaceService} 
                                        conditions={obj.conditions} 
                                        name={obj.info.name} 
                                        status={obj.status} 
                                        image={obj.info.image} 
                                    />
                                )
                            })
                        }
                        </>}
                    </FlexBox>
                </FlexBox>
            </ContentPanelBody>
        </ContentPanel>

    )
}

export function Service(props) {
    const {name, image, status, conditions, deleteService, url, revision, dontDelete, traffic, latest} = props
    console.log(url)
    return(
        <div className="col" style={{minWidth: "300px"}}>
            <FlexBox style={{ height:"40px", border:"1px solid #f4f4f4", backgroundColor:"#fcfdfe"}}>
                <Link to={url} style={{ width: "100%", display: "flex", alignItems: "center" }}>
                    <FlexBox className="gap" style={{alignItems:"center", paddingLeft:"8px"}}>
                        <ServiceStatus status={status} />
                        <div style={{fontWeight:"bold"}}>
                            {name}
                        </div>
                        <div style={{fontStyle:"italic"}} className="grey-text">
                            {image}
                        </div>
                        {/* 
                        // Todo add contextually what is using this service
                        <div>
                            x
                        </div> */}
                    </FlexBox>
                </Link>
                {!dontDelete && !traffic ? 
                <>
                        {latest ? 
                         <div style={{height: "100%", display: "flex", paddingRight: "26px" }}>
                         <HelpIcon msg={"Unable to delete latest revision"} />

                         </div>
                    :
                <div style={{paddingRight:"25px", maxWidth:"20px", margin: "auto"}}>
                    <Modal  title="Delete namespace service" 
                        escapeToCancel
                        modalStyle={{
                            maxWidth: "300px"
                        }}
                        onOpen={() => {
                        }}
                        onClose={()=>{
                        }}
                        button={(
                            <ServicesDeleteButton />
                        )}  
                        actionButtons={[
                            ButtonDefinition("Delete", async () => {
                                if(revision !== undefined) {
                                    await deleteService(revision)
                                }else {
                                    await deleteService(name)
                                }
                             
                            }, "small red", ()=>{}, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", ()=>{}, true, false)
                        ]}
                    >
                        <FlexBox className="col gap">
                            <FlexBox >
                                Are you sure you want to delete '{name}'?
                                <br/>
                                This action cannot be undone.
                            </FlexBox>
                        </FlexBox>
                    </Modal>
                </div>}
                </>
                : 
                    <>
                    {traffic ?     
                    <div style={{paddingRight:"25px", maxWidth:"20px", margin: "auto", fontSize:"10pt", fontWeight:"bold"}}>
                        {traffic}%
                    </div>:""}
                    </>
                }
            </FlexBox>
            <FlexBox style={{border:"1px solid #f4f4f4", borderTop:"none"}}>
                <ServiceDetails conditions={conditions} />
            </FlexBox>
        </div>
    )
}

function ServiceDetails(props) {
    const {conditions} = props

    return(
        <ul className="condition-list" style={{listStyle:"none", paddingLeft:"25px", paddingRight:"40px", width:"100%"}}>
            {conditions.map((obj)=>{
                if(obj.name === 'Active' && obj.reason === 'NoTraffic' && obj.message === "The target is not receiving traffic."){
                    return(
                        <Condition key={GenerateRandomKey('service-condition-')} status={"True"} name={obj.name} reason={""} message={""} />
                    )
                }
                return(
                    <Condition key={GenerateRandomKey('service-condition-')} status={obj.status} name={obj.name} reason={obj.reason} message={obj.message}/>
                )
            })}

        </ul>
    )
}

function Condition(props){
    const {status, name, reason, message} = props

    const [showDetails, setShowDetails] = useState(false)

    let waitMsgClasses = "wait-message "
    let failMsgClasses = "fail-message "

    if (showDetails) {
        waitMsgClasses += "visible"
        failMsgClasses += "visible"
    }

    return (
        <li style={{ display: "flex", gap: "8px" }}>
            <FlexBox className="col">
                <FlexBox className="gap">
                    <div>
                        <ServiceStatus status={status}/>
                    </div>
                    <FlexBox className="gap">
                        <FlexBox>
                            {name}
                        </FlexBox>
                        {status !== 'True' && reason !== "" && message !== "" ?
                        <FlexBox style={{
                            maxWidth: "120px"
                        }}>
                            <div className="toggle-details" onClick={() => {setShowDetails(!showDetails)}} style={{
                                color:"#dbd9d9", 
                                display:"flex", 
                                alignItems:"center", 
                                fontSize:"10pt", 
                                cursor:"pointer"
                            }}>
                            {showDetails ?
                            <>
                                <IoChevronDownOutline />
                                <div>Hide Details</div>
                            </>
                            :   
                            <>
                                <IoChevronForwardOutline />
                                <div>Show Details</div>
                            </>}
                            </div>
                        </FlexBox>
                        :""}
                    </FlexBox>
                </FlexBox>
                <FlexBox>
                {status === 'Unknown' ?
                    <div className={waitMsgClasses} style={{marginLeft:"14px"}}>
                {reason !== ""  ? 
                    <div className="grey-text" style={{fontSize:"10pt", fontStyle:"italic"}}>
                        {reason}
                    </div>:""}
                {message !== "" ? 
                    <div>
                        <div className="msg-box">
                            {message}
                        </div>
                    </div>
                :""}
                    </div>
                :""}

                { status === 'False' ? 
                    <div className={failMsgClasses} style={{marginLeft:"14px"}}>
                        <div className="grey-text" style={{fontSize: "10pt", fontStyle: "italic"}}>
                            {reason}
                        </div>
                        <div className="msg-box">
                            {message}
                        </div>
                    </div>
                :""}
                </FlexBox>
            </FlexBox>
        </li>
    )
}

export function ServiceStatus(props) {
    const {status} = props

    let color = "#66DE93"
    if (status === "False") {
        color = "#FF616D"
    }

    if (status === "Unknown") {
        color = "#082032"
    }

    return(
        <div>   
            <FaCircle style={{fontSize:"6pt", fill: color}} />
        </div>
    )
}

function ServicesDeleteButton(props) {
    const {onClick} = props

    return (
        <FlexBox onClick={onClick} className="col red-text" style={{height: "100%", textAlign:"right", width:"30px"}}>
            <div className="secrets-delete-btn" style={{height: "100%", display: "flex", paddingRight: "8px" }}>
                <RiDeleteBin2Line className="auto-margin" />
            </div>
        </FlexBox>
    )
}