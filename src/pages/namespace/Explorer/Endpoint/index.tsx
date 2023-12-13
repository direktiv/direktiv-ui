import { FileSymlink, Workflow } from "lucide-react";
import { removeLeadingSlash, removeTrailingSlash } from "~/api/tree/utils";

import Button from "~/design/Button";
import { Card } from "~/design/Card";
import EndpointEditor from "./EndpointEditor";
import { FC } from "react";
import { Link } from "react-router-dom";
import { NoPermissions } from "~/design/Table";
import { analyzePath } from "~/util/router/utils";
import { pages } from "~/util/router/pages";
import { useNamespace } from "~/util/store/namespace";
import { useNodeContent } from "~/api/tree/query/node";
import { useRoutes } from "~/api/gateway/query/getRoutes";
import { useTranslation } from "react-i18next";

const EndpointPage: FC = () => {
  const { path } = pages.explorer.useParams();
  const namespace = useNamespace();
  const { segments } = analyzePath(path);
  const filename = segments[segments.length - 1];
  const { t } = useTranslation();

  const {
    isAllowed,
    noPermissionMessage,
    data: gatewayData,
    isFetched: isPermissionCheckFetched,
  } = useNodeContent({ path });

  const { data: routes, isFetched: isRouteListFetched } = useRoutes();

  if (!namespace) return null;
  if (!path) return null;
  if (!gatewayData) return null;
  if (!isPermissionCheckFetched) return null;
  if (!isRouteListFetched) return null;

  if (isAllowed === false)
    return (
      <Card className="m-5 flex grow">
        <NoPermissions>{noPermissionMessage}</NoPermissions>
      </Card>
    );

  const matchingRoute = routes?.data.find(
    (route) => removeLeadingSlash(route.file_path) === removeLeadingSlash(path)
  );

  return (
    <>
      <div className="space-y-5 border-b border-gray-5 bg-gray-1 p-5  dark:border-gray-dark-5 dark:bg-gray-dark-1">
        <div className="flex flex-col max-sm:space-y-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-x-2 font-bold text-primary-500">
            <Workflow className="h-5" />
            {filename?.relative}
          </h3>
          <Button isAnchor asChild variant="primary">
            <Link
              to={pages.gateway.createHref({
                namespace,
              })}
            >
              <FileSymlink />
              {t("pages.explorer.endpoint.goToRoutes")}
            </Link>
          </Button>
        </div>
      </div>
      <EndpointEditor data={gatewayData} path={path} route={matchingRoute} />
    </>
  );
};

export default EndpointPage;
