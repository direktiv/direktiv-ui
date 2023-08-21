import {
  PodLogsSubscriber,
  usePodLogs,
} from "~/api/services/query/revision/pods/getLogs";
import {
  PodsSubscriber,
  usePods,
} from "~/api/services/query/revision/pods/getAll";

import { useServiceRevision } from "~/api/services/query/revision/getAll";

const Header = ({
  service,
  revision,
}: {
  service: string;
  revision: string;
}) => {
  const { data: revisionData } = useServiceRevision({ service, revision });

  return (
    <div className="space-y-5 border-b border-gray-5 bg-gray-1 p-5 dark:border-gray-dark-5 dark:bg-gray-dark-1">
      <div className="flex flex-col gap-x-7 max-md:space-y-4 md:flex-row md:items-center md:justify-start">
        revisions page: service: {service} - revision: {revision}
        <div>
          <hr />
          {revisionData?.actualReplicas} / {revisionData?.desiredReplicas}
          <hr />
          {revisionData?.image}
          <hr />
          {revisionData?.generation}
        </div>
      </div>
    </div>
  );
};

export default Header;
