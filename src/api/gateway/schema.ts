import { z } from "zod";

export const endpointMethods = [
  "GET",
  "DELETE",
  "HEAD",
  "POST",
  "PUT",
  "TRACE",
  "PATH",
  "OPTIONS",
  "CONNECT",
  "*",
] as const;

const MethodsSchema = z.enum(endpointMethods);

/**
 * example
  {
    "type": "proxy",
    "configuration": {
      "key1": ["value1", "value2", "value3"],
      "key2": "value3"
    }
  }
 */
const PluginSchema = z.object({
  type: z.string(),
  configuration: z.record(z.unknown()).nullable(),
});

/**
 * example
// TODO:     !!!

 */
const RouteSchema = z.object({
  methods: z.array(MethodsSchema),
  file_path: z.string(),
  path: z.string(),
  allow_anonymous: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  plugins: z.object({
    outbound: z.array(PluginSchema).optional(),
    inbound: z.array(PluginSchema).optional(),
    auth: z.array(PluginSchema).optional(),
    EventTarget: z.array(PluginSchema).optional(),
  }),
});

/**
 * example
  {
    "data": [{...}, {...}, {...}]
  } 
 */
export const RoutesListSchema = z.object({
  data: z.array(RouteSchema),
});

const ConsumerSchema = z.object({
  username: z.string(),
  password: z.string(),
  api_key: z.string(),
  tags: z.array(z.string()),
  groups: z.array(z.string()),
});

/**
 * example
  {
    "data": [{...}, {...}, {...}]
  } 
 */
export const ConsumersListSchema = z.object({
  data: z.array(ConsumerSchema),
});

export type GatewaySchemeType = z.infer<typeof RouteSchema>;
