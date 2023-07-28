import { Card } from "~/design/Card";
import Diagram from "./Diagram";
import { FC } from "react";
import Header from "./Header";
import Input from "./Input";
import Logs from "./Logs";
import Output from "./Output";
import { useInstanceDetails } from "~/api/instances/query/details";

const InstancesDetail: FC<{ instanceId: string }> = ({ instanceId }) => {
  const { data } = useInstanceDetails({ instanceId });

  if (!data) return null;

  const instanceIsFinished = data.instance.status !== "pending";

  return (
    <div className="flex grow flex-col">
      <Header instanceId={instanceId} stream={!instanceIsFinished} />
      <div className="grid grow grid-cols-2 gap-5 p-5">
        <Card className="p-5">
          <Logs instanceId={instanceId} stream={!instanceIsFinished} />
        </Card>
        <Card>
          <Diagram workflowPath={data.workflow.path} flow={data.flow} />
        </Card>
        <Card className="p-5">
          <Input instanceId={instanceId} />
        </Card>
        <Card className="p-5">
          <Output
            instanceId={instanceId}
            instanceIsFinished={instanceIsFinished}
          />
        </Card>
      </div>
    </div>
  );
};

export default InstancesDetail;
