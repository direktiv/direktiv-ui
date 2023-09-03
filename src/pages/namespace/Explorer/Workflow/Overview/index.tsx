import { Boxes, PieChart } from "lucide-react";
import { NoResult, Table, TableBody } from "~/design/Table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/design/Tooltip";

import Badge from "~/design/Badge";
import { Card } from "~/design/Card";
import { FC } from "react";
import { InstanceCard } from "~/pages/namespace/Monitoring/Instances/InstanceCard";
import { InstanceRow } from "~/pages/namespace/Monitoring/Instances/Row";
import Metrics from "./Metrics";
import RefreshButton from "~/design/RefreshButton";
import { ScrollArea } from "~/design/ScrollArea";
import { forceLeadingSlash } from "~/api/tree/utils";
import { pages } from "~/util/router/pages";
import { useInstances } from "~/api/instances/query/get";
import { useMetrics } from "~/api/tree/query/metrics";
import { useNodeContent } from "~/api/tree/query/node";
import { useRouter } from "~/api/tree/query/router";
import { useTranslation } from "react-i18next";

const ActiveWorkflowPage: FC = () => {
  const { path } = pages.explorer.useParams();
  const { data } = useNodeContent({
    path,
  });
  const { data: routerData } = useRouter({ path });
  const {
    data: instances,
    isFetching: isFetchingInstances,
    refetch: refetchInstances,
  } = useInstances({
    limit: 10,
    offset: 0,
    filters: { AS: { type: "WORKFLOW", value: forceLeadingSlash(path) } },
  });
  const { data: successData } = useMetrics({ path, type: "successful" });
  const { data: failedData } = useMetrics({ path, type: "failed" });
  const { t } = useTranslation();

  const routes = routerData?.routes;

  const successful = Number(successData?.results[0]?.value[1]);
  const failed = Number(failedData?.results[0]?.value[1]);
  const metrics =
    successful && failed
      ? {
          successful,
          failed,
        }
      : undefined;

  if (!metrics) return null;

  const refetchButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <RefreshButton
            icon
            size="sm"
            variant="ghost"
            disabled={isFetchingInstances}
            onClick={() => {
              refetchInstances();
            }}
          />
        </TooltipTrigger>
        <TooltipContent>
          {t(`pages.monitoring.instances.updateTooltip`)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Card className="p-4">
        <Badge>{data?.revision?.hash.slice(0, 8)}</Badge>
      </Card>

      <Card className="flex flex-col">
        <div className="flex items-center gap-x-2 border-b border-gray-5 p-5 font-medium dark:border-gray-dark-5">
          <PieChart className="h-5" />
          <h3 className="grow">
            {t("pages.explorer.tree.workflow.overview.metrics.header")}
          </h3>
        </div>
        <Metrics data={metrics} />
      </Card>

      <Card className="p-4">
        <ul>
          <li>
            Traffic distribution:{" "}
            {routes && routes[0] && routes[1]
              ? `${routes[0].ref}: ${routes[0].weight} - ${routes[1].ref}: ${routes[1].weight}`
              : "not configured"}
          </li>
        </ul>
      </Card>

      <InstanceCard
        headline={t("pages.explorer.tree.workflow.overview.instances.header")}
        icon={Boxes}
        refetchButton={refetchButton}
      >
        {instances?.instances?.results.length === 0 ? (
          <NoResult icon={Boxes}>
            {t("pages.explorer.tree.workflow.overview.instances.noResult")}
          </NoResult>
        ) : (
          <ScrollArea className="h-full">
            <Table>
              <TableBody>
                {instances?.instances?.results.map((instance) => (
                  <InstanceRow key={instance.id} instance={instance} />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </InstanceCard>
    </div>
  );
};

export default ActiveWorkflowPage;
