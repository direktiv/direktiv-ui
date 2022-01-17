import React, {useEffect, useState} from 'react';
import ContentPanel, {ContentPanelTitle, ContentPanelTitleIcon, ContentPanelBody } from '../../components/content-panel';
import Modal, { ButtonDefinition, KeyDownDefinition } from '../../components/modal';
import AddValueButton from '../../components/add-button';
import FlexBox from '../../components/flexbox';
import Alert from '../../components/alert';
import { useGlobalRegistries, useGlobalPrivateRegistries } from 'direktiv-react-hooks';
import {AddRegistryPanel, Registries} from '../settings/registries-panel'
import { Config } from '../../util';
import HelpIcon from '../../components/help';
import { VscAdd, VscServer } from 'react-icons/vsc';
import * as yup from "yup";


export default function GlobalRegistriesPanel(){
    return(
        <FlexBox className="gap wrap" style={{ paddingRight: "8px" }}>
            <FlexBox  style={{ minWidth: "380px" }}>
                <GlobalRegistries />
            </FlexBox>
            <FlexBox style={{minWidth:"380px"}}>
                <GlobalPrivateRegistries />
            </FlexBox>
        </FlexBox>
    )
}

export function GlobalRegistries(){

    const {data, getRegistries, createRegistry, deleteRegistry} = useGlobalRegistries(Config.url, localStorage.getItem("apikey"))

    const [url, setURL] = useState("")
    const [username, setUsername] = useState("")
    const [token, setToken] = useState("")

    return (
        <ContentPanel style={{width: "100%", minHeight: "180px"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscServer />
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Container Registries  
                    </div>
                    <HelpIcon msg={"Add a registry that can be accessed by any service"} />
                </FlexBox>
                <div>
                    <Modal title="New registry"
                        escapeToCancel
                        titleIcon={<VscAdd/>}
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
                            ButtonDefinition("Cancel", () => {
                            }, "small light", true, false)
                        ]}
                    >
                        <AddRegistryPanel token={token} setToken={setToken} username={username} setUsername={setUsername} url={url} setURL={setURL}/>    
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

export function GlobalPrivateRegistries(){

    const {data, getRegistries, createRegistry, deleteRegistry} = useGlobalPrivateRegistries(Config.url)

    const [url, setURL] = useState("")
    const [username, setUsername] = useState("")
    const [token, setToken] = useState("")
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const registryValidationSchema = yup.object().shape({
        url: yup.string().required(),
        username: yup.string().required(),
        token: yup.string().required()
    })

    useEffect(() => {

        registryValidationSchema.isValid({ url: url, username: username, token: token })
            .then((result) => setIsButtonDisabled(!result))

    },[registryValidationSchema, url, username, token])

    return (
        <ContentPanel style={{width: "100%", minHeight: "180px"}}>
            <ContentPanelTitle>
                <ContentPanelTitleIcon>
                    <VscServer />
                </ContentPanelTitleIcon>
                <FlexBox style={{display:"flex", alignItems:"center"}} className="gap">
                    <div>
                        Private Container Registries  
                    </div>
                    <HelpIcon msg={"Add a registry that is only available to global services"} />
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
                        }}
                        keyDownActions={[
                            KeyDownDefinition("Enter", async () => {
                                if (!isButtonDisabled) {
                                    return registryValidationSchema
                                        .validate({ url: url, username: username, token: token }, { abortEarly: false })
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
                                    return registryValidationSchema
                                        .validate({ url: url, username: username, token: token }, { abortEarly: false })
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
                            }, `small ${isButtonDisabled ? "disabled": "blue"}`, true, false),
                            ButtonDefinition("Cancel", () => {
                            }, "small light", true, false)
                        ]}
                    >
                        <AddRegistryPanel token={token} setToken={setToken} username={username} setUsername={setUsername} url={url} setURL={setURL}/>    
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