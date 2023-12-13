import { MethodsSchema } from "~/api/gateway/schema";
import { stringify } from "json-to-pretty-yaml";
import { z } from "zod";

export const EndpointFormSchema = z.object({
  direktiv_api: z.literal("endpoint/v1"),
  methods: z.array(MethodsSchema).nonempty().optional(),
  allow_anonymous: z.boolean().optional(),
});

type EndpointFormSchemaType = z.infer<typeof EndpointFormSchema>;

const defaultEndpointFileJson: EndpointFormSchemaType = {
  direktiv_api: "endpoint/v1",
};

export const defaultEndpointFileYaml = stringify(defaultEndpointFileJson);
