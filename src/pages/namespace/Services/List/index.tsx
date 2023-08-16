import { Dialog, DialogContent, DialogTrigger } from "~/design/Dialog";
import { Layers, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "~/design/Table";
import { useEffect, useState } from "react";

import Button from "~/design/Button";
import { Card } from "~/design/Card";
import CreateService from "./Create";
import Delete from "./Delete";
import NoResult from "./NoResult";
import Row from "./Row";
import { useNamespace } from "~/util/store/namespace";
import { useServices } from "~/api/services/query/get";
import { useTranslation } from "react-i18next";

const ServicesListPage = () => {
  const namespace = useNamespace();
  const { data: serviceList, isSuccess } = useServices();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteService, setDeleteService] = useState<string>();
  const [createService, setCreateService] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (dialogOpen === false) {
      setDeleteService(undefined);
      setCreateService(false);
    }
  }, [dialogOpen]);

  if (!namespace) return null;

  const showTable = (serviceList?.functions?.length ?? 0) > 0;
  const noResults = isSuccess && serviceList?.functions?.length === 0;

  const allAvailableNames =
    serviceList?.functions.map((service) => service.info.name) ?? [];

  const createNewButton = (
    <DialogTrigger asChild>
      <Button onClick={() => setCreateService(true)} variant="outline">
        <PlusCircle />
        {t("pages.services.list.empty.create")}
      </Button>
    </DialogTrigger>
  );

  return (
    <div className="flex grow flex-col gap-y-4 p-5">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <h3 className="flex grow items-center gap-x-2 pb-1 font-bold">
            <Layers className="h-5" />
            {t("pages.services.list.title")}
          </h3>
          {createNewButton}
        </div>
        <Card>
          <Table>
            <TableHead>
              <TableRow className="hover:bg-inherit dark:hover:bg-inherit">
                <TableHeaderCell>
                  {t("pages.services.list.tableHeader.name")}
                </TableHeaderCell>
                <TableHeaderCell className="w-32">
                  {t("pages.services.list.tableHeader.image")}
                </TableHeaderCell>
                <TableHeaderCell className="w-28">
                  {t("pages.services.list.tableHeader.scale")}
                </TableHeaderCell>
                <TableHeaderCell className="w-28">
                  {t("pages.services.list.tableHeader.size")}
                </TableHeaderCell>
                <TableHeaderCell className="w-40">
                  {t("pages.services.list.tableHeader.cmd")}
                </TableHeaderCell>
                <TableHeaderCell className="w-40">
                  {t("pages.services.list.tableHeader.state")}
                </TableHeaderCell>
                <TableHeaderCell className="w-0" />
              </TableRow>
            </TableHead>
            <TableBody>
              {showTable && (
                <>
                  {serviceList?.functions.map((service) => (
                    <Row
                      service={service}
                      key={service.serviceName}
                      setDeleteService={setDeleteService}
                    />
                  ))}
                </>
              )}
              {noResults && (
                <TableRow className="hover:bg-inherit dark:hover:bg-inherit">
                  <TableCell colSpan={6}>
                    <NoResult>{createNewButton}</NoResult>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
        <DialogContent>
          {deleteService && (
            <Delete
              service={deleteService}
              close={() => {
                setDialogOpen(false);
              }}
            />
          )}
          {createService && (
            <CreateService
              close={() => setDialogOpen(false)}
              unallowedNames={allAvailableNames}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesListPage;