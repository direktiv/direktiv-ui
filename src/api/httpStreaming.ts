import { useCallback, useEffect } from "react";

import { z } from "zod";

type HttpStreamingOptions = {
  url: string;
  apiKey?: string;
  onMessage?: (message: unknown, isFirstMessage: boolean) => void;
  onError?: (e: unknown) => void;
  enabled?: boolean;
};

const decoder = new TextDecoder("iso-8859-2");

/**
 * a react hook that handles a connection to an http endpoint and streams
 * the response. All messages are forwarded to the onMessage callback.
 */
export const useHttpStreaming = ({
  url,
  apiKey,
  onMessage,
  onError,
  enabled = true,
}: HttpStreamingOptions) => {
  const startStreaming = useCallback(
    async (abortController: AbortController) => {
      const response = await fetch(url, {
        signal: abortController.signal,
        ...(apiKey
          ? {
              headers: {
                "direktiv-token": apiKey,
              },
            }
          : {}),
        /**
         * this throws an error if the request is aborted before the first
         * response is received. We don't want to forward this error to
         * the user
         */
      }).catch(() => null);

      if (!response || !response.ok || !response.body) {
        return;
      }

      const reader = response.body.getReader();

      let finished = false;
      let isFirstMessage = true;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) {
          finished = true;
          break;
        }
        try {
          const chunk = decoder.decode(value, {
            stream: true,
          });
          onMessage?.(chunk, isFirstMessage);
          isFirstMessage = false;
        } catch (error) {
          onError?.(error);
          finished = true;
        }
      }
    },
    [apiKey, onError, onMessage, url]
  );

  useEffect(() => {
    const abortController = new AbortController();
    if (enabled) {
      startStreaming(abortController).catch(() => null);
    }
    return () => {
      abortController.abort();
    };
  }, [enabled, onError, startStreaming]);
};

/**
 * react hook that acts as a proxy for useHttpStreaming
 * and implements schema validation on top of it
 */
export const useStreaming = <T>({
  url,
  apiKey,
  enabled,
  schema,
  onMessage,
}: {
  url: string;
  apiKey?: string;
  enabled: boolean;
  schema: z.ZodSchema<T>;
  onMessage: (msg: T) => void;
}) =>
  useHttpStreaming({
    url,
    apiKey,
    enabled,
    onMessage: (msg) => {
      const parsedResult = schema.safeParse(msg);
      if (parsedResult.success === false) {
        console.error(
          `error parsing streaming result for ${url}`,
          parsedResult.error
        );
        return;
      }
      onMessage(parsedResult.data);
    },
  });
