import React, { useState } from 'react';
import ContentPanel, {ContentPanelTitle, ContentPanelTitleIcon, ContentPanelBody } from '../../../components/content-panel';
import Modal, { ButtonDefinition, KeyDownDefinition } from '../../../components/modal';
import { IoLogoDocker } from 'react-icons/io5';
import AddValueButton from '../../../components/add-button';
import FlexBox from '../../../components/flexbox';
import {SecretsDeleteButton} from '../secrets-panel';
import Alert from '../../../components/alert';
import { useRegistries } from 'direktiv-react-hooks';
import { Config } from '../../../util';
import HelpIcon from '../../../components/help';

function RegistriesPanel(props){

    const {namespace} = props
    const {data, err, getRegistries, createRegistry, deleteRegistry}  = useRegistries(Config.url, namespace, localStorage.getItem("apikey"))

    const [testConnLoading, setTestConnLoading] = useState(false)
    const [successFeedback, setSuccessFeedback] = useState("")

    const [url, setURL] = useState("")
    const [username, setUsername] = useState("")
    const [token, setToken] = useState("")

    let testConnBtnClasses = "small green"
    if (testConnLoading) {
        testConnBtnClasses += " btn-loading"
    }

    console.log("Registries", err)
    return (
        <ContentPanel style={{width: "100%", minHeight: "180px"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <IoLogoDocker />
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
                            maxWidth: "450px",
                            minWidth: "450px"
                        }}
                        button={(
                            <AddValueButton label=" " />
                        )} 
                        onClose={()=>{
                            setURL("")
                            setToken("")
                            setUsername("")
                            setSuccessFeedback(false)
                            setTestConnLoading(false)
                        }}
                        keyDownActions={[
                            KeyDownDefinition("Enter", async () => {
                                let err = await createRegistry(url, `${username}:${token}`)
                                if(err) return err
                                await getRegistries()
                            }, true)
                        ]}
                        actionButtons={[
                            ButtonDefinition("Add", async() => {
                                let err = await createRegistry(url, `${username}:${token}`)
                                if(err) return err
                                await  getRegistries()
                            }, "small blue", true, false),
                            ButtonDefinition("Test Connection", async () => {
                                setTestConnLoading(true)
                                let err = await TestRegistry(url, username, token)
                                if(err) {
                                    setTestConnLoading(false)
                                    setSuccessFeedback(false)
                                    return err
                                }
                                setTestConnLoading(false)
                                setSuccessFeedback(true)
                            }, testConnBtnClasses, false, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", true, false)
                        ]}
                    >
                        <AddRegistryPanel successMsg={successFeedback} token={token} setToken={setToken} username={username} setUsername={setUsername} url={url} setURL={setURL}/>    
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
                    <FlexBox style={{maxHeight: "44px"}}>
                        <Alert>Once a registry is removed, it can never be restored.</Alert>
                    </FlexBox>
                </FlexBox>
            </ContentPanelBody>
        </ContentPanel>
    )
}

export default RegistriesPanel;

async function TestRegistry(url, username, token) {

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
        return
    }

    if(resp.status === 500) {
        let json = await resp.json()
        return json.message
    }

    if(resp.status === 401) {
        if(url === "https://registry.hub.docker.com") {
            let text = await resp.text()
            return text
        } else {
            let json = await resp.json()
            return json.errors[0].message
        }
    }
    
}

// const registries = ["https://docker.io", "https://gcr.io", "https://us.gcr.io"]

export function AddRegistryPanel(props) {
    const {successMsg, url, setURL, token, setToken, username, setUsername} = props

    return (
        <FlexBox className="col gap" style={{fontSize: "12px"}}>
            { successMsg ? 
            <FlexBox>
                <Alert className="success">Connection seems good!</Alert>
            </FlexBox>
            :<></>}
            <FlexBox className="gap">
                <FlexBox>
                    <input value={url} onChange={(e)=>setURL(e.target.value)} autoFocus placeholder="Enter URL" />
                </FlexBox>
            </FlexBox>
            <FlexBox className="gap">
                <FlexBox><input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter username" /></FlexBox>
            </FlexBox>
            <FlexBox className="gap">
                <FlexBox><input value={token} onChange={(e)=>setToken(e.target.value)} type="password" placeholder="Enter token" /></FlexBox>
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
                     <FlexBox className="secret-tuple">
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
                            <FlexBox className="key">{obj.name}</FlexBox>
                            <FlexBox className="val"></FlexBox>
                            <FlexBox className="val"></FlexBox>
                            <FlexBox className="actions">
                                <Modal 
                                    escapeToCancel
                                    style={{
                                        flexDirection: "row-reverse",
                                        marginRight: "8px"
                                    }}
                                    title="Remove registry" 
                                    button={(
                                        <SecretsDeleteButton/>
                                    )} 
                                    actionButtons={
                                        [
                                            // label, onClick, classList, closesModal, async
                                            ButtonDefinition("Delete", async () => {
                                                let err = await deleteRegistry(obj.name)
                                                if (err) return err
                                                await getRegistries()
                                            }, "small red", true, false),
                                            ButtonDefinition("Cancel", () => {
                                            }, "small light", true, false)
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