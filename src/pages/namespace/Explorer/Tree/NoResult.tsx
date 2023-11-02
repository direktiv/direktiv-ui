import { Dialog, DialogContent, DialogTrigger } from "~/design/Dialog";
import { FC, useEffect, useState } from "react";
import { Folder, FolderOpen, Layers, Network, Play } from "lucide-react";

import Button from "~/design/Button";
import { NewDialog } from "./types";
import NewDirectory from "./NewDirectory";
import NewEndpoint from "./NewEndpoint";
import NewService from "./NewService";
import NewWorkflow from "./NewWorkflow";
import { NoResult as NoResultContainer } from "~/design/Table";
import { pages } from "~/util/router/pages";
import { twMergeClsx } from "~/util/helpers";
import useIsGatewayAvailable from "~/hooksNext/useIsGatewayAvailable";
import { useTranslation } from "react-i18next";

const EmptyDirectoryButton = () => {
  const { path } = pages.explorer.useParams();
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDialog, setSelectedDialog] = useState<NewDialog>();
  const isGatwayAvailable = useIsGatewayAvailable();

  useEffect(() => {
    if (dialogOpen === false) setSelectedDialog(undefined);
  }, [dialogOpen, selectedDialog]);

  const wideOverlay =
    !!selectedDialog && !["new-dir", "new-endpoint"].includes(selectedDialog);

  return (
    <div
      className={twMergeClsx(
        "grid gap-5",
        isGatwayAvailable ? "md:grid-cols-2" : "grid-cols-3"
      )}
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger
          asChild
          onClick={() => {
            setSelectedDialog("new-workflow");
          }}
        >
          <Button>
            <Play />
            {t("pages.explorer.tree.list.empty.createWorkflow")}
          </Button>
        </DialogTrigger>
        <DialogTrigger
          asChild
          onClick={() => {
            setSelectedDialog("new-service");
          }}
        >
          <Button>
            <Layers />
            {t("pages.explorer.tree.list.empty.createService")}
          </Button>
        </DialogTrigger>
        {isGatwayAvailable && (
          <DialogTrigger
            asChild
            onClick={() => {
              setSelectedDialog("new-endpoint");
            }}
          >
            <Button>
              <Network />
              {t("pages.explorer.tree.list.empty.createEndpoint")}
            </Button>
          </DialogTrigger>
        )}
        <DialogTrigger
          asChild
          onClick={() => {
            setSelectedDialog("new-dir");
          }}
        >
          <Button>
            <Folder />
            {t("pages.explorer.tree.list.empty.createDirectory")}
          </Button>
        </DialogTrigger>
        <DialogContent
          className={twMergeClsx(
            wideOverlay && "sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
          )}
        >
          {selectedDialog === "new-dir" && (
            <NewDirectory path={path} close={() => setDialogOpen(false)} />
          )}
          {selectedDialog === "new-workflow" && (
            <NewWorkflow path={path} close={() => setDialogOpen(false)} />
          )}
          {selectedDialog === "new-service" && (
            <NewService path={path} close={() => setDialogOpen(false)} />
          )}
          {selectedDialog === "new-endpoint" && (
            <NewEndpoint path={path} close={() => setDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NoResult: FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-y-5">
      <NoResultContainer icon={FolderOpen} button={<EmptyDirectoryButton />}>
        {t("pages.explorer.tree.list.empty.title")}
      </NoResultContainer>
    </div>
  );
};

export default NoResult;
