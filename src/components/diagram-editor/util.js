import YAML from 'js-yaml'

//  processTransform : Converts json schema form to direktiv yaml on the properties that accept jq.
//  Because we support both a jq string a key value json schema input, we need to process these values into
//  something direkitv yaml can use. 
//
//  stateData: The parent of a value that contains a jqQuery or key value property
//  transformKey: The key of the property that contains this value. This will usually be 'transform'
//  but there are some scenarios where it is something else. e.g. "data" from generateEvent
function processTransform(stateData, transformKey) {
    if (!stateData || !stateData[transformKey]) {
        return
    }

    const selectionType = stateData[transformKey]["selectionType"]
    const keyValue = stateData[transformKey]["keyValue"] ? stateData[transformKey]["keyValue"] : {}
    const jqQuery = stateData[transformKey]["jqQuery"] ? stateData[transformKey]["jqQuery"] : ""
    const rawYAML = stateData[transformKey]["rawYAML"] ? stateData[transformKey]["rawYAML"] : ""
    console.log("stateData[transformKey] = ", stateData[transformKey])
    
    delete stateData[transformKey]["keyValue"]
    delete stateData[transformKey]["jqQuery"]
    delete stateData[transformKey]["selectionType"]
    delete stateData[transformKey]["rawYAML"]

    if (selectionType && selectionType === "Key Value") {
        stateData[transformKey] = {...keyValue}
    }   else if (selectionType && selectionType === "YAML") {
        stateData[transformKey] = YAML.load(rawYAML)
    } else if (selectionType && selectionType === "JQ Query") {
        stateData[transformKey] = jqQuery
    }

    if (stateData[transformKey] === "" || stateData[transformKey] === {}){
        delete stateData[transformKey]
    }
    
    return
}

function processArrayToObject(stateData, objectKey) {
    if (!stateData || !stateData[objectKey]) {
        return
    }

    const oldArray = stateData[objectKey]
    if (!oldArray || !Array.isArray(oldArray) || oldArray.length <= 0) {
        delete stateData[objectKey]
    } else if (Array.isArray(oldArray)) {
        delete stateData[objectKey]

        stateData[objectKey] = {...oldArray[0]}
    }
    
    return
}

// Recursively walk through nodes and sets transitions of each state
export function setConnections(nodeID, previousNodeID, previousState, rawData, wfData) {

    // Stop recursive walk if previous node is not first connections
    // If we dont do this we'll there is a chance that we create the same state multiple times
    if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
        return
    }

    // Use Custom connection callback logic if it exists for data type
    console.log("rawData[nodeID].name = ", rawData[nodeID].name)
    let currentNode = rawData[nodeID]
    let connCallback = connectionsCallbackMap[currentNode.name]
    if (connCallback) {
        connCallback(nodeID, previousNodeID, previousState, rawData, wfData)
        return
    }



    let state = { id: currentNode.data.id, type: currentNode.data.type, ...currentNode.data.formData }
    processTransform(state, "transform")

    // Default connections logic
    processConnection(nodeID, rawData, state, wfData)

    return
}

// default handler for connections
function processConnection(nodeID, rawData, state, wfData) {
    const currentNode = rawData[nodeID]
    const outputKeys = Object.keys(rawData[nodeID].outputs)
    
    // Default connections logic
    for (let i = 0; i < outputKeys.length; i++) {
        const outputID = outputKeys[i];

        if (Object.hasOwnProperty.call(currentNode.outputs, outputID)) {
            const output = currentNode.outputs[outputID];
            if (output.connections.length > 0) {
                console.log("output.connections = ", output.connections)
                const nextNode = rawData[output.connections[0].node]

                // Only use first node output connection for transition
                if (i === 0){
                    state.transition = nextNode.data.id
                }

                setConnections(output.connections[0].node, nodeID, state, rawData, wfData)
            }
        }
    }

    wfData.states.push(state)
}

