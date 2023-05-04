import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../../../design/Dropdown";
import { FC, useState } from "react";
import {
  GitBranchPlus,
  GitMerge,
  Play,
  Save,
  Settings,
  Undo,
  WrapText,
} from "lucide-react";

import Button from "../../../../../design/Button";
import { Card } from "../../../../../design/Card";
import Editor from "@monaco-editor/react";
import { RxChevronDown } from "react-icons/rx";
import { pages } from "../../../../../util/router/pages";
import { useNodeContent } from "../../../../../api/tree/query/get";
import { useTheme } from "../../../../../util/store/theme";
import { useUpdateWorkflow } from "../../../../../api/tree/mutate/updateWorkflow";

const WorkflowOverviewPage: FC = () => {
  const { path } = pages.explorer.useParams();
  const theme = useTheme();
  const { data } = useNodeContent({
    path,
  });

  const { mutate: updateWorkflow } = useUpdateWorkflow();

  const workflowData = data?.revision?.source && atob(data?.revision?.source);
  const [value, setValue] = useState<string | undefined>(workflowData);

  const handleEditorChange = (value: string | undefined) => {
    setValue(value);
  };

  return (
    <div className="flex grow flex-col space-y-4 p-4">
      <Card className="grow p-4">
        <Editor
          options={{
            scrollBeyondLastLine: false,
            cursorBlinking: "smooth",
            wordWrap: true,
            minimap: {
              enabled: false,
            },
          }}
          loading=""
          language="yaml"
          theme={theme === "dark" ? "vs-dark" : "vs-light"}
          value={workflowData}
          onChange={handleEditorChange}
        />
      </Card>
      <div className="flex justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings />
              Settings <RxChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>
              <WrapText className="mr-2 h-4 w-4" /> Word Wrap
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <WrapText className="mr-2 h-4 w-4" /> wordWrap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <GitMerge />
              Revisions <RxChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>
              <GitBranchPlus className="mr-2 h-4 w-4" /> Make Revision
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Undo className="mr-2 h-4 w-4" /> Revert
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline">
          <Play />
          Run
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (value && path) {
              updateWorkflow({
                path,
                fileContent: value,
              });
            }
          }}
        >
          <Save />
          Save
        </Button>
      </div>
    </div>
  );
};

export default WorkflowOverviewPage;
