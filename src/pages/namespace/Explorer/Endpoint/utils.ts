import { MethodsSchema } from "~/api/gateway/schema";
import { stringify } from "json-to-pretty-yaml";
import { z } from "zod";

export const EndpointFormSchema = z.object({
  direktiv_api: z.literal("endpoint/v1"),
  allow_anonymous: z.boolean().optional(),
  path: z.string().nonempty().optional(),
  timeout: z.number().int().positive().optional(),
  methods: z.array(MethodsSchema).nonempty().optional(),
});

export type EndpointFormSchemaType = z.infer<typeof EndpointFormSchema>;

const defaultEndpointFileJson: EndpointFormSchemaType = {
  direktiv_api: "endpoint/v1",
};

export const defaultEndpointFileYaml = stringify(defaultEndpointFileJson);
