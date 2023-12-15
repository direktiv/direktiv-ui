import {
  Controller,
  DeepPartialSkipArrayKey,
  UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/design/Dialog";
import { EndpointFormSchema, EndpointFormSchemaType } from "../schema";
import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/design/Select";

import Badge from "~/design/Badge";
import Button from "~/design/Button";
import { Card } from "~/design/Card";
import { Checkbox } from "~/design/Checkbox";
import Input from "~/design/Input";
import { InstantResponseForm } from "./plugins/target/InstantResponseForm";
import { Settings } from "lucide-react";
import { Switch } from "~/design/Switch";
import { routeMethods } from "~/api/gateway/schema";
import { targetPluginTypes } from "../schema/plugins/target";
import { zodResolver } from "@hookform/resolvers/zod";

type FormProps = {
  defaultConfig?: EndpointFormSchemaType;
  children: (args: {
    formControls: UseFormReturn<EndpointFormSchemaType>;
    formMarkup: JSX.Element;
    values: DeepPartialSkipArrayKey<EndpointFormSchemaType>;
  }) => JSX.Element;
};

export const Form: FC<FormProps> = ({ defaultConfig, children }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const formControls = useForm<EndpointFormSchemaType>({
    resolver: zodResolver(EndpointFormSchema),
    defaultValues: {
      ...defaultConfig,
    },
  });

  const values = useWatch({
    control: formControls.control,
  });

  const { register, control } = formControls;

  return children({
    formControls,
    values,
    formMarkup: (
      <div className="flex flex-col gap-8">
        <div>
          path
          <Input {...register("path")} />
        </div>
        <div>
          timeout
          <Input
            {...register("timeout", {
              valueAsNumber: true,
            })}
            type="number"
          />
        </div>
        <Controller
          control={control}
          name="methods"
          render={({ field }) => (
            <div>
              methods
              <div className="grid grid-cols-5 gap-5">
                {routeMethods.map((method) => {
                  const isChecked = field.value?.includes(method);
                  return (
                    <label
                      key={method}
                      className="flex items-center gap-2 text-sm"
                      htmlFor={method}
                    >
                      <Checkbox
                        id={method}
                        value={method}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            field.onChange([...(field.value ?? []), method]);
                          }
                          if (checked === false && field.value) {
                            field.onChange(
                              field.value.filter((v) => v !== method)
                            );
                          }
                        }}
                      />
                      <Badge variant={isChecked ? undefined : "secondary"}>
                        {method}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        />
        <Controller
          control={control}
          name="allow_anonymous"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch
                defaultChecked={field.value ?? false}
                onCheckedChange={(value) => {
                  field.onChange(value);
                }}
                id={field.name}
              />
              <label htmlFor={field.name}>allow anonymous</label>
            </div>
          )}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Card className="flex items-center gap-3 p-5">
            Target plugin
            <DialogTrigger asChild>
              <Button icon variant="outline">
                <Settings />{" "}
                {values.plugins?.target?.type ?? "no plugin set yet"}
              </Button>
            </DialogTrigger>
          </Card>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Target plugin</DialogTitle>
            </DialogHeader>
            <div className="my-3 flex flex-col gap-y-5">
              <Controller
                control={control}
                name="plugins.target.type"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-5">
                    <fieldset className="flex items-center gap-5">
                      <label className="w-[150px] overflow-hidden text-right text-sm">
                        select a target plugin
                      </label>
                      <Select
                        /**
                         * TODO: this might not directly set the value, and more show which item is selected
                         * maybe we can use this and create a new component form all of this
                         */
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger variant="outline">
                          <SelectValue placeholder="please select a target plugin" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(targetPluginTypes).map(
                            (targetPluginType) => (
                              <SelectItem
                                key={targetPluginType}
                                value={targetPluginType}
                              >
                                {targetPluginType}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </fieldset>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="plugins.target"
                render={({ field: { value } }) => {
                  if (value.type === targetPluginTypes.instantResponse) {
                    return (
                      <InstantResponseForm
                        defaultConfig={value.configuration}
                        onSubmit={(configuration) => {
                          setDialogOpen(false);
                          formControls.setValue(
                            "plugins.target",
                            configuration
                          );
                        }}
                      />
                    );
                  }
                  if (value.type === targetPluginTypes.targetFlow) {
                    return <div>target flow</div>;
                  }
                  return <div>no plugin selected</div>;
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    ),
  });
};
