import React, { useState } from 'react';
import ContentPanel, {ContentPanelTitle, ContentPanelTitleIcon, ContentPanelBody } from '../../../components/content-panel';
import Modal, { ButtonDefinition, KeyDownDefinition } from '../../../components/modal';
import FlexBox from '../../../components/flexbox';
import {SecretsDeleteButton} from '../secrets-panel';
import Alert from '../../../components/alert';
import { useRegistries } from 'direktiv-react-hooks';
import { Config } from '../../../util';
import HelpIcon from '../../../components/help';
import { VscServer, VscTrash } from 'react-icons/vsc';

import { VscAdd } from 'react-icons/vsc';


function RegistriesPanel(props){

    const {namespace} = props
    const {data, getRegistries, createRegistry, deleteRegistry}  = useRegistries(Config.url, namespace, localStorage.getItem("apikey"))

    const [testConnLoading, setTestConnLoading] = useState(false)
    const [successFeedback, setSuccessFeedback] = useState("")

    const [url, setURL] = useState("")
    const [username, setUsername] = useState("")
    const [token, setToken] = useState("")

    // err handling
    const [err, setErr] = useState("")
    const [urlErr, setURLErr] = useState("")
    const [userErr, setUserErr] = useState("")
    const [tokenErr, setTokenErr] = useState("")

    return (
        <ContentPanel style={{ height: "100%", minHeight: "180px", width: "100%" }}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscServer />
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Container Registries   
                    </div>
                    <HelpIcon msg={"Additional container registries can be added for images to be pulled from when defining services/isolates."} />
                </FlexBox>
                <div>
                    <Modal title="New registry"
                        escapeToCancel
                        modalStyle={{
                            maxWidth: "450px"
                        }}
                        titleIcon={<VscServer/>}
                        button={(
                            <VscAdd/>
                        )}
                        buttonProps={{
                            auto: true,
                        }}
                        onClose={()=>{
                            setURL("")
                            setToken("")
                            setUsername("")
                            setURLErr("")
                            setTokenErr("")
                            setUserErr("")
                            setErr("")
                            setSuccessFeedback(false)
                            setTestConnLoading(false)
                        }}
                        keyDownActions={[
                            KeyDownDefinition("Enter", async () => {
                                setURLErr("")
                                setTokenErr("")
                                setUserErr("")
                                setErr("")
                                let filledOut = true
                                if(url === ""){
                                    setURLErr("url must be filled out")
                                    filledOut = false
                                }
                                if(username === "") {
                                    setUserErr("username must be filled out")
                                    filledOut = false
                                }
                                if(token === "") {
                                    setTokenErr("token must be filled out")
                                    filledOut = false
                                }
                                if(!filledOut) throw new Error("all fields must be filled out")
                                await createRegistry(url, `${username}:${token}`)
                                await getRegistries()
                            }, ()=>{}, true)
                        ]}
                        requiredFields={[
                            {tip: "url is required", value: url},
                            {tip: "username is required", value: username},
                            {tip: "token is required", value: token}
                        ]}
                        actionButtons={[
                            ButtonDefinition("Add", async() => {
                                setURLErr("")
                                setTokenErr("")
                                setUserErr("")
                                setErr("")
                                let filledOut = true
                                if(url === ""){
                                    setURLErr("Please enter a URL...")
                                    filledOut = false
                                }
                                if(username === "") {
                                    setUserErr("Please enter a username...")
                                    filledOut = false
                                }
                                if(token === "") {
                                    setTokenErr("Please enter a token...")
                                    filledOut = false
                                }
                                if(!filledOut) throw new Error("all fields must be filled out")
                                await createRegistry(url, `${username}:${token}`)
                                await  getRegistries()
                            }, {variant: "contained", color: "primary"}, ()=>{}, true, false, true),
                            ButtonDefinition("Test Connection", async () => {
                                setURLErr("")
                                setTokenErr("")
                                setUserErr("")
                                setErr("")
                                let filledOut = true
                                if(url === ""){
                                    setURLErr("Please enter a URL...")
                                    filledOut = false
                                }
                                if(username === "") {
                                    setUserErr("Please enter a username...")
                                    filledOut = false
                                }
                                if(token === "") {
                                    setTokenErr("Please enter a token...")
                                    filledOut = false
                                }
                                if(!filledOut) throw new Error("all fields must be filled out")
                                setTestConnLoading(true)
                                let resp = await TestRegistry(url, username, token)
                                if (resp.success) {
                                    setTestConnLoading(false)
                                    setSuccessFeedback(true)
                                } else {
                                    setTestConnLoading(false)
                                    setSuccessFeedback(false)
                                    setErr(resp.message)                                
                                }
                           
                            }, `small ${testConnLoading ? "loading" : ""}`, ()=>{   setTestConnLoading(false)
                                setSuccessFeedback(false)}, false, false, true),
                            ButtonDefinition("Cancel", () => {
                            }, {}, ()=>{}, true, false)
                        ]}
                    >
                        <AddRegistryPanel err={err} urlErr={urlErr} userErr={userErr} tokenErr={tokenErr} successMsg={successFeedback} token={token} setToken={setToken} username={username} setUsername={setUsername} url={url} setURL={setURL}/>    
                    </Modal> 
                </div>
            </ContentPanelTitle>
            <ContentPanelBody className="secrets-panel">
                <FlexBox className="gap col">
                    <FlexBox>
                        {data !== null ? 
                        <Registries deleteRegistry={deleteRegistry} getRegistries={getRegistries} registries={data}/>
                            :""}
                    </FlexBox>
                    <div>
                        <Alert severity="info">Once a registry is removed, it can never be restored.</Alert>
                    </div>
                </FlexBox>
            </ContentPanelBody>
        </ContentPanel>
    )
}

