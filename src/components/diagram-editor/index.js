import { useGlobalServices, useNamespaceVariables, useNamespaceServices } from 'direktiv-react-hooks';
import { useCallback, useEffect, useState } from 'react';
import { VscGear, VscListUnordered, VscSymbolEvent } from 'react-icons/vsc';
import Button from '../../components/button';
import Alert from '../../components/alert';
import FlexBox from '../../components/flexbox';
import { Config } from '../../util';
import './style.css';
import Drawflow from 'drawflow';
import { Resizable } from 're-resizable';
import YAML from "json-to-pretty-yaml"
import styleDrawflow from 'drawflow/dist/drawflow.min.css'


import { GenerateFunctionSchemaWithEnum, GetSchema } from "../../components/diagram-editor/jsonSchema"
import Form from '@rjsf/core';
import { CreateNode, DefaultValidateSubmitCallbackMap, onSubmitCallbackMap, setConnections } from '../../components/diagram-editor/util';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import Fuse from 'fuse.js';
import { ActionsNodes, NodeStateAction } from "../../components/diagram-editor/nodes";



import { importFromYAML } from '../../components/diagram-editor/import';
import Modal, { ButtonDefinition, ModalHeadless } from '../modal';

import Ajv from "ajv"

const uiSchema = {
    "transform": {
        "jqQuery": {
            "ui:widget": "textarea"
        },
        "rawYAML": {
            "ui:widget": "textarea"
        }
    }
}

const actionsNodesFuse = new Fuse(ActionsNodes, {
    keys: ['name']
})


function Actions(props) {
    const cache = new CellMeasurerCache({
        fixedWidth: false,
        fixedHeight: true
    })

    function rowRenderer({ index, parent, key, style }) {
        return (
            <CellMeasurer
                key={`action-${key}`}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                <div style={{ ...style, minHeight: "90px", height: "90px", cursor: "move", userSelect: "none", display: "flex" }}>
                    <div className={`action ${ActionsNodes[index].family} action-${ActionsNodes[index].type}`} draggable={true} node-index={index} onDragStart={(ev) => {
                        ev.stopPropagation();

                        console.log("onDragStart = ", ev);
                        console.log("ev.target.getAttribute(node-index) = ", ev.target.getAttribute("node-index"))
                        ev.dataTransfer.setData("nodeIndex", ev.target.getAttribute("node-index"));
                        // ev.preventDefault();


                    }}>
                        <div style={{ marginLeft: "5px" }}>
                            <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", justifyContent: "space-between" }}>
                                <span style={{ whiteSpace: "pre-wrap", cursor: "move", fontSize: "13px" }}>
                                    {ActionsNodes[index].name}
                                </span>
                                <a style={{ whiteSpace: "pre-wrap", cursor: "pointer", fontSize: "11px", paddingRight: "3px" }} href={`${ActionsNodes[index].info.link}`} target="_blank" rel="noreferrer">More Info</a>

                            </div>
                            <div style={{ fontSize: "10px", lineHeight: "10px", paddingTop: "2px" }}>
                                <p style={{ whiteSpace: "pre-wrap", cursor: "move", margin: "0px" }}>
                                    {ActionsNodes[index].info.description}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </CellMeasurer>
        );
    }

    return (
        <AutoSizer>
            {({ height, width }) => (
                <div style={{ height: "100%", minHeight: "100%" }}>
                    <List
                        width={width}
                        height={height}
                        rowRenderer={rowRenderer}
                        deferredMeasurementCache={cache}
                        scrollToIndex={0}
                        rowCount={ActionsNodes.length}
                        rowHeight={90}
                        scrollToAlignment={"start"}
                    />
                </div>
            )}
        </AutoSizer>
    )
}

