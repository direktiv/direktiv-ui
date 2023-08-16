import { Boxes } from "lucide-react";

const NoResult = ({ message }: { message: string }) => (
  <div
    className="flex grow flex-col items-center justify-center gap-1 p-10"
    data-testid="instance-no-result"
  >
    <Boxes />
    <span className="text-center text-sm">{message}</span>
  </div>
);

export default NoResult;