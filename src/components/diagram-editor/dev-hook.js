import * as React from 'react'
import { HandleError, ExtractQueryString, SanitizePath } from './dev-hook-util'
const { EventSourcePolyfill } = require('event-source-polyfill')
const fetch = require('isomorphic-fetch')

const useRemoteFunctions = (url, namespace, path, apikey, ...queryParameters) => {
    const [data, setData] = React.useState(null)
    const [err, setErr] = React.useState(null)

    const [pathString, setPathString] = React.useState(null)

    // Non Stream Data Dispatch Handler
    React.useEffect(() => {
        async function fetchData() {
            try {
                const images = await getImages()
                setData(images)
            } catch (e) {
                setErr(e.onmessage)
            }
        }

        if (pathString !== null && !err) {
            fetchData()
        }
    }, [pathString, err])

    // Reset states when any prop that affects path is changed
    React.useEffect(() => {
            setData(null)
            setPathString(url && namespace && path ? `${url}namespaces/${namespace}/tree${SanitizePath(path)}?op=mirror-info` : null)
    }, [path, namespace, url])

    async function getImages(...queryParameters) {
        let uriPath = `${url}namespaces/${namespace}/tree`
        if (path !== "") {
            uriPath += `${SanitizePath(path)}`
        }
        let request = {
            method: "GET",
            headers: apikey === undefined ? {} : { "apikey": apikey }
        }

        let resp = await fetch(`http://192.168.1.16/api/namespaces/${namespace}/tree/list?op=wait&field=output&raw-output=true&ctype=application%2Fjson${ExtractQueryString(true, ...queryParameters)}`, request)
        if (!resp.ok) {
            throw new Error(await HandleError('get mirror info', resp, 'mirrorInfo'))
        }

        return await resp.json()
    }

    async function getImageInfo(image, tag, ...queryParameters) {
        if (!image || !tag) {
            throw new Error("image and tag cannot be empty")
        }

        let uriPath = `${url}namespaces/${namespace}/tree`
        if (path !== "") {
            uriPath += `${SanitizePath(path)}`
        }
        let request = {
            method: "GET",
            headers: apikey === undefined ? {} : { "apikey": apikey }
        }

        let resp = await fetch(`http://192.168.1.16/api/namespaces/${namespace}/tree/spec?op=wait&input.uri=${encodeURIComponent(image)}&input.tag=${encodeURIComponent(tag)}&field=output&raw-output=true&ctype=application%2Fjson${ExtractQueryString(true, ...queryParameters)}`, request)
        if (!resp.ok) {
            throw new Error(await HandleError('get mirror info', resp, 'mirrorInfo'))
        }

        return await resp.json()
    }

    return {
        data,
        err,
        getImages,
        getImageInfo
    }
}

export default useRemoteFunctions