function FunctionsList(props) {
    const { functionList, setFunctionList, namespace } = props

    // const [functionList, setFunctionList] = useState([])
    const [newFunctionFormRef, setNewFunctionFormRef] = useState(null)
    const [formData, setFormData] = useState({})
    // const {data} = useNamespaceServices(Config.url, false, namespace, localStorage.getItem("apikey"))

    // console.log("useNamespaceServices data = ", data)

    const namespaceServiceHook = useNamespaceServices(Config.url, false, namespace, localStorage.getItem("apikey"))
    const globalServiceHook = useGlobalServices(Config.url, false, localStorage.getItem("apikey"))
    // const namespaceVariableHook = useNamespaceVariables(Config.url, false, namespace, localStorage.getItem("apikey"))

    // console.log("namespaceServiceHook data = ", namespaceServiceHook.data)
    // console.log("globalServiceHook data = ", globalServiceHook.data)
    // console.log("namespaceVariableHook data = ", namespaceVariableHook.data)

    useEffect(() => {
        console.log("mounting functions list")
        return () => { console.log("unmounting functions list") };
    }, [])

    // TODO: hook this up
    // const checkFunctionList = useCallback(()=>{
    //     console.log("formData = ", formData)
    //     if (!formData || !formData.type) {
    //         return {tip:"", value:"valid"}
    //     }

    //     switch (formData.type) {
    //         case "knative-namespace":
    //             if (namespaceServiceHook.data && !namespaceServiceHook.data.length >0 ){
    //                 return {tip:"No Namespace Services", value:""}
    //             }
    //             break;
    //         case "knative-global":
    //             if (globalServiceHook.data && !globalServiceHook.data.length >0 ){
    //                 return {tip:"No Global Services", value:""}
    //             }
    //             break;
    //         default:
    //     }
    //     return {tip:"", value:"valid"}
    // }, [formData])

    if (namespaceServiceHook.data === null || globalServiceHook.data === null) {
        return <></>
    }

    const ajv = new Ajv()
    const schema = GenerateFunctionSchemaWithEnum(namespaceServiceHook.data.map(a => a.serviceName), (globalServiceHook.data.map(a => a.serviceName)))
    const validate = ajv.compile(schema)






    // useEffect(()=>{
    //     const newfMap = functionsList.reduce(function(result, item, index, array) {
    //         result[item.id] = item;
    //         return result;
    //       }, {}) 

    //       console.log("updating function map to =", newfMap)
    //     setFunctionMap({...newfMap})
    //     console.log()
    // },[functionsList])

    const cache = new CellMeasurerCache({
        fixedWidth: false,
        fixedHeight: true
    })

    function rowRenderer({ index, parent, key, style }) {
        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}
            >
                <div style={{ ...style, minHeight: "6px", height: "84px", cursor: "move", userSelect: "none", display: "flex" }}>
                    <div className={`function`} draggable={true} function-index={index} onDragStart={(ev) => {
                        // console.log("onDragStart = ", ev);
                        // console.log("ev.target.getAttribute(node-index) = ", ev.target.getAttribute("node-index"))
                        ev.dataTransfer.setData("functionIndex", ev.target.getAttribute("function-index"));
                    }}>
                        <div class="node-labels" style={{display:"flex", gap:"4px", flexDirection:"column", marginLeft: "5px"}}>
            <div>
                ID: <span class="label-id">{functionList[index].id}</span>
            </div>
            <div>
                Type: <span class="label-type">{functionList[index].type}</span>
            </div>
            <div>
                Image: <span class="label-type">{functionList[index].service ? `${functionList[index].service}` : ""}
                                {functionList[index].image ? `${functionList[index].image}` : ""}
                                {functionList[index].workflow ? `${functionList[index].workflow}` : ""}</span>
            </div>
        </div>

                        {/* <div style={{ marginLeft: "5px" }}>
                            <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", justifyContent: "space-between" }}>
                                <span style={{ whiteSpace: "pre-wrap", cursor: "move", fontSize: "13px" }}>
                                    ID: {functionList[index].id}
                                </span>
                                <div style={{ whiteSpace: "pre-wrap", cursor: "pointer", fontSize: "11px", paddingRight: "3px" }}>
                                    Edit
                                </div>
                            </div>
                            <div style={{ fontSize: "10px", lineHeight: "10px", paddingTop: "2px" }}>
                                Type: {functionList[index].type}
                            </div>
                            <div style={{ fontSize: "10px", lineHeight: "10px", paddingTop: "2px" }}>
                                
                            </div>
                        </div> */}

                    </div>
                </div>
            </CellMeasurer>
        );
    }

    return (
        <>
            <Modal
                style={{ justifyContent: "center" }}
                className="run-workflow-modal"
                modalStyle={{ color: "black" }}
                title={`Create Function`}
                onClose={() => {
                    setFormData({})
                }}
                requiredFields={[
                    // checkFunctionList(),
                ]}
                actionButtons={[
                    ButtonDefinition("Create Function", async () => {
                        newFunctionFormRef.click()

                        // Check if form data is valid
                        if (!validate(formData)) {
                            throw Error("Invalid Function")
                        }

                        // Throw error if id already exists
                        const result = functionList.filter(functionItem => functionItem.id === formData.id)
                        if (result.length > 0) {
                            throw Error(`Function '${formData.id}' already exists`)
                        }

                        // Update list
                        setFunctionList((oldfList) => {
                            oldfList.push(formData)
                            return [...oldfList]
                        })
                    }, "small blue", () => { }, true, false, true),
                    ButtonDefinition("Cancel", async () => {
                    }, "small light", () => { }, true, false)
                ]}
                button={(
                    <div className={`btn function-btn`}>
                        New function
                    </div>

                )}
            >
                <FlexBox className="col" style={{ height: "45vh", width: "35vw", minWidth: "250px", minHeight: "200px", justifyContent: "space-between" }}>
                    <div style={{ overflow: "auto" }}>
                        {/* <label style={{fontSize: "11px", lineHeight: "13px", fontWeight: "bold"}}>
                            Choose Function Type*
                        </label>
                        <p style={{fontSize: "9px", lineHeight: "12px", margin: "0px 0px 4px 0px"}}>
                            Function type of new service
                        </p>
                        <select style={{width:"100%"}} defaultValue={newServiceType} onChange={(e)=>setNewServiceType(e.target.value)} style={{marginBottom:"4px", height:"26px", lineHeight:"20px", padding:"0px"}}>
                            <option value="reusable">Reusable</option>
                            <option value="knative-namespace">Namespace Service</option>
                            <option value="knative-global">Global Service</option>
                            <option value="subflow">Subflow</option>
                        </select> */}

                        <Form
                            id={"builder-form"}
                            onSubmit={(form) => {
                            }}
                            schema={schema}
                            formData={formData}
                            onChange={(e) => {
                                setFormData(e.formData)
                            }}
                        >
                            <button ref={setNewFunctionFormRef} style={{ display: "none" }} />
                        </Form>
                    </div>
                    {/* <div style={{minWidth: "28px"}}>
                        <div className="btn" onClick={()=>{
                            console.log(newFunctionFormRef.click())
                        }}>
                            Create Function
                        </div>
                    </div> */}

                </FlexBox>
            </Modal>
            {functionList.length > 0 ? (
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            width={width}
                            height={height}
                            rowRenderer={rowRenderer}
                            deferredMeasurementCache={cache}
                            scrollToIndex={0}
                            rowCount={functionList.length}
                            rowHeight={84}
                            scrollToAlignment={"start"}
                        />
                    )}
                </AutoSizer>)
                :
                (<>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        No functions
                    </div>
                </>)}
        </>
    )
}

