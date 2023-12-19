import { inboundPluginTypes } from ".";
import { z } from "zod";

export const AclFormSchema = z.object({
  type: z.literal(inboundPluginTypes.acl),
  configuration: z.object({
    allow_groups: z.array(z.string()),
    deny_groups: z.array(z.string()),
    allow_tags: z.array(z.string()),
    deny_tags: z.array(z.string()),
  }),
});

export type AclFormSchemaType = z.infer<typeof AclFormSchema>;