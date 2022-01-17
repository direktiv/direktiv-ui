import React, {useEffect, useState} from 'react';
import ContentPanel, {ContentPanelTitle, ContentPanelTitleIcon, ContentPanelBody } from '../../../components/content-panel';
import Modal, { ButtonDefinition, KeyDownDefinition } from '../../../components/modal';
import AddValueButton from '../../../components/add-button';
import FlexBox from '../../../components/flexbox';
import {SecretsDeleteButton} from '../secrets-panel';
import Alert from '../../../components/alert';
import { useRegistries } from 'direktiv-react-hooks';
import { Config } from '../../../util';
import HelpIcon from '../../../components/help';
import { VscServer, VscTrash } from 'react-icons/vsc';
import * as yup from "yup";

function RegistriesPanel(props){

    const {namespace} = props
    const {data, getRegistries, createRegistry, deleteRegistry}  = useRegistries(Config.url, namespace, localStorage.getItem("apikey"))

    const [testConnLoading, setTestConnLoading] = useState(false)
    const [successFeedback, setSuccessFeedback] = useState("")

    const [url, setURL] = useState("")
    const [username, setUsername] = useState("")
    const [token, setToken] = useState("")
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const registriesValidationSchema = yup.object().shape({
        url: yup.string().required(),
        username: yup.string().required(),
        token: yup.string().required()
    })

    useEffect(() => {

        registriesValidationSchema.isValid({url: url, username: username, token: token})
            .then((result) => setIsButtonDisabled(!result))

    },[registriesValidationSchema, url, username, token])

    let testConnBtnClasses = "small green"
    if (testConnLoading) {
        testConnBtnClasses += " btn-loading"
    }

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
                                if (!isButtonDisabled) {
                                    return registriesValidationSchema.validate({url: url, username: username, token: token}, { abortEarly: false })
                                        .then(async function() {
                                            let err = await createRegistry(url, `${username}:${token}`)
                                            if(err) return err
                                            await getRegistries()
                                        }).catch(function (err) {
                                            if (err.inner.length > 0) {
                                                return err.inner[0].message
                                            }
                                        });
                                }
                            }, !isButtonDisabled)
                        ]}
                        actionButtons={[
                            ButtonDefinition("Add", async() => {
                                if (!isButtonDisabled) {
                                    return registriesValidationSchema.validate({url: url, username: username, token: token}, { abortEarly: false })
                                        .then(function() {
                                            const err = createRegistry(url, `${username}:${token}`);
                                            if (err) {
                                                return err
                                            }
                                            getRegistries()
                                        }).catch(function (err) {
                                            if (err.inner.length > 0) {
                                                return err.inner[0].message
                                            }
                                        });
                                }
                            }, `small ${isButtonDisabled ? "disabled": "blue"}`, true, false),
                            ButtonDefinition("Test Connection", async () => {
                                if (!isButtonDisabled) {
                                    setTestConnLoading(true)
                                    let err = await TestRegistry(url, username, token)
                                    if (err) {
                                        setTestConnLoading(false)
                                        setSuccessFeedback(false)
                                        return err
                                    }
                                    setTestConnLoading(false)
                                    setSuccessFeedback(true)
                                }
                            }, `small ${isButtonDisabled ? "disabled": testConnBtnClasses}`, false, false),
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
                    <div>
                        <Alert>Once a registry is removed, it can never be restored.</Alert>
                    </div>
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
    const {successMsg, url, setURL, token, setToken, username, setUsername, urlErr, userErr, tokenErr} = props

    return (
        <FlexBox className="col gap" style={{fontSize: "12px"}}>
            { successMsg ? 
            <FlexBox>
                <Alert className="success">Connection seems good!</Alert>
            </FlexBox>
            :<></>}
            <FlexBox className="col gap">
                <FlexBox className="gap" style={{margin: "-12px 0 -8px 0"}}>
                    URL
                    <span className="required-label">*</span>
                </FlexBox>
                <FlexBox className="gap">
                    <input value={url} onChange={(e)=>setURL(e.target.value)} autoFocus placeholder="Enter URL" />
                    {urlErr !== "" ?
                        <FlexBox>
                            <span style={{fontWeight:"normal", color:"red", fontSize:"10pt", lineHeight:"20px"}}>{tokenErr}</span>
                        </FlexBox>
                        :
                        ""
                    }
                </FlexBox>
            </FlexBox>
            <FlexBox className="col gap" style={ {paddingRight: "7px"}}>
                <FlexBox className="gap" style={{margin: "-8px 20px -8px 0"}}>
                    Username
                    <span className="required-label">*</span>
                </FlexBox>
                <FlexBox>
                    <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter username" />
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
                <FlexBox className="gap">
                    <FlexBox className="gap" style={{margin: "-16px 0 -8px 0"}}>
                        Token
                        <span className="required-label">*</span>
                    </FlexBox>
                </FlexBox>
                <FlexBox className="gap">
                    <input value={token} onChange={(e)=>setToken(e.target.value)} type="password" placeholder="Enter token" />
                    {tokenErr !== "" ?
                    <FlexBox>
                        <span style={{fontWeight:"normal", color:"red", fontSize:"10pt", lineHeight:"20px"}}>{tokenErr}</span>
                    </FlexBox>
                    :
                    ""
                    }
                </FlexBox>
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
                                    titleIcon={<VscTrash/>}
                                    button={(
                                        <SecretsDeleteButton/>
                                    )} 
                                    actionButtons={
                                        [
                                            // label, onClick, classList, closesModal, async
                                            ButtonDefinition("Delete", async () => {
                                                try { 
                                                    await deleteRegistry(obj.name)
                                                    await getRegistries()
                                                } catch(err) {
                                                    await getRegistries()
                                                    return err
                                                }
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