// connectionsCallbackMap : Map of functions to be used in setConnections function
const connectionsCallbackMap = {
    "ErrorBlock": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        let stateCatch = rawData[nodeID].data.formData
        const outputKeys = Object.keys(rawData[nodeID].outputs)

        // Add transitions to catched errors if connections are set
        for (let i = 0; i < outputKeys.length; i++) {
            const outputID = outputKeys[i];
            
            if (Object.hasOwnProperty.call(rawData[nodeID].outputs, outputID)) {
                const output = rawData[nodeID].outputs[outputID];
                if (output.connections.length > 0) {
                    const nextNode = rawData[output.connections[0].node]
                    stateCatch[i].transition = nextNode.data.id
                }
            }

        }

        previousState.catch = stateCatch

        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        console.log("outputKeys = ", outputKeys)
        console.log("rawData[nodeID] = ", rawData[nodeID])
        for (let i = 0; i < outputKeys.length; i++) {
            const outputID = outputKeys[i];
            if (Object.hasOwnProperty.call(rawData[nodeID].outputs, outputID)) {
                const output = rawData[nodeID].outputs[outputID];
                console.log("output = ", output)

                if (output.connections.length > 0) {
                    setConnections(output.connections[0].node, nodeID, previousState, rawData, wfData)
                }
            }

        }


    },
    "StateSwitch": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        let state = { id: rawData[nodeID].data.id, type: rawData[nodeID].data.type, ...rawData[nodeID].data.formData }
        processTransform(state, "transform")

        const outputKeys = Object.keys(rawData[nodeID].outputs)
        for (let i = 0; i < outputKeys.length; i++) {
            const outputID = outputKeys[i];

            if (Object.hasOwnProperty.call(rawData[nodeID].outputs, outputID)) {
                const output = rawData[nodeID].outputs[outputID];
                if (output.connections.length > 0) {
                    const nextNode = rawData[output.connections[0].node]

                    if (i === 0) {
                        // First Node Connection
                        state.defaultTransition = nextNode.data.id
                    } else if (i > 1) {
                        // Skip Second node connection because of error catcher
                        state.conditions[i - 2].transition = nextNode.data.id
                    }

                    // FIXME: Is this right???
                    setConnections(output.connections[0].node, nodeID, state, rawData, wfData)
                }
            }

        }

        wfData.states.push(state)
    },
    "StateEventXor": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        let state = { id: rawData[nodeID].data.id, type: rawData[nodeID].data.type, ...rawData[nodeID].data.formData }

        for (let i = 0; i < state.events.length; i++) {
            processTransform(state.events[i], "transform")
        }

        const outputKeys = Object.keys(rawData[nodeID].outputs)
        for (let i = 0; i < outputKeys.length; i++) {
            const outputID = outputKeys[i];

            if (Object.hasOwnProperty.call(rawData[nodeID].outputs, outputID)) {
                const nodeOutput = rawData[nodeID].outputs[outputID];
                if (nodeOutput.connections.length > 0) {
                    // skip first node connection (error catcher)
                    if (i > 0) {
                        const nextNode = rawData[nodeOutput.connections[0].node]
                        state.events[i].transition = nextNode.data.id
                    }

                    setConnections(nodeOutput.connections[0].node, nodeID, state, rawData, wfData)
                }
            }

        }

        wfData.states.push(state)
    },
    "StateGenerateEvent": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        let state = { id: rawData[nodeID].data.id, type: rawData[nodeID].data.type, ...rawData[nodeID].data.formData }

        console.log("state.event.data = ", state.event)
        processTransform(state.event, "data")
        processTransform(state, "transform")

        // Default connections logic
        processConnection(nodeID, rawData, state, wfData)
    },
    "StateSetter": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        let state = { id: rawData[nodeID].data.id, type: rawData[nodeID].data.type, ...rawData[nodeID].data.formData }

        for (let i = 0; i < state.variables.length; i++) {
            processTransform(state.variables[i], "value")
        }

        processTransform(state, "transform")

        // Default connections logic
        processConnection(nodeID, rawData, state, wfData)
    },
    "StateAction": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        let state = { id: rawData[nodeID].data.id, type: rawData[nodeID].data.type, ...rawData[nodeID].data.formData }

        processArrayToObject(state.action, "retries")
        processTransform(state.action, "input")
        processTransform(state, "transform")

        // Default connections logic
        processConnection(nodeID, rawData, state, wfData)
    },
    "StateForeach": (nodeID, previousNodeID, previousState, rawData, wfData) => {
        // Stop recursive walk if previous node is not first connections
        // If we dont do this we'll there is a chance that we create the same state multiple times
        if (!isFirstConnection(nodeID, previousNodeID, rawData)) {
            return
        }

        let state = { id: rawData[nodeID].data.id, type: rawData[nodeID].data.type, ...rawData[nodeID].data.formData }

        processArrayToObject(state.action, "retries")
        processTransform(state.action, "input")
        processTransform(state, "transform")

        // Default connections logic
        processConnection(nodeID, rawData, state, wfData)
    }
}

