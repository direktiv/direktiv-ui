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
// TODO: 
 */
const RouteSchema = z.object({
  methods: z.array(MethodsSchema),
  file_path: z.string(),
  path: z.string(),
  allow_anonymous: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  plugins: z.object({
    outbound: z.array(PluginSchema),
    inbound: z.array(PluginSchema),
    auth: z.array(PluginSchema),
    EventTarget: z.array(PluginSchema),
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

// TODO: delete all below
/**
 * example
  {
    "$defs": {
      "examplePluginConfig": {
        "additionalProperties": false,
        "properties": {
          "echo_value": {
            "type": "string"
          }
        },
        "required": [
          "echo_value"
        ],
        "type": "object"
      }
    },
    "$id": "https://github.com/direktiv/direktiv/pkg/refactor/gateway/example-plugin-config",
    "$ref": "#/$defs/examplePluginConfig",
    "$schema": "https://json-schema.org/draft/2020-12/schema"
  } 
 */
const PluginJSONSchema = z.object({
  $defs: z.record(z.record(z.unknown())),
  $id: z.string(),
  $ref: z.string(),
  $schema: z.string(),
});

/**
 * example
  {
    "data": {
      "example_plugin": {...}
    }
  }
 */
export const PluginsListSchema = z.object({
  data: z.record(PluginJSONSchema),
});

export type PluginsListSchemaType = z.infer<typeof PluginsListSchema>;
export type PluginJSONSchemaType = z.infer<typeof PluginJSONSchema>;

export type GatewaySchemeType = z.infer<typeof RouteSchema>;
