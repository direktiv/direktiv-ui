import { Dialog, DialogTrigger } from "~/design/Dialog";
import { FC, useState } from "react";
import { ModalWrapper, PluginSelector } from "../components/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/design/Select";
import { UseFormReturn, useWatch } from "react-hook-form";

import Button from "~/design/Button";
import { EndpointFormSchemaType } from "../../../schema";
import { InstantResponseForm } from "./InstantResponseForm";
import { Settings } from "lucide-react";
import { TargetFlowForm } from "./TargetFlowForm";
import { TargetFlowVarForm } from "./TargetFlowVarForm";
import { TargetNamespaceFileForm } from "./TargetNamespaceFileForm";
import { TargetNamespaceVarForm } from "./TargetNamespaceVarForm";
import { targetPluginTypes } from "../../../schema/plugins/target";
import { useTranslation } from "react-i18next";

type TargetPluginFormProps = {
  formControls: UseFormReturn<EndpointFormSchemaType>;
};

export const TargetPluginForm: FC<TargetPluginFormProps> = ({
  formControls,
}) => {
  const { control } = formControls;
  const values = useWatch({ control });
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentType = values.plugins?.target?.type;
  const [selectedPlugin, setSelectedPlugin] = useState(currentType);

  const {
    instantResponse,
    targetFlow,
    targetFlowVar,
    targetNamespaceFile,
    targetNamespaceVar,
  } = targetPluginTypes;

  const currentConfiguration = values.plugins?.target?.configuration;

  const currentInstantResponseConfig =
    currentType === instantResponse ? currentConfiguration : undefined;

  const currentTargetFlowConfig =
    currentType === targetFlow ? currentConfiguration : undefined;

  const currentTargetFlowVarConfig =
    currentType === targetFlowVar ? currentConfiguration : undefined;

  const currentTargetNamespaceFileConfig =
    currentType === targetNamespaceFile ? currentConfiguration : undefined;

  const currentTargetNamespaceVarConfig =
    currentType === targetNamespaceVar ? currentConfiguration : undefined;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex items-center gap-3">
        {t("pages.explorer.endpoint.editor.form.plugins.target.label")}
        <DialogTrigger asChild>
          <Button icon variant="outline">
            <Settings />{" "}
            {values.plugins?.target?.type
              ? t(
                  `pages.explorer.endpoint.editor.form.plugins.target.types.${values.plugins?.target?.type}`
                )
              : t(
                  "pages.explorer.endpoint.editor.form.plugins.target.notConfigured"
                )}
          </Button>
        </DialogTrigger>
      </div>
      <ModalWrapper
        title={t("pages.explorer.endpoint.editor.form.plugins.target.headline")}
      >
        <PluginSelector
          title={t("pages.explorer.endpoint.editor.form.plugins.target.label")}
        >
          <Select
            onValueChange={(e) => {
              setSelectedPlugin(e as typeof selectedPlugin);
            }}
            value={selectedPlugin}
          >
            <SelectTrigger variant="outline" className="grow">
              <SelectValue
                placeholder={t(
                  "pages.explorer.endpoint.editor.form.plugins.target.placeholder"
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {Object.values(targetPluginTypes).map((pluginType) => (
                <SelectItem key={pluginType} value={pluginType}>
                  {t(
                    `pages.explorer.endpoint.editor.form.plugins.target.types.${pluginType}`
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PluginSelector>

        {selectedPlugin === instantResponse && (
          <InstantResponseForm
            defaultConfig={currentInstantResponseConfig}
            onSubmit={(configuration) => {
              setDialogOpen(false);
              formControls.setValue("plugins.target", configuration);
            }}
          />
        )}
        {selectedPlugin === targetFlow && (
          <TargetFlowForm
            defaultConfig={currentTargetFlowConfig}
            onSubmit={(configuration) => {
              setDialogOpen(false);
              formControls.setValue("plugins.target", configuration);
            }}
          />
        )}
        {selectedPlugin === targetFlowVar && (
          <TargetFlowVarForm
            defaultConfig={currentTargetFlowVarConfig}
            onSubmit={(configuration) => {
              setDialogOpen(false);
              formControls.setValue("plugins.target", configuration);
            }}
          />
        )}
        {selectedPlugin === targetNamespaceFile && (
          <TargetNamespaceFileForm
            defaultConfig={currentTargetNamespaceFileConfig}
            onSubmit={(configuration) => {
              setDialogOpen(false);
              formControls.setValue("plugins.target", configuration);
            }}
          />
        )}
        {selectedPlugin === targetNamespaceVar && (
          <TargetNamespaceVarForm
            defaultConfig={currentTargetNamespaceVarConfig}
            onSubmit={(configuration) => {
              setDialogOpen(false);
              formControls.setValue("plugins.target", configuration);
            }}
          />
        )}
      </ModalWrapper>
    </Dialog>
  );
};
