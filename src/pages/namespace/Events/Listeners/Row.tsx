import { TableCell, TableRow } from "~/design/Table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/design/Tooltip";

import CopyButton from "~/design/CopyButton";
import { EventListenerSchemaType } from "~/api/eventListeners/schema";
import { useTranslation } from "react-i18next";
import useUpdatedAt from "~/hooksNext/useUpdatedAt";

const Row = ({
  listener,
}: {
  listener: EventListenerSchemaType;
  namespace: string;
}) => {
  const { t } = useTranslation();
  const createdAt = useUpdatedAt(listener.createdAt);

  const target = listener.workflow || listener.instance;
  const listenerType = listener.instance ? "instance" : "workflow";
  const eventTypes = listener.events.map((event) => event.type).join(", ");

  return (
    <TooltipProvider>
      <TableRow>
        <TableCell>
          {t(`pages.events.listeners.tableRow.type.${listenerType}`)}
        </TableCell>
        <TableCell>{target}</TableCell>
        <TableCell>{listener.mode}</TableCell>
        <TableCell>
          <Tooltip>
            <TooltipTrigger data-testid="receivedAt-tooltip-trigger">
              {t("pages.events.listeners.tableRow.realtiveTime", {
                relativeTime: createdAt,
              })}
            </TooltipTrigger>
            <TooltipContent data-testid="receivedAt-tooltip-content">
              {listener.createdAt}
            </TooltipContent>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Tooltip>
            <TooltipTrigger>
              <div className="w-40 truncate text-left">{eventTypes}</div>
            </TooltipTrigger>
            <TooltipContent>
              {eventTypes}
              <CopyButton
                value={eventTypes}
                buttonProps={{
                  size: "sm",
                  onClick: (e) => {
                    e.stopPropagation();
                  },
                }}
              />
            </TooltipContent>
          </Tooltip>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  );
};

export default Row;
