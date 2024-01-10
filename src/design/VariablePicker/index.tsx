import * as React from "react";

import { FC, PropsWithChildren } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Select";

type FilepickerPropsType = PropsWithChildren & {
  buttonText: string;
  value?: string;
  onChange?: (value: string) => void;
};

const Variablepicker: FC<FilepickerPropsType> = ({
  children,
  buttonText,
  value,
  onChange,
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger variant="outline">
      <SelectValue placeholder={buttonText}>{buttonText}</SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>{children}</SelectGroup>
    </SelectContent>
  </Select>
);

type VariablepickerItemProps = PropsWithChildren & {
  value: string;
};

const VariablepickerItem: FC<VariablepickerItemProps> = ({
  children,
  value,
}) => <SelectItem value={value}>{children}</SelectItem>;

export { Variablepicker, VariablepickerItem };
