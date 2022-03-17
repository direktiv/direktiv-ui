// COMMON

const CommonSchemaDefinitionConsumeEvent = {
    "type": "object",
    "title": "Event Definition",
    "description": "Event to consume.",
    "properties": {
        "type": {
            "type": "string",
            "title": "Type",
            "description": "CloudEvent type."
        },
        "context": {
            "type": "object",
            "title": "Context",
            "description": "Key value pairs for CloudEvent context values that must match.",
            "additionalProperties": {
                "type": "string"
            },
        }
    }
}

const CommonSchemaDefinitionTimeout = {
    "type": "string",
    "title": "Timeout",
    "description": "Duration to wait for action to complete (ISO8601)."
}

export const CommonSchemaDefinitionStateFields = {
    "transform": {
        "title": "Transform",
        "description": "jq command to transform the state's data output.",
        "type": "object",
        "properties": {
            "selectionType": {
                "enum": [
                    "JQ Query",
                    "Key Value",
                    "YAML"
                ],
                "default": "JQ Query"
            }
        },
        "allOf": [
            {
                "if": {
                    "properties": {
                        "selectionType": {
                            "const": "JQ Query"
                        }
                    }
                },
                "then": {
                    "properties": {
                        "jqQuery": {
                            "type": "string"
                        }
                    }
                }
            },
            {
                "if": {
                    "properties": {
                        "selectionType": {
                            "const": "YAML"
                        }
                    }
                },
                "then": {
                    "properties": {
                        "rawYAML": {
                            "title": "YAML",
                            "type": "string",
                            "description": "Raw YAML object representation of data.",
                        }
                    }
                }
            },
            {
                "if": {
                    "properties": {
                        "selectionType": {
                            "const": "Key Value"
                        }
                    }
                },
                "then": {
                    "properties": {
                        "keyValue": {
                            "type": "object",
                            "title": "Key Value",
                            "description": "Key Values representation of data.",
                            "additionalProperties": {
                                "type": "string"
                            },
                        }
                    }
                }
            }
        ]
    },
    "log": {
        "type": "string",
        "title": "Log",
        "description": "jq command to generate data for instance-logging."
    }
}


const CommonSchemaDefinitionRetry = {
    "type": "array",
    "title": "Retry Definition",
    "description": "Retry policy.",
    "maxItems": 1,
    "items": {
        "required": [
            "max_attempts",
            "codes"
        ],
        "properties": {
            "max_attempts": {
                "type": "number",
                "title": "Max Attempts",
                "description": "Maximum number of retry attempts."
            },
            "delay": {
                "type": "string",
                "title": "Delay",
                "description": "Time delay between retry attempts (ISO8601)."
            },
            "multiplier": {
                "type": "number",
                "title": "Multiplier",
                "description": "Value by which the delay is multiplied after each attempt."
            },
            "codes": {
                "type": "array",
                "title": "Codes",
                "minItems": 1,
                "description": "Regex patterns to specify which error codes to catch.",
                "items": {
                    "type": "string"
                }
            }
        }
    }
}

const CommonSchemaDefinitionAction = {
    "type": "object",
    "title": "Action Definition",
    "description": "Action to perform.",
    "properties": {
        "function": {
            "enum": [
            ],
            "type": "string",
            "title": "Function",
            "description": "Name of the referenced function.",
        },
        "input": {
            ...CommonSchemaDefinitionStateFields.transform,
            "title": "Input",
            "description": "jq command to generate the input for the action."
        },
        "secrets": {
            "type": "array",
            "title": "Secrets",
            "description": "List of secrets to temporarily add to the state data under .secrets before running the input jq command.",
            "items": {
                "type": "string"
            }
        },
        "retries": CommonSchemaDefinitionRetry
    }
}

// States

