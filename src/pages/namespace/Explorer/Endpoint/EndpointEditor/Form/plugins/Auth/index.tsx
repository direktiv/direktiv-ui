import { ChevronDown, ChevronUp, Edit, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/design/Dialog";
import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/design/Select";
import { UseFormReturn, useFieldArray } from "react-hook-form";

import { AuthPluginFormSchemaType } from "../../../schema/plugins/auth/schema";
import { BasicAuthForm } from "./BasicAuthForm";
import { BasicAuthFormSchemaType } from "../../../schema/plugins/auth/basicAuth";
import Button from "~/design/Button";
import { EndpointFormSchemaType } from "../../../schema";
import { GithubWebhookAuthForm } from "./GithubWebhookAuthForm";
import { GithubWebhookAuthFormSchemaType } from "../../../schema/plugins/auth/githubWebhookAuth";
import { KeyAuthForm } from "./KeyAuthForm";
import { KeyAuthFormSchemaType } from "../../../schema/plugins/auth/keyAuth";
import { authPluginTypes } from "../../../schema/plugins/auth";

type AuthPluginFormProps = {
  formControls: UseFormReturn<EndpointFormSchemaType>;
};

// TODO: may create a factory for this, ot introduce a generic
const readBasicAuthConfig = (
  fields: AuthPluginFormSchemaType[] | undefined,
  index: number | undefined
): BasicAuthFormSchemaType["configuration"] | undefined => {
  const plugin = index !== undefined ? fields?.[index] : undefined;
  return plugin?.type === authPluginTypes.basicAuth
    ? plugin.configuration
    : undefined;
};

const readKeyAuthConfig = (
  fields: AuthPluginFormSchemaType[] | undefined,
  index: number | undefined
): KeyAuthFormSchemaType["configuration"] | undefined => {
  const plugin = index !== undefined ? fields?.[index] : undefined;
  return plugin?.type === authPluginTypes.keyAuth
    ? plugin.configuration
    : undefined;
};

const readGithubWebhookAuthConfig = (
  fields: AuthPluginFormSchemaType[] | undefined,
  index: number | undefined
): GithubWebhookAuthFormSchemaType["configuration"] | undefined => {
  const plugin = index !== undefined ? fields?.[index] : undefined;
  return plugin?.type === authPluginTypes.githubWebhookAuth
    ? plugin.configuration
    : undefined;
};

export const AuthPluginForm: FC<AuthPluginFormProps> = ({ formControls }) => {
  const { control } = formControls;
  const {
    append: addPlugin,
    remove: deletePlugin,
    move: movePlugin,
    update: editPlugin,
    fields,
  } = useFieldArray({
    control,
    name: "plugins.auth",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number>();

  const [selectedPlugin, setSelectedPlugin] =
    useState<AuthPluginFormSchemaType["type"]>();

  const pluginsCount = fields.length;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(isOpen) => {
        if (isOpen === false) setEditIndex(undefined);
        setDialogOpen(isOpen);
      }}
    >
      <div className="flex items-center gap-3">
        {pluginsCount} Auth plugins
        <DialogTrigger asChild>
          <Button icon variant="outline">
            <Plus /> add auth plugin
          </Button>
        </DialogTrigger>
      </div>
      {fields.map(({ id, type }, index, srcArray) => {
        const canMoveDown = index < srcArray.length - 1;
        const canMoveUp = index > 0;

        return (
          <div key={id} className="flex gap-2">
            {type}
            <Button
              variant="destructive"
              icon
              size="sm"
              onClick={() => {
                deletePlugin(index);
              }}
            >
              <Trash />
            </Button>
            <Button
              variant="outline"
              icon
              size="sm"
              disabled={!canMoveDown}
              onClick={() => {
                movePlugin(index, index + 1);
              }}
            >
              <ChevronDown />
            </Button>
            <Button
              variant="outline"
              icon
              size="sm"
              disabled={!canMoveUp}
              onClick={() => {
                movePlugin(index, index - 1);
              }}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="outline"
              icon
              size="sm"
              onClick={() => {
                setSelectedPlugin(type);
                setDialogOpen(true);
                setEditIndex(index);
              }}
            >
              <Edit />
            </Button>
          </div>
        );
      })}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editIndex === undefined ? "add" : "edit"} Auth Plugin
          </DialogTitle>
        </DialogHeader>
        <div className="my-3 flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-5">
            <fieldset className="flex items-center gap-5">
              <label className="w-[150px] overflow-hidden text-right text-sm">
                select a auth plugin
              </label>
              <Select
                onValueChange={(e) => {
                  setSelectedPlugin(e as typeof selectedPlugin);
                }}
                value={selectedPlugin}
              >
                <SelectTrigger variant="outline">
                  <SelectValue placeholder="please select a auth plugin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(authPluginTypes).map((pluginType) => (
                    <SelectItem key={pluginType} value={pluginType}>
                      {pluginType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          </div>
          {selectedPlugin === authPluginTypes.basicAuth && (
            <BasicAuthForm
              defaultConfig={readBasicAuthConfig(fields, editIndex)}
              onSubmit={(configuration) => {
                setDialogOpen(false);
                if (editIndex === undefined) {
                  addPlugin(configuration);
                } else {
                  editPlugin(editIndex, configuration);
                }
                setEditIndex(undefined);
              }}
            />
          )}
          {selectedPlugin === authPluginTypes.keyAuth && (
            <KeyAuthForm
              defaultConfig={readKeyAuthConfig(fields, editIndex)}
              onSubmit={(configuration) => {
                setDialogOpen(false);
                if (editIndex === undefined) {
                  addPlugin(configuration);
                } else {
                  editPlugin(editIndex, configuration);
                }
                setEditIndex(undefined);
              }}
            />
          )}
          {selectedPlugin === authPluginTypes.githubWebhookAuth && (
            <GithubWebhookAuthForm
              defaultConfig={readGithubWebhookAuthConfig(fields, editIndex)}
              onSubmit={(configuration) => {
                setDialogOpen(false);
                if (editIndex === undefined) {
                  addPlugin(configuration);
                } else {
                  editPlugin(editIndex, configuration);
                }
                setEditIndex(undefined);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};