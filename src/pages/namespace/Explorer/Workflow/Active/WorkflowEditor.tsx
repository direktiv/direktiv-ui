import {
  Code,
  Columns,
  GitBranchPlus,
  Play,
  Rows,
  Save,
  Tag,
  Undo,
  Workflow,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "~/design/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/design/Dropdown";
import { FC, SVGProps, useEffect, useState } from "react";
import {
  LayoutsType,
  availableLayouts,
  useEditorActions,
  useEditorLayout,
} from "~/util/store/editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/design/Tooltip";

import Button from "~/design/Button";
import { ButtonBar } from "~/design/ButtonBar";
import { Card } from "~/design/Card";
import { CodeEditor } from "./CodeEditor";
import RunWorkflow from "../components/RunWorkflow";
import { RxChevronDown } from "react-icons/rx";
import { Toggle } from "~/design/Toggle";
import WorkflowDiagram from "~/design/WorkflowDiagram";
import { WorkspaceLayout } from "./WorkspaceLayout";
import { useCreateRevision } from "~/api/tree/mutate/createRevision";
import { useNodeContent } from "~/api/tree/query/node";
import { useRevertRevision } from "~/api/tree/mutate/revertRevision";
import { useTranslation } from "react-i18next";
import { useUpdateWorkflow } from "~/api/tree/mutate/updateWorkflow";

const layoutIcons: Record<LayoutsType, FC<SVGProps<SVGSVGElement>>> = {
  code: Code,
  diagram: Workflow,
  splitVertically: Columns,
  splitHorizontally: Rows,
};

export type NodeContentType = ReturnType<typeof useNodeContent>["data"];

const WorkflowEditor: FC<{
  data: NonNullable<NodeContentType>;
  path: string;
}> = ({ data, path }) => {
  const layout = useEditorLayout();
  const { setLayout } = useEditorActions();

  const { t } = useTranslation();
  const [error, setError] = useState<string | undefined>();
  const [hasUnsavedChanged, setHasUnsavedChanged] = useState(false);

  const workflowData = atob(data?.revision?.source ?? "");

  const { mutate: updateWorkflow, isLoading } = useUpdateWorkflow({
    onError: (error) => {
      error && setError(error);
    },
  });

  const [value, setValue] = useState(workflowData);

  const { mutate: createRevision } = useCreateRevision();
  const { mutate: revertRevision } = useRevertRevision();

  useEffect(() => {
    setHasUnsavedChanged(workflowData !== value);
  }, [value, workflowData]);

  const onSave = (toSave: string | undefined) => {
    if (toSave) {
      setError(undefined);
      updateWorkflow({
        path,
        fileContent: toSave,
      });
    }
  };

  return (
    <div className="relative flex grow flex-col space-y-4 p-5">
      <h3 className="flex items-center gap-x-2 font-bold">
        <Tag className="h-5" />
        {t("pages.explorer.workflow.headline")}
      </h3>
      <WorkspaceLayout
        layout={layout}
        diagramComponent={
          <Card className="flex grow">
            <WorkflowDiagram
              workflow={workflowData}
              orientation={
                layout === "splitVertically" ? "vertical" : "horizontal"
              }
            />
          </Card>
        }
        editorComponent={
          <CodeEditor
            value={value}
            setValue={setValue}
            createdAt={data.revision?.createdAt}
            error={error}
            hasUnsavedChanged={hasUnsavedChanged}
            onSave={onSave}
          />
        }
      />

      <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
        <ButtonBar>
          <TooltipProvider>
            {availableLayouts.map((lay) => {
              const Icon = layoutIcons[lay];
              return (
                <Tooltip key={lay}>
                  <TooltipTrigger asChild>
                    <div>
                      <Toggle
                        onClick={() => {
                          setLayout(lay);
                        }}
                        pressed={lay === layout}
                      >
                        <Icon />
                      </Toggle>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t(`pages.explorer.workflow.editor.layout.${lay}`)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </ButtonBar>
        <DropdownMenu>
          <ButtonBar>
            <Button
              variant="outline"
              disabled={hasUnsavedChanged}
              onClick={() => {
                createRevision({
                  path,
                });
              }}
              className="grow"
              data-testid="workflow-editor-btn-make-revision"
            >
              <GitBranchPlus />
              {t("pages.explorer.workflow.editor.makeRevision")}
            </Button>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={hasUnsavedChanged}
                variant="outline"
                data-testid="workflow-editor-btn-revision-drop"
              >
                <RxChevronDown />
              </Button>
            </DropdownMenuTrigger>
          </ButtonBar>
          <DropdownMenuContent className="w-60">
            <DropdownMenuItem
              onClick={() => {
                revertRevision({
                  path,
                });
              }}
              data-testid="workflow-editor-btn-revert-revision"
            >
              <Undo className="mr-2 h-4 w-4" />
              {t("pages.explorer.workflow.editor.revertToPrevious")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="workflow-editor-btn-run">
              <Play />
              {t("pages.explorer.workflow.editor.runBtn")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <RunWorkflow path={path} />
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            onSave(value);
          }}
          data-testid="workflow-editor-btn-save"
        >
          <Save />
          {t("pages.explorer.workflow.editor.saveBtn")}
        </Button>
      </div>
    </div>
  );
};

export default WorkflowEditor;