export const StateSchemaNoop = {
    "type": "object",
    "properties": {
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaConsumeEvent = {
    "type": "object",
    "required": [
        "event",
    ],
    "properties": {
        event: CommonSchemaDefinitionConsumeEvent,
        timeout: CommonSchemaDefinitionTimeout,
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaDelay = {
    "type": "object",
    "required": [
        "duration",
    ],
    "properties": {
        "duration": {
            "type": "string",
            "title": "Duration",
            "description": CommonSchemaDefinitionTimeout.description
        },
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaError = {
    "type": "object",
    "required": [
        "error",
        "message"
    ],
    "properties": {
        "error": {
            "type": "string",
            "title": "Error",
            "description": "Error code, catchable on a calling workflow.",
        },
        "message": {
            "type": "string",
            "title": "Message",
            "description": "Format string to provide more context to the error.",
        },
        "args": {
            "type": "string",
            "title": "Arguments",
            "description": "A list of jq commands to generate arguments for substitution in the message format string.",
        },
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaEventAnd = {
    "type": "object",
    "required": [
        "events",
    ],
    "properties": {
        "events": {
            "type": "array",
            "minItems": 1,
            "title": "Events",
            "description": "Events to consume.",
            "items": {
                "type": "object",
                "required": [
                    "event"
                ],
                "properties": {
                    "event": CommonSchemaDefinitionConsumeEvent,
                }
            }
        },
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaEventXor = {
    "type": "object",
    "required": [
        "events",
    ],
    "properties": {
        "events": {
            "type": "array",
            "minItems": 1,
            "title": "Events",
            "description": "Events to consume, and what to do based on which event was received.",
            "items": {
                "type": "object",
                "required": [
                    "event"
                ],
                "properties": {
                    "event": CommonSchemaDefinitionConsumeEvent,
                    "transform": CommonSchemaDefinitionStateFields.transform,
                }
            }
        },
        "log": CommonSchemaDefinitionStateFields.log,
    }
}

export const StateSchemaForeach = {
    "type": "object",
    "required": [
        "action",
        "args"
    ],
    "properties": {
        "array": {
            "type": "string",
            "title": "Array",
            "description": "jq command to produce an array of objects to loop through.",
        },
        "action": CommonSchemaDefinitionAction,
        "timeout": CommonSchemaDefinitionTimeout,
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaGenerateEvent = {
    "type": "object",
    "required": [
        "event",
    ],
    "properties": {
        "event": {
            "type": "object",
            "title": "Event Definition",
            "description": "Event to generate.",
            "required": [
                "type",
                "source"
            ],
            "properties": {
                "type": {
                    "type": "string",
                    "title": "Type",
                    "description": "CloudEvent type."
                },
                "source": {
                    "type": "string",
                    "title": "Source",
                    "description": "CloudEvent source."
                },
                "datacontenttype": {
                    "type": "string",
                    "title": "Data Content Type",
                    "description": "An RFC 2046 string specifying the payload content type."
                },
                "data": {
                    ...CommonSchemaDefinitionStateFields.transform,
                    "title": "Data",
                    "description": "Data to generate (payload) for the produced event."
                },
                "context": {
                    "type": "object",
                    "title": "Context",
                    "description": "Key value pairs for CloudEvent context values that must match.",
                    "additionalProperties": {
                        "type": "string"
                    },
                }
            }
        },
        ...CommonSchemaDefinitionStateFields
    }
}

export const StateSchemaGetter = {
    "type": "object",
    "required": [
        "variables"
    ],
    "properties": {
        "variables": {
            "type": "array",
            "title": "Variables",
            "description": "Variables to fetch.",
            "items": {
                "type": "object",
                "required": [
                    "key",
                    "scope"
                ],
                "properties": {
                    "key": {
                        "type": "string",
                        "title": "Key",
                        "description": "Variable name."
                    },
                    "scope": {
                        "title": "Scope",
                        "description": "Variable scope",
                        "enum": [
                            "workflow",
                            "instance",
                            "namespace"
                        ],
                        "default": "workflow"
                    },
                }
            }
        },
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaSetter = {
    "type": "object",
    "required": [
        "variables"
    ],
    "properties": {
        "variables": {
            "type": "array",
            "title": "Variables",
            "description": "Variables to push.",
            "items": {
                "type": "object",
                "required": [
                    "key",
                    "scope",
                    "value"
                ],
                "properties": {
                    "key": {
                        "type": "string",
                        "title": "Key",
                        "description": "Variable name."
                    },
                    "scope": {
                        "title": "Scope",
                        "description": "Variable scope",
                        "enum": [
                            "workflow",
                            "instance",
                            "namespace"
                        ],
                        "default": "workflow"
                    },
                    "value": {
                        ...CommonSchemaDefinitionStateFields.transform,
                        "title": "Value",
                        "description": "Value to generate variable value."
                    },
                    "mimeType": {
                        "type": "string",
                        "title": "Mime Type",
                        "description": "MimeType to store variable value as."
                    },
                }
            }
        },
        ...CommonSchemaDefinitionStateFields
    }
}

export const StateSchemaValidate = {
    "type": "object",
    "required": [
        "schema"
    ],
    "properties": {
        "subject": {
            "type": "string",
            "title": "Subject",
            "description": "jq command to select the subject of the schema validation. Defaults to '.' if unspecified."
        },
        "schema": {
            "type": "string",
            "title": "Schema",
            "description": "Name of the referenced state data schema."
        },
        ...CommonSchemaDefinitionStateFields,
    }
}


export const StateSchemaAction = {
    "type": "object",
    "properties": {
        "action": CommonSchemaDefinitionAction,
        "async": {
            "title": "Async",
            "description": "If workflow execution can continue without waiting for the action to return.",
            "type": "boolean"
        },
        "timeout": CommonSchemaDefinitionTimeout,
        ...CommonSchemaDefinitionStateFields,
    }
}

export const StateSchemaSwitch = {
    "type": "object",
    "required": [
        "conditions"
    ],
    "properties": {
        "conditions": {
            "type": "array",
            "minItems": 1,
            "title": "Conditions",
            "description": "Conditions to evaluate and determine which state to transition to next.",
            "items": {
                "type": "object",
                "required": [
                    "condition"
                ],
                "properties": {
                    "condition": {
                        "type": "string",
                        "title": "Condition",
                        "description": "jq command evaluated against state data. True if results are not empty."
                    },
                    "transform": {
                        "title": "Transform",
                        "description": "jq command to transform the state's data output.",
                        "type": "string"
                    }
                }
            }
        },
        "defaultTransform": {
            ...CommonSchemaDefinitionStateFields.transform,
            "title": "Default Transform",
            "descrtiption": "jq command to transform the state's data output."
        }
    }
}

// Special
const SpecialSchemaError = {
    "type": "array",
    "title": "Error Handling",
    "description": "Thrown erros will be compared against each Error in order until it finds a match.",
    "items": {
        "required": [
            "error"
        ],
        "properties": {
            "error": {
                "type": "string",
                "title": "Error",
                "description": "A glob pattern to test error codes for a match."
            }
        }
    }
}

// Functions Schemas
export const FunctionSchemaGlobal = {
    "type": "object",
    "required": [
        "id",
        "service"
    ],
    "properties": {
        "id": {
            "type": "string",
            "title": "ID",
            "description": "Function definition unique identifier."
        },
        "service": {
            "type": "string",
            "title": "Service",
            "description": "The service being referenced."
        },
        "files": {
            "type": "array",
            "minItems": 0,
            "title": "Files",
            "description": "Workflow file definition.",
            "items": {
                "type": "object",
                "required": [
                    "key"
                ],
                "properties": {
                    "key": {
                        "type": "string",
                        "title": "Key",
                        "description": "Key used to select variable."
                    },
                    "scope": {
                        "title": "Scope",
                        "description": "Scope used to select variable. Defaults to 'instance', but can be 'workflow' or 'namespace'.",
                        "type": "string"
                    },
                    "as": {
                        "title": "As",
                        "description": "Set the filename of the file. The default is the same as the key.",
                        "type": "string"
                    },
                    "type": {
                        "title": "Type",
                        "description": "How to treat the file. Options include 'plain', 'base64', 'tar', 'tar.gz'.",
                        "type": "string"
                    }
                }
            }
        },
    }
}

export const FunctionSchemaNamespace = {
    "type": "object",
    "required": [
        "id",
        "service"
    ],
    "properties": {
        "id": {
            "type": "string",
            "title": "ID",
            "description": "Function definition unique identifier."
        },
        "service": {
            "type": "string",
            "title": "Service",
            "description": "The service being referenced."
        },
        "files": {
            "type": "array",
            "minItems": 0,
            "title": "Files",
            "description": "Workflow file definition.",
            "items": {
                "type": "object",
                "required": [
                    "key"
                ],
                "properties": {
                    "key": {
                        "type": "string",
                        "title": "Key",
                        "description": "Key used to select variable."
                    },
                    "scope": {
                        "title": "Scope",
                        "description": "Scope used to select variable. Defaults to 'instance', but can be 'workflow' or 'namespace'.",
                        "type": "string"
                    },
                    "as": {
                        "title": "As",
                        "description": "Set the filename of the file. The default is the same as the key.",
                        "type": "string"
                    },
                    "type": {
                        "title": "Type",
                        "description": "How to treat the file. Options include 'plain', 'base64', 'tar', 'tar.gz'.",
                        "type": "string"
                    }
                }
            }
        },
    }
}

export const FunctionSchemaReusable = {
    "type": "object",
    "required": [
        "id",
        "image"
    ],
    "properties": {
        "id": {
            "type": "string",
            "title": "ID",
            "description": "Function definition unique identifier."
        },
        "image": {
            "type": "string",
            "title": "Image",
            "description": "Image URI.",
            "examples": [
                "direktiv/request",
                "direktiv/python",
                "direktiv/smtp-receiver",
                "direktiv/sql",
                "direktiv/image-watermark"
            ]
        },
        "cmd": {
            "type": "string",
            "title": "CMD",
            "description": "Command to run in container"
        },
        "size": {
            "type": "string",
            "title": "Size",
            "description": "Size of virtual machine"
        },
        "scale": {
            "type": "integer",
            "title": "Scale",
            "description": "Minimum number of instances"
        },
        "files": {
            "type": "array",
            "minItems": 0,
            "title": "Files",
            "description": "Workflow file definition.",
            "items": {
                "type": "object",
                "required": [
                    "key"
                ],
                "properties": {
                    "key": {
                        "type": "string",
                        "title": "Key",
                        "description": "Key used to select variable."
                    },
                    "scope": {
                        "title": "Scope",
                        "description": "Scope used to select variable. Defaults to 'instance', but can be 'workflow' or 'namespace'.",
                        "type": "string"
                    },
                    "as": {
                        "title": "As",
                        "description": "Set the filename of the file. The default is the same as the key.",
                        "type": "string"
                    },
                    "type": {
                        "title": "Type",
                        "description": "How to treat the file. Options include 'plain', 'base64', 'tar', 'tar.gz'.",
                        "type": "string"
                    }
                }
            }
        },
    }
}

export const FunctionSchemaSubflow = {
    "type": "object",
    "required": [
        "id",
        "workflow"
    ],
    "properties": {
        "id": {
            "type": "string",
            "title": "ID",
            "description": "Function definition unique identifier."
        },
        "workflow": {
            "type": "string",
            "title": "Workflow",
            "description": "ID of workflow within the same namespace."
        }
    }
}

export function GenerateFunctionSchemaWithEnum(namespaceServices, globalServices) {
    let nsFuncSchema = FunctionSchemaNamespace
    let globalFuncSchema = FunctionSchemaGlobal
    // console.log("namespaceServices = ", namespaceServices)
    // console.log("globalServices = ", globalServices)

    if (nsFuncSchema && nsFuncSchema.length > 0) {
        nsFuncSchema.properties.service.enum = namespaceServices
    }

    if (globalServices && globalServices.length > 0) {
        globalFuncSchema.properties.service.enum = globalServices

    }

    return {
        "type": "object",
        "required": [
            "type"
        ],
        "properties": {
            "type": {
                "enum": [
                    "reusable",
                    "knative-namespace",
                    "knative-global",
                    "subflow"
                ],
                "default": "reusable",
                "title": "Service Type",
                "description": "Function type of new service"
            }
        },
        "allOf": [
            {
                "if": {
                    "properties": {
                        "type": {
                            "const": "reusable"
                        }
                    }
                },
                "then": FunctionSchemaReusable
            },
            {
                "if": {
                    "properties": {
                        "type": {
                            "const": "knative-namespace"
                        }
                    }
                },
                "then": nsFuncSchema
            },
            {
                "if": {
                    "properties": {
                        "type": {
                            "const": "knative-global"
                        }
                    }
                },
                "then": globalFuncSchema
            },
            {
                "if": {
                    "properties": {
                        "type": {
                            "const": "subflow"
                        }
                    }
                },
                "then": FunctionSchemaSubflow
            }
        ]
    }
}

export const FunctionSchema = {
    "type": "object",
    "required": [
        "type"
    ],
    "properties": {
        "type": {
            "enum": [
                "reusable",
                "knative-namespace",
                "knative-global",
                "subflow"
            ],
            "default": "reusable",
            "title": "Service Type",
            "description": "Function type of new service"
        }
    },
    "allOf": [
        {
            "if": {
                "properties": {
                    "type": {
                        "const": "reusable"
                    }
                }
            },
            "then": FunctionSchemaReusable
        },
        {
            "if": {
                "properties": {
                    "type": {
                        "const": "knative-namespace"
                    }
                }
            },
            "then": FunctionSchemaNamespace
        },
        {
            "if": {
                "properties": {
                    "type": {
                        "const": "knative-global"
                    }
                }
            },
            "then": FunctionSchemaGlobal
        },
        {
            "if": {
                "properties": {
                    "type": {
                        "const": "subflow"
                    }
                }
            },
            "then": FunctionSchemaSubflow
        }
    ]
}



// Map to all Schemas
export const SchemaMap = {
    // States
    "stateSchemaNoop": StateSchemaNoop,
    "stateSchemaAction": StateSchemaAction,
    "stateSchemaSwitch": StateSchemaSwitch,
    "stateSchemaConsumeEvent": StateSchemaConsumeEvent,
    "stateSchemaDelay": StateSchemaDelay,
    "stateSchemaError": StateSchemaError,
    "stateSchemaEventAnd": StateSchemaEventAnd,
    "stateSchemaEventXor": StateSchemaEventXor,
    "stateSchemaForeach": StateSchemaForeach,
    "stateSchemaGenerateEvent": StateSchemaGenerateEvent,
    "stateSchemaGetter": StateSchemaGetter,
    "stateSchemaSetter": StateSchemaSetter,
    "stateSchemaValidate": StateSchemaValidate,

    // Functions
    "functionSchemaGlobal": FunctionSchemaGlobal,
    "functionSchemaNamespace": FunctionSchemaNamespace,
    "functionSchemaReusable": FunctionSchemaReusable,
    "functionSchemaSubflow": FunctionSchemaSubflow,
    "functionSchema": FunctionSchema,

    // Special
    "specialSchemaError": SpecialSchemaError,
}

export function GetSchema(schemaKey, functionList, varList) {
    let selectedSchema = SchemaMap[schemaKey]
    if (schemaKey !== "stateSchemaAction") {
        return selectedSchema
    }

    let availableFunctions = []
    for (let i = 0; i < functionList.length; i++) {
        const f = functionList[i];
        availableFunctions.push(f.id)
    }

    selectedSchema.properties.action.properties.function.enum = availableFunctions
    return selectedSchema
}


