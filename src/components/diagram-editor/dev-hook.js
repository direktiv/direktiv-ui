import * as React from 'react'
import { HandleError, ExtractQueryString, useEventSourceCleaner, StateReducer, STATE, useQueryString, genericEventSourceErrorHandler, SanitizePath } from './dev-hook-util'
const { EventSourcePolyfill } = require('event-source-polyfill')
const fetch = require('isomorphic-fetch')

const useRemoteFunctions = (url, namespace, path, apikey, ...queryParameters) => {
    const [data, setData] = React.useState(null)
    const [err, setErr] = React.useState(null)

    const [pathString, setPathString] = React.useState(null)

    // Non Stream Data Dispatch Handler
    React.useEffect(async () => {
        if (pathString !== null && !err) {
            setEventSource(null)
            try {
                const images = await getImages()
                setData(images)
            } catch (e) {
                setErr(e.onmessage)
            }
        }
    }, [pathString, err])

    // Reset states when any prop that affects path is changed
    React.useEffect(() => {
        if (stream) {
            setPageInfo(null)
            setTotalCount(null)
            setPathString(url && namespace && path ? `${url}namespaces/${namespace}/tree${SanitizePath(path)}?op=mirror-info` : null)
        } else {
            dispatchInfo({ type: STATE.UPDATE, data: null })
            dispatchActivities({ type: STATE.UPDATE, data: null })
            setPathString(url && namespace && path ? `${url}namespaces/${namespace}/tree${SanitizePath(path)}?op=mirror-info` : null)
        }
    }, [stream, path, namespace, url])

    async function getImages(...queryParameters) {
        let uriPath = `${url}namespaces/${namespace}/tree`
        if (path !== "") {
            uriPath += `${SanitizePath(path)}`
        }
        let request = {
            method: "GET",
            headers: apikey === undefined ? {} : { "apikey": apikey }
        }

        let resp = await fetch(`https://anime-facts-rest-api.herokuapp.com/api/v1${ExtractQueryString(true, ...queryParameters)}`, request)
        if (!resp.ok) {
            throw new Error(await HandleError('get mirror info', resp, 'mirrorInfo'))
        }

        return await resp.json().data
    }

    return {
        info,
        activities,
        err,
        pageInfo,
        totalCount,
        getInfo,
        updateSettings,
        cancelActivity,
        setLock,
        sync
    }
}

export default useRemoteFunctions