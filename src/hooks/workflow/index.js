import * as React from "react";
import {
  ExtractQueryString,
  genericEventSourceErrorHandler,
  HandleError,
  SanitizePath,
  STATE,
  StateReducer,
  useEventSourceCleaner,
  useQueryString,
  apiKeyHeaders,
} from "../util";
import { EventSourcePolyfill } from "event-source-polyfill";
import fetch from "isomorphic-fetch";

/*
    useWorkflows is a react hook which returns a list of items, createDirectory, createWorkflow, deleteDirectory, deleteWorkflow
    takes:
      - url to direktiv api http://x/api/
      - stream to use sse or a normal fetch
      - namespace the namespace to send the requests to
      - path to the workflow you want to change
      - apikey to provide authentication of an apikey
*/
export const useDirektivWorkflow = (
  url,
  stream,
  namespace,
  path,
  apikey,
  ...queryParameters
) => {
  const [data, dispatchData] = React.useReducer(StateReducer, null);
  const [err, setErr] = React.useState(null);
  const [eventSource, setEventSource] = React.useState(null);
  useEventSourceCleaner(eventSource, "useDirektivWorkflow");

  // Store Query parameters
  const { queryString } = useQueryString(false, queryParameters);
  const [pathString, setPathString] = React.useState(null);

  // Stream Event Source Data Dispatch Handler
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (stream && pathString !== null) {
        // setup event listener
        const listener = new EventSourcePolyfill(`${pathString}${queryString}`, {
          headers: apiKeyHeaders(apikey),
        });

        listener.onerror = (e) => {
          genericEventSourceErrorHandler(e, setErr);
        };

        async function readData(e) {
          if (e.data === "") {
            return;
          }

          const json = JSON.parse(e.data);
          dispatchData({
            type: STATE.UPDATE,
            data: json,
          });
        }

        listener.onmessage = (e) => readData(e);
        setEventSource(listener);
      } else {
        setEventSource(null);
      }
    }, 50);

    return () => {
      clearTimeout(handler);
    };
  }, [stream, queryString, pathString, apikey]);

  const getWorkflow = React.useCallback(
    async (...queryParameters) => {
      const uri = `${url}namespaces/${namespace}/tree/${path}`;
      const resp = await fetch(
        `${uri}/${ExtractQueryString(false, ...queryParameters)}`,
        {
          headers: apiKeyHeaders(apikey),
        }
      );
      if (resp.ok) {
        return await resp.json();
      } else {
        throw new Error(await HandleError("get node", resp, "listNodes"));
      }
    },
    [apikey, namespace, path, url]
  );

  // Non Stream Data Dispatch Handler
  React.useEffect(() => {
    const fetchData = async () => {
      if (!stream && pathString !== null && !err) {
        setEventSource(null);
        try {
          const nodeData = await getWorkflow();
          dispatchData({ type: STATE.UPDATE, data: nodeData });
        } catch (e) {
          setErr(e);
        }
      }
    };
    fetchData();
  }, [stream, queryString, pathString, err, getWorkflow]);

  // Reset states when any prop that affects path is changed
  React.useEffect(() => {
    if (stream) {
      setPathString(
        url && namespace && path
          ? `${url}namespaces/${namespace}/tree${SanitizePath(path)}`
          : null
      );
    } else {
      dispatchData({ type: STATE.UPDATE, data: null });
      setPathString(
        url && namespace && path
          ? `${url}namespaces/${namespace}/tree${SanitizePath(path)}`
          : null
      );
    }
  }, [stream, path, namespace, url]);

  async function getWorkflowSankeyMetrics(rev, ...queryParameters) {
    const uri = `${url}namespaces/${namespace}/tree/${path}?ref=${rev}&op=metrics-sankey`;
    const resp = await fetch(
      `${uri}${ExtractQueryString(true, ...queryParameters)}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      return resp.json();
    } else {
      throw new Error(
        await HandleError("get workflow data", resp, "getWorkflow")
      );
    }
  }

  async function getWorkflowRevisionData(rev, ...queryParameters) {
    const uri = `${url}namespaces/${namespace}/tree/${path}?ref=${rev}`;
    const resp = await fetch(
      `${uri}${ExtractQueryString(true, ...queryParameters)}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      return resp.json();
    } else {
      throw new Error(
        await HandleError("get workflow data", resp, "getWorkflow")
      );
    }
  }

  async function getRevisions(...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=refs${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      return await resp.json();
    } else {
      throw new Error(
        await HandleError("fetch workflow refs", resp, "getWorkflow")
      );
    }
  }

  async function getTags(...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=tags${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      return await resp.json();
    } else {
      throw new Error(
        await HandleError("fetch workflow tags", resp, "getWorkflow")
      );
    }
  }

  async function updateWorkflow(newwf, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=update-workflow${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "post",
        headers: {
          "Content-type": "text/yaml",
          "Content-Length": newwf.length,
          ...apiKeyHeaders(apikey),
        },
        body: newwf,
      }
    );
    if (!resp.ok) {
      throw new Error(await HandleError("update workflow", resp));
    }
  }

  async function toggleWorkflow(active, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=toggle${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        body: JSON.stringify({
          live: active,
        }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("toggle workflow", resp, "toggleWorkflow")
      );
    }
  }

  async function getWorkflowRouter(...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=router${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "get",
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      return resp.json();
    } else {
      throw new Error(
        await HandleError("get workflow router", resp, "getWorkflow")
      );
    }
  }

  async function editWorkflowRouter(routes, live, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=edit-router${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        body: JSON.stringify({
          route: routes,
          live: live,
        }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("edit workflow router", resp, "editRouter")
      );
    }
  }

  async function setWorkflowLogToEvent(val, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=set-workflow-event-logging${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        body: JSON.stringify({
          logger: val,
        }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("set log to event", resp, "getWorkflow")
      );
    }
  }

  async function executeWorkflow(input, revision, ...queryParameters) {
    let ref = "latest";
    if (revision) {
      ref = revision;
    }
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=execute&ref=${ref}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        body: input,
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      const json = await resp.json();
      return json.instance;
    } else {
      throw new Error(
        await HandleError("execute workflow", resp, "executeWorkflow")
      );
    }
  }

  async function executeWorkflowRouter(input, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=execute${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        body: input,
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      const json = await resp.json();
      return json.instance;
    } else {
      throw new Error(
        await HandleError("execute workflow", resp, "executeWorkflow")
      );
    }
  }

  async function addAttributes(attributes, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=create-node-attributes${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "PUT",
        body: JSON.stringify({
          attributes: attributes,
        }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("add workflow attributes", resp, "createAttribute")
      );
    }
  }

  async function deleteAttributes(attributes, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=delete-node-attributes${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "DELETE",
        body: JSON.stringify({
          attributes: attributes,
        }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("delete workflow attributes", resp, "deleteAttribute")
      );
    }
  }

  async function getInstancesForWorkflow(...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/instances?filter.field=AS&filter.type=WORKFLOW&filter.val=${path}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      const json = await resp.json();
      return json;
    } else {
      throw new Error(
        await HandleError("list instances", resp, "listInstances")
      );
    }
  }

  async function getSuccessFailedMetrics(...queryParameters) {
    const respFailed = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=metrics-failed${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    const respSuccess = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=metrics-successful${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );

    const x = {
      success: [],
      failure: [],
    };

    if (respFailed.ok) {
      const j = await respFailed.json();
      x.failure = j.results;
    } else {
      throw new Error(
        await HandleError("get failed metrics", respFailed, "getMetrics")
      );
    }

    if (respSuccess.ok) {
      const j = await respSuccess.json();
      x.success = j.results;
    } else {
      throw new Error(
        await HandleError("get success metrics", respSuccess, "getMetrics")
      );
    }

    return x;
  }

  async function getStateMillisecondMetrics(...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=metrics-state-milliseconds${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        headers: apiKeyHeaders(apikey),
      }
    );
    if (resp.ok) {
      const json = await resp.json();
      return json.results;
    } else {
      throw new Error(
        await HandleError("get state metrics", resp, "getMetrics")
      );
    }
  }

  async function saveWorkflow(ref, ...queryParameters) {
    let rev = ref;
    if (rev === undefined) {
      rev = "latest";
    }
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=save-workflow&ref=${rev}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(await HandleError("save workflow", resp, "saveWorkflow"));
    }

    return resp.json();
  }

  async function deleteRevision(ref, ...queryParameters) {
    let rev = ref;
    if (rev === undefined) {
      rev = "latest";
    }

    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=delete-revision&ref=${ref}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError(`delete revision`, resp, "deleteRevision")
      );
    }
  }

  async function removeTag(tag, ...queryParameters) {
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=untag&ref=${tag}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(await HandleError(`untag`, resp, "untag"));
    }
  }

  async function discardWorkflow(ref, ...queryParameters) {
    let rev = ref;
    if (rev === undefined) {
      rev = "latest";
    }

    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=discard-workflow&ref=${rev}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("discard workflow", resp, "discardWorkflow")
      );
    }
  }

  async function tagWorkflow(ref, tag, ...queryParameters) {
    let rev = ref;
    if (rev === undefined) {
      rev = "latest";
    }
    const resp = await fetch(
      `${url}namespaces/${namespace}/tree/${path}?op=tag&ref=${ref}${ExtractQueryString(
        true,
        ...queryParameters
      )}`,
      {
        method: "POST",
        headers: apiKeyHeaders(apikey),
        body: JSON.stringify({
          tag: tag,
        }),
      }
    );
    if (!resp.ok) {
      throw new Error(await HandleError(`tag workflow`, resp, "tag"));
    }
  }

  return {
    data,
    err,
    getWorkflow,
    setWorkflowLogToEvent,
    getWorkflowRevisionData,
    getWorkflowSankeyMetrics,
    getSuccessFailedMetrics,
    toggleWorkflow,
    getWorkflowRouter,
    editWorkflowRouter,
    executeWorkflowRouter,
    executeWorkflow,
    updateWorkflow,
    saveWorkflow,
    discardWorkflow,
    tagWorkflow,
    getRevisions,
    getTags,
    removeTag,
    deleteRevision,
    addAttributes,
    deleteAttributes,
    getInstancesForWorkflow,
    getStateMillisecondMetrics,
  };
};
