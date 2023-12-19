import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/design/Dialog";
import { FC, PropsWithChildren } from "react";

import Button from "~/design/Button";
import { Card } from "~/design/Card";
import { useTranslation } from "react-i18next";

type ModalWrapperProps = PropsWithChildren & {
  title: string;
};

export const ModalWrapper: FC<ModalWrapperProps> = ({ title, children }) => (
  <DialogContent className="sm:max-w-xl">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    <div className="my-3 flex flex-col gap-5">{children}</div>
  </DialogContent>
);

type PluginSelectorProps = PropsWithChildren & {
  title: string;
};

export const PluginSelector: FC<PluginSelectorProps> = ({
  title,
  children,
}) => (
  <fieldset className="flex items-center gap-5">
    <label className="text-sm">{title}</label>
    {children}
  </fieldset>
);

export const PluginWrapper: FC<PropsWithChildren> = ({ children }) => (
  <Card className="flex flex-col gap-5 p-5" noShadow>
    {children}
  </Card>
);

type FieldsetProps = PropsWithChildren & {
  label: string;
  htmlFor?: string;
};

export const Fieldset: FC<FieldsetProps> = ({ label, htmlFor, children }) => (
  <fieldset className="flex flex-col gap-2">
    <label className="text-sm" htmlFor={htmlFor}>
      {label}
    </label>
    {children}
  </fieldset>
);

export const ModalFooter = () => {
  const { t } = useTranslation();
  return (
    <DialogFooter className="pt-5">
      <Button type="submit">
        {t("pages.explorer.endpoint.editor.form.plugins.saveBtn")}
      </Button>
    </DialogFooter>
  );
};