export default function DiagramEditor(props) {
    const { workflow, namespace, updateWorkflow } = props

    const [diagramEditor, setDiagramEditor] = useState(null);
    const [load, setLoad] = useState(true);

    const [selectedNode, setSelectedNode] = useState(null);
    const [formRef, setFormRef] = useState(null);
    const [error, setError] = useState(null)

    const [actionDrawerWidth, setActionDrawerWidth] = useState(0)
    const [actionDrawerWidthOld, setActionDrawerWidthOld] = useState(200)
    const [actionDrawerMinWidth, setActionDrawerMinWidth] = useState(0)

    const [functionDrawerWidth, setFunctionDrawerWidth] = useState(0)
    const [functionDrawerMinWidth, setFunctionDrawerMinWidth] = useState(0)
    const [functionList, setFunctionList] = useState([])

    const [nodeDetailsVisible, setNodeDetailsVisible] = useState(false)
    const [selectedNodeFormData, setSelectedNodeFormData] = useState({})
    const [oldSelectedNodeFormData, setOldSelectedNodeFormData] = useState({})
    const [selectedNodeSchema, setSelectedNodeSchema] = useState({})

    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuAnchorPoint, setContextMenuAnchorPoint] = useState({ x: 0, y: 0 });
    const [contextMenuResults, setContextMenuResults] = useState(ActionsNodes)

    useEffect(() => {
        if (selectedNode) {
            // Update Selected Schema
            setSelectedNodeSchema(GetSchema(selectedNode.data.schemaKey, functionList))
        }
    }, [selectedNode, functionList])

    useEffect(() => {
        var id = document.getElementById("drawflow");
        // if (!diagramEditor) {
        let editor = new Drawflow(id)
        editor.start()
        editor.on('nodeSelected', function (id) {
            const node = editor.getNodeFromId(id)
            setSelectedNode(node)
            setSelectedNodeFormData(node.data.formData)
            setOldSelectedNodeFormData(node.data.formData)
        })

        editor.on('nodeCreated', function (id) {
            let node = editor.getNodeFromId(id)

            // If node was created without id, geneate one
            if (!node.data.id) {
                node.data.id = `node-${id}-${node.data.type}`
                editor.updateNodeDataFromId(id, node.data)
            }
        })

        editor.on('nodeUnselected', function (e) {
            setSelectedNode(null)
        })

        editor.on('nodeRemoved', function (e) {
            setSelectedNode(null)
        })

        editor.on('mouseUp', function (e) {
            // Handlers for mouse up on flowchart
            if (e && e.target && e.target.id) {
                switch (e.target.id) {
                    case "node-btn":
                        // Edit button was clicked on node
                        // We can assume that a node is selected
                        setNodeDetailsVisible(true)
                        break;
                    default:
                        break;
                }
            }
        })

        setDiagramEditor(editor)
    }, [])

    // Import if diagram editor is mounted and workflow was passed in props
    useEffect(() => {
        if (diagramEditor && workflow) {
            if (load) {
                importFromYAML(diagramEditor, setFunctionList, workflow)
            }
            setLoad(false)
        }
    }, [diagramEditor, workflow, load])

    const resizeStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column",
        background: "#f0f0f0",
        zIndex: 30,
    };

    // Update Context Menu results
    useEffect(() => {
        if (!showContextMenu) {
            setContextMenuResults(ActionsNodes)
        }
    }, [showContextMenu]);


    // Hide Context Menu if user clicks somewhere else
    // FIXME: Might cause problems for users who try to click on context-menu searchbar
    const handleClick = useCallback(() => (showContextMenu ? setShowContextMenu(false) : null), [showContextMenu]);
    useEffect(() => {
        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        };
    });

    return (
        <>
            {showContextMenu ? (
                <div
                    id='context-menu'
                    className="context-menu"
                    style={{
                        top: contextMenuAnchorPoint.y,
                        left: contextMenuAnchorPoint.x
                    }}
                >
                    <div style={{ textAlign: "center", padding: "2px" }}>
                        Add Node
                    </div>
                    <input autoFocus type="search" id="fname" name="fname" onChange={(ev) => {
                        console.log("ev search = ", ev.target.value)
                        setContextMenuResults(actionsNodesFuse.search(ev.target.value))
                        console.log(contextMenuResults)
                    }}
                        onKeyDown={(ev) => {
                            if (ev.key === 'Enter' && contextMenuResults.length > 0) {
                                const newNode = contextMenuResults[0].item ? contextMenuResults[0].item : contextMenuResults[0]
                                CreateNode(diagramEditor, newNode, contextMenuAnchorPoint.x, contextMenuAnchorPoint.y)
                                setShowContextMenu(false)

                            }
                        }}
                    ></input>
                    <ul >
                        {
                            contextMenuResults.map((obj) => {
                                return (
                                    <li onClick={() => {
                                        const newNode = obj.item ? obj.item : obj
                                        CreateNode(diagramEditor, newNode, contextMenuAnchorPoint.x, contextMenuAnchorPoint.y)
                                        setShowContextMenu(false)
                                    }}>
                                        {obj.name ? obj.name : obj.item.name}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            ) : (
                <> </>
            )}
            <FlexBox id="builder-page" className="col" style={{ paddingRight: "8px" }}>
                {error ?
                    <Alert className="critical" style={{ flex: "0" }}>{error} </Alert>
                    :
                    <></>
                }
                {/* <div style={{height:"600px", width: "600px"}}> */}
                <div className='toolbar'>
                    <div className='toolbar-btn' onClick={() => {
                        setError(null)
                        //TODO: Split into another function
                        //TODO: Export to non-destructive json ✓
                        let rawExport = diagramEditor.export()
                        let rawData = rawExport.drawflow.Home.data
                        let wfData = { functions: functionList, states: [] }
                        //TODO: 
                        // - Find Start Block ✓
                        // - Check if there are multiple start blocks
                        const startBlockIDs = diagramEditor.getNodesFromName("StartBlock")
                        let startBlock = rawData[startBlockIDs[0]];
                        let startState

                        // Find Start State
                        for (const outputID in startBlock.outputs) {
                            if (Object.hasOwnProperty.call(startBlock.outputs, outputID)) {
                                const output = startBlock.outputs[outputID];
                                console.log("--> Found output = ", output)
                                // TODO: handle to connections in start
                                console.log("output.connections = ", output.connections)
                                if (output.connections.length === 0) {
                                    setError("Start Node is not connected to any node")
                                    return
                                }
                                startState = rawData[output.connections[0].node]
                                console.log("--> Found startState = ", startState)
                                break
                            }
                        }

                        // Set Transitions
                        console.log(" rawData = ", rawData)
                        setConnections(startState.id, startBlock.id, null, rawData, wfData)
                        wfData.states.reverse()

                        console.log("wfData = ", wfData)
                        console.log("---- Workflow ---")
                        console.log(YAML.stringify(wfData))

                        if (updateWorkflow) {
                            updateWorkflow(wfData)
                        } else {
                            console.warn("updateWorkflow callback missing")
                        }
                    }}>
                        <VscGear style={{ fontSize: "256px", width: "48px" }} />
                        <div>Compile</div>
                    </div>
                    <div className='toolbar-btn' onClick={() => {
                        if (actionDrawerMinWidth === 0) {
                            setActionDrawerMinWidth(20)
                            setActionDrawerWidth(actionDrawerWidthOld)

                            // Hide Functions
                            setFunctionDrawerMinWidth(0)
                            setFunctionDrawerWidth(0)
                        } else {
                            setActionDrawerMinWidth(0)
                            setActionDrawerWidth(0)
                        }
                    }}>
                        {actionDrawerMinWidth === 0 ?
                            <>
                                <VscListUnordered style={{ fontSize: "256px", width: "48px" }} />
                                <div>Show Nodes</div>
                            </>
                            :
                            <>
                                <VscListUnordered style={{ fontSize: "256px", width: "48px" }} />
                                <div>Hide Nodes</div>
                            </>
                        }
                    </div>
                    <div className='toolbar-btn' onClick={() => {
                        if (functionDrawerMinWidth === 0) {
                            setFunctionDrawerMinWidth(20)
                            setFunctionDrawerWidth(actionDrawerWidthOld)

                            // Hide Node Actions
                            setActionDrawerMinWidth(0)
                            setActionDrawerWidth(0)
                        } else {
                            setFunctionDrawerMinWidth(0)
                            setFunctionDrawerWidth(0)
                        }
                    }}>
                        {actionDrawerMinWidth === 0 ?
                            <>
                                <VscSymbolEvent style={{ fontSize: "256px", width: "48px" }} />
                                <div>Show Functions</div>
                            </>
                            :
                            <>
                                <VscSymbolEvent style={{ fontSize: "256px", width: "48px" }} />
                                <div>Hide Functions</div>
                            </>
                        }
                    </div>
                </div>
                <FlexBox style={{ overflow: "hidden" }}>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            overflow: 'hidden',
                            position: "relative"
                        }}
                    >
                        <Resizable
                            style={{ ...resizeStyle, pointerEvents: actionDrawerWidth === 0 ? "none" : "", opacity: actionDrawerWidth === 0 ? 0 : 100 }}
                            size={{ width: actionDrawerWidth, height: "100%" }}
                            onResizeStop={(e, direction, ref, d) => {
                                setActionDrawerWidthOld(actionDrawerWidth + d.width)
                                setActionDrawerWidth(actionDrawerWidth + d.width)
                            }}
                            maxWidth="40%"
                            minWidth={actionDrawerMinWidth}
                        >
                            <div className={"panel left"} style={{ display: "flex" }}>
                                <div style={{ width: "100%", margin: "10px" }}>
                                    <Actions />
                                </div>

                            </div>
                        </Resizable>
                        <Resizable
                            style={{ ...resizeStyle, pointerEvents: functionDrawerWidth === 0 ? "none" : "", opacity: functionDrawerWidth === 0 ? 0 : 100 }}
                            size={{ width: functionDrawerWidth, height: "100%" }}
                            onResizeStop={(e, direction, ref, d) => {
                                setActionDrawerWidthOld(functionDrawerWidth + d.width)
                                setFunctionDrawerWidth(functionDrawerWidth + d.width)
                            }}
                            maxWidth="40%"
                            minWidth={functionDrawerMinWidth}
                        >
                            <div className={"panel left"} style={{ display: "flex" }}>
                                <div style={{ width: "100%", margin: "10px" }}>
                                    <FunctionsList functionList={functionList} setFunctionList={setFunctionList} namespace={namespace} />
                                </div>
                            </div>
                        </Resizable>
                        <div id="drawflow" style={{ height: "100%", width: "100%" }}
                            onDragOver={(ev)=>{
                                ev.preventDefault();
                            }}
                            onDrop={(ev) => {
                                console.log("on drop event tirggered")
                                ev.preventDefault();
                                const nodeIndex = ev.dataTransfer.getData("nodeIndex");
                                const functionIndex = ev.dataTransfer.getData("functionIndex");
                                var newNode;

                                // Select NodeStateAction if function was dropped to quick create node
                                if (functionIndex !== "") {
                                    newNode = NodeStateAction
                                    newNode.data.formData = {
                                        action: {
                                            function: functionList[functionIndex].id
                                        }
                                    }
                                } else {
                                    newNode = ActionsNodes[nodeIndex]
                                }

                                CreateNode(diagramEditor, newNode, ev.clientX, ev.clientY)
                            }}
                            onContextMenu={(ev) => {
                                ev.preventDefault()
                                setContextMenuAnchorPoint({ x: ev.pageX, y: ev.pageY })
                                setShowContextMenu(true)
                            }}
                        >
                        </div>
                        <ModalHeadless
                            visible={nodeDetailsVisible}
                            setVisible={setNodeDetailsVisible}
                            title={`TODO:`}
                            actionButtons={[
                                ButtonDefinition("Submit", () => {
                                    formRef.click()
                                    const ajv = new Ajv()
                                    const validate = ajv.compile(selectedNodeSchema)

                                    // Check if form data is valid
                                    if (!validate(selectedNodeFormData)) {
                                        throw Error("Invalid Values")
                                    }

                                    const updatedNode = {
                                        ...selectedNode,
                                        data: {
                                        ...selectedNode.data,
                                        formData: selectedNodeFormData
                                    }}

                                    // Preflight custom formData
                                    DefaultValidateSubmitCallbackMap(selectedNodeFormData)

                                    // Update form data into node
                                    diagramEditor.updateNodeDataFromId(updatedNode.id, updatedNode.data)

                                    // Do Custom callback logic if it exists for data type
                                    let onSubmitCallback = onSubmitCallbackMap[updatedNode.name]
                                    if (onSubmitCallback) {
                                        onSubmitCallback(updatedNode.id, diagramEditor)
                                    } else {                                    
                                        // Update SelectedNode state to updated state
                                        setSelectedNode(updatedNode)
                                    }

                                    setOldSelectedNodeFormData(selectedNodeFormData)
                                }, "small light", () => { }, true, false),
                                ButtonDefinition("Cancel", async () => {
                                    setSelectedNodeFormData(oldSelectedNodeFormData)
                                }, "small light", () => { }, true, false)
                            ]}
                        >
                            <div style={{ flexDirection: "column", minWidth: "260px", width: "60vw", maxWidth: "640px" }}>
                                <Form
                                    id={"builder-form"}
                                    onSubmit={(form) => {}}
                                    schema={selectedNodeSchema}
                                    uiSchema={uiSchema}
                                    formData={selectedNodeFormData}
                                    onChange={(e) => {
                                        setSelectedNodeFormData(e.formData)
                                    }}
                                >
                                    <button ref={setFormRef} style={{ display: "none" }} />
                                </Form>
                            </div>
                        </ModalHeadless>

                    </div>
                </FlexBox>
                {/* </div> */}
            </FlexBox>
        </>
    )
}