import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/design/Dropdown";
import { MoreVertical, Trash } from "lucide-react";
import {
  ServiceSchemaType,
  SizeSchema,
  serviceConditionNames,
} from "~/api/services/schema";
import { TableCell, TableRow } from "~/design/Table";

import Button from "~/design/Button";
import { DialogTrigger } from "~/design/Dialog";
import { FC } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { TooltipProvider } from "~/design/Tooltip";
import { pages } from "~/util/router/pages";
import { useNamespace } from "~/util/store/namespace";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ServicesTableRow: FC<{
  service: ServiceSchemaType;
  setDeleteService: (service: string | undefined) => void;
}> = ({ service, setDeleteService }) => {
  const namespace = useNamespace();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!namespace) return null;

  const sizeParsed = SizeSchema.safeParse(service.info.size);
  const sizeLabel = sizeParsed.success
    ? t(`pages.services.create.sizeValues.${sizeParsed.data}`)
    : "";

  return (
    <TooltipProvider>
      <TableRow
        onClick={() => {
          navigate(
            pages.services.createHref({
              namespace,
              service: service.info.name,
            })
          );
        }}
        className="cursor-pointer"
      >
        <TableCell>
          <div className="flex flex-col gap-3">
            {service.info.name}
            <div className="flex gap-3">
              {serviceConditionNames.map((condition) => {
                const res = service.conditions.find(
                  (c) => c.name === condition
                );
                return (
                  <StatusBadge
                    key={condition}
                    status={res?.status ?? "Unknown"}
                    title={res?.reason ?? undefined}
                    message={res?.message ?? undefined}
                    className="w-fit"
                  >
                    {condition}
                  </StatusBadge>
                );
              })}
            </div>
          </div>
        </TableCell>
        <TableCell>{service.info.image}</TableCell>
        <TableCell>{service.info.minScale}</TableCell>
        <TableCell>{sizeLabel}</TableCell>
        <TableCell>{service.info.cmd}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.preventDefault()}
                icon
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DialogTrigger
                className="w-full"
                data-testid="node-actions-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteService(service.info.name);
                }}
              >
                <DropdownMenuItem>
                  <Trash className="mr-2 h-4 w-4" />
                  {t("pages.services.list.contextMenu.delete")}
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  );
};

export default ServicesTableRow;