// isFirstConnection : Returns true if the previous node is the current nodes first connection
function isFirstConnection(nodeID, previousNodeID, rawData) {
    return (rawData[nodeID].inputs["input_1"].connections[0].node === `${previousNodeID}`)
}

export function DefaultValidateSubmitCallbackMap(formData) {
    console.log("formData.transform = ", formData.transform)
    if (formData.transform && formData.transform.selectionType === "YAML" && formData.transform.rawYAML !== "") {
        try {
            console.log("attempting to load yaml")
            let test = YAML.load(formData.transform.rawYAML)
            console.log("attempting to load yaml post = ", test)
        } catch (e) {
            console.log("FAILED TO LOAD YAML = ", e)
        }
    }
}

export const onValidateSubmitCallbackMap = {
    "Default": DefaultValidateSubmitCallbackMap
}

export const onSubmitCallbackMap = {
    "StateSwitch": (nodeID, diagramEditor) => {
        const node = diagramEditor.getNodeFromId(nodeID)
        let conditionsLength = node.data.formData.conditions ? node.data.formData.conditions.length : 0
        // outputLen : Is the outputs minus the error and default transition outputs
        const outputLen = Object.keys(node.outputs).length - 2

        // Add Missing Node Outputs
        for (let i = outputLen; i < conditionsLength; i++) {
            diagramEditor.addNodeOutput(node.id)
        }

        // Remove excess node outputs
        for (let i = conditionsLength; i < outputLen; i++) {
            diagramEditor.removeNodeOutput(node.id, `output_${i + 2}`)
        }
        
    },
    "StateEventXor": (nodeID, diagramEditor) => {
        const node = diagramEditor.getNodeFromId(nodeID)
        let eventsLength = node.data.formData.events ? node.data.formData.events.length : 0
        const outputLen = Object.keys(node.outputs).length - 1

        // Add Missing Node Outputs
        for (let i = outputLen; i < eventsLength; i++) {
            diagramEditor.addNodeOutput(node.id)
        }

        // Remove excess node outputs
        for (let i = eventsLength; i < outputLen; i++) {
            diagramEditor.removeNodeOutput(node.id, `output_${i + 1}`)
        }
        
    },
    "ErrorBlock": (nodeID, diagramEditor) => {
        const node = diagramEditor.getNodeFromId(nodeID)
        let errorsLength = node.data.formData ? node.data.formData.length : 0
        const outputLen = Object.keys(node.outputs).length

        // Add Missing Node Outputs
        for (let i = outputLen; i < errorsLength; i++) {
            diagramEditor.addNodeOutput(node.id)
        }

        // Remove excess node outputs
        for (let i = errorsLength; i < outputLen; i++) {
            diagramEditor.removeNodeOutput(node.id, `output_${i}`)
        }
        
    }
}


export function CreateNode(diagramEditor, node, clientX, clientY) {
    var newNodeHTML
    const posX = clientX * (diagramEditor.precanvas.clientWidth / (diagramEditor.precanvas.clientWidth * diagramEditor.zoom)) - (diagramEditor.precanvas.getBoundingClientRect().x * (diagramEditor.precanvas.clientWidth / (diagramEditor.precanvas.clientWidth * diagramEditor.zoom)));
    const posY = clientY * (diagramEditor.precanvas.clientHeight / (diagramEditor.precanvas.clientHeight * diagramEditor.zoom)) - (diagramEditor.precanvas.getBoundingClientRect().y * (diagramEditor.precanvas.clientHeight / (diagramEditor.precanvas.clientHeight * diagramEditor.zoom)));

    // Generate HTML
    switch (node.family) {
        case "special":
            newNodeHTML = `<div class="node-labels">
            <div>
                <span class="label-type">${node.html}</span>
            </div>
        </div>`
            break;
        case "primitive":
            newNodeHTML = `<div class="node-labels">
            <div>
                ID: <input class="label-id" type="text" df-id>
            </div>
            <div>
                Type: <span class="label-type">${node.html}</span>
            </div>
        </div>`
            break
        default:
            newNodeHTML = `<div class="node-labels">
            <div>
                <span class="label-type">${node.html}</span>
            </div>
        </div>`
            break;
    }

    // Add Action to HTML
    if (node.info.actions) {
        newNodeHTML += `
    <div class="node-actions">
        <span id="node-btn" class="node-btn">
            ...
        </span>
    </div>`
    }


    diagramEditor.addNode(node.name, node.connections.input, node.connections.output, posX, posY, `node ${node.family} type-${node.type}`, { family: node.family, type: node.type, ...node.data }, newNodeHTML, false)
}