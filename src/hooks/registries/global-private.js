import * as React from "react";
import { HandleError, ExtractQueryString, apiKeyHeaders } from "../util";
import fetch from "isomorphic-fetch";

/*
    useGlobalPrivateRegistries is a react hook which returns create registry, delete registry and data
    takes:
      - url to direktiv api http://x/api/
      - apikey to provide authentication of an apikey
*/
export const useDirektivGlobalPrivateRegistries = (url, apikey) => {
  const [data, setData] = React.useState(null);

  // getGlobalPrivateRegistries returns a list of registries
  const getRegistries = React.useCallback(
    async (...queryParameters) => {
      const resp = await fetch(
        `${url}functions/registries/private${ExtractQueryString(
          false,
          ...queryParameters
        )}`,
        {
          headers: apiKeyHeaders(apikey),
        }
      );
      if (resp.ok) {
        const json = await resp.json();
        setData(json.registries);
        return json.registries;
      } else {
        throw new Error(
          await HandleError(
            "list registries",
            resp,
            "listGlobalPrivateRegistries"
          )
        );
      }
    },
    [apikey, url]
  );

  React.useEffect(() => {
    if (data === null) {
      getRegistries();
    }
  }, [data, getRegistries]);

  async function createRegistry(key, val, ...queryParameters) {
    const resp = await fetch(
      `${url}functions/registries/private${ExtractQueryString(
        false,
        ...queryParameters
      )}`,
      {
        method: "POST",
        body: JSON.stringify({ data: val, reg: key }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("create registry", resp, "createRegistry")
      );
    }
  }

  async function deleteRegistry(key, ...queryParameters) {
    const resp = await fetch(
      `${url}functions/registries/private${ExtractQueryString(
        false,
        ...queryParameters
      )}`,
      {
        method: "DELETE",
        body: JSON.stringify({
          reg: key,
        }),
        headers: apiKeyHeaders(apikey),
      }
    );
    if (!resp.ok) {
      throw new Error(
        await HandleError("delete registry", resp, "deleteRegistry")
      );
    }
  }

  return {
    data,
    createRegistry,
    deleteRegistry,
    getRegistries,
  };
};