export default RegistriesPanel;

export async function TestRegistry(url, username, token) {

    try {
        let resp = await fetch(`${Config.url}functions/registries/test`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password: token,
                url
            })
        })
    
        // if response is ok the the connection is valid
        if(resp.ok) {
            return {
                success: true,
                message: "Success!"
            }
        }
    
        if(resp.status === 500) {
            let json = await resp.json()
            return { 
                success: false,
                message: json.message
            }
        }
    
        if(resp.status === 401) {
            if(url === "https://registry.hub.docker.com") {
                let text = await resp.text()
                return {
                    success: false,
                    message: text
                }
            } else {
                let json = await resp.json()
                return {
                    success: false,
                    message: json.errors[0].message
                }
            }
        }
    } catch(e) {
        return {
            success: false,
            message: e.message
        }
    }
    
}

// const registries = ["https://docker.io", "https://gcr.io", "https://us.gcr.io"]

export function AddRegistryPanel(props) {
    const {err, successMsg, url, setURL, token, setToken, username, setUsername, urlErr, userErr, tokenErr} = props

    return (
        <FlexBox className="col gap" style={{fontSize: "12px"}}>
            { successMsg ? 
            <FlexBox>
                <Alert grow>Connection seems good!</Alert>
            </FlexBox>
            :<></>}
            { err ?
            <FlexBox>
            <Alert severity="error" variant="filled" grow>{err}</Alert>
            </FlexBox>
            : <></> }
            <FlexBox className="col">
            <FlexBox style={{flexDirection:"column"}}>
                <FlexBox className="gap">
                Registry URL <HelpIcon msg={`An example of url for Docker is https://index.docker.io or for Google https://gcr.io`}/>
                </FlexBox>
                <FlexBox style={{paddingRight:"8px"}}>
                <input value={url} onChange={(e)=>setURL(e.target.value)} autoFocus placeholder={`Enter URL`} />


                </FlexBox>

                </FlexBox>
                {urlErr !== "" ?
                <FlexBox>
                    <span style={{fontWeight:"normal", color:"red", fontSize:"10pt", lineHeight:"20px"}}>{tokenErr}</span>                  
                </FlexBox>
                :
                ""  
                }
          
            </FlexBox>
            <FlexBox className="col">
                <FlexBox style={{flexDirection:"column"}}>
                <FlexBox className="gap">
                Username 
                </FlexBox>
                <FlexBox style={{paddingRight:"8px"}}>
                <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter username" />     


                </FlexBox>
                </FlexBox>
                {userErr !== "" ?
                <FlexBox>
                    <span style={{fontWeight:"normal", color:"red", fontSize:"10pt", lineHeight:"20px"}}>{userErr}</span>                  
                </FlexBox>
                :
                ""  
                }
            </FlexBox>
            <FlexBox className="col gap">
                <FlexBox style={{flexDirection:"column"}}>
                <FlexBox className="gap">
                Password
                </FlexBox>
                <FlexBox style={{paddingRight:"8px"}}>
                <input value={token} onChange={(e)=>setToken(e.target.value)} type="password" placeholder="Enter token" />

                </FlexBox>

                </FlexBox>
                {tokenErr !== "" ?
                <FlexBox>
                    <span style={{fontWeight:"normal", color:"red", fontSize:"10pt", lineHeight:"20px"}}>{tokenErr}</span>                  
                </FlexBox>
                :
                ""  
                }
            </FlexBox>
        </FlexBox>
    );
}

export function Registries(props) {
    const {registries, deleteRegistry, getRegistries} = props

    return(
        <>
            <FlexBox className="col gap" style={{ maxHeight: "236px", overflowY: "auto" }}>
            {registries.length === 0 ? 
                     <FlexBox className="secret-tuple empty-content">
                     <FlexBox className="key">No registries are stored...</FlexBox>
                     <FlexBox className="val"></FlexBox>
                     <FlexBox className="val"></FlexBox>
                     <FlexBox className="actions">
                     </FlexBox>
                 </FlexBox>
            :
            <>
            {registries.map((obj)=>{
                    return (
                        <FlexBox key={obj.name} className="secret-tuple">
                            <FlexBox className="key">{obj.name} <span className="muted-text" style={{ marginLeft: "8px" }}>({obj.user})</span></FlexBox>
                            <FlexBox className="val"></FlexBox>
                            <FlexBox className="val"></FlexBox>
                            <FlexBox className="actions">
                                <Modal 
                                    escapeToCancel
                                    modalStyle={{width: "400px"}}
                                    style={{
                                        flexDirection: "row-reverse",
                                        marginRight: "8px"
                                    }}
                                    title="Remove registry" 
                                    titleIcon={<VscTrash/>}
                                    button={(
                                        <SecretsDeleteButton/>
                                    )} 
                                    actionButtons={
                                        [
                                            // label, onClick, classList, closesModal, async
                                            ButtonDefinition("Delete", async () => {
                                                    await deleteRegistry(obj.name)
                                                    await getRegistries()
                                            }, {variant: "contained", color: "error"},()=>{}, true, false),
                                            ButtonDefinition("Cancel", () => {
                                            }, {},()=>{}, true, false)
                                        ]
                                    }   
                                >
                                    <FlexBox className="col gap">
                                        <FlexBox>
                                            Are you sure you want to remove '{obj.name}'?
                                            <br/>
                                            This action cannot be undone.
                                        </FlexBox>
                                    </FlexBox>
                                </Modal>
                            </FlexBox>
                        </FlexBox>
                    )
                })}</>}
            </FlexBox>
        </>
    );
}