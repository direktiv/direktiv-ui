import { Box, FileSymlink } from "lucide-react";

import Badge from "~/design/Badge";
import Button from "~/design/Button";
import { FC } from "react";
import { Link } from "react-router-dom";
import { pages } from "~/util/router/pages";
import { statusToBadgeVariant } from "../utils";
import { useInstanceDetails } from "~/api/instances/query/details";

const Header: FC<{ instanceId: string; stream: boolean }> = ({
  instanceId,
  stream,
}) => {
  const { data } = useInstanceDetails({ instanceId }, { stream });

  if (!data) return null;

  const link = pages.explorer.createHref({
    path: data.workflow.path,
    namespace: data.namespace,
    subpage: "workflow",
  });

  return (
    <div className="space-y-5 border-b border-gray-5 bg-gray-1 p-5 dark:border-gray-dark-5 dark:bg-gray-dark-1">
      <div className="flex flex-col max-sm:space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-x-2 font-bold text-primary-500">
          <Box className="h-5" /> {data.instance.id.slice(0, 8)}
          <Badge
            variant={statusToBadgeVariant(data.instance.status)}
            className="font-normal"
          >
            {data.instance.status}
          </Badge>
        </h3>
        <Button asChild variant="primary">
          <Link to={link}>
            <FileSymlink />
            open workflow
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Header;
