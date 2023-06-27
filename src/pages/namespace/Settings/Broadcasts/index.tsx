import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "~/design/Table";

import { BroadcastsSchemaType } from "~/api/broadcasts/schema";
import { Card } from "~/design/Card";
import { Checkbox } from "~/design/Checkbox";
import { FC } from "react";
import { Radio } from "lucide-react";
import { TableBody } from "@mui/material";
import { useBroadcasts } from "~/api/broadcasts/query/useBroadcasts";
import { useTranslation } from "react-i18next";
import { useUpdateBroadcasts } from "~/api/broadcasts/mutate/updateBroadcasts";

// To do: instead of this, maybe make components for each cell type
const leftColClasses = "col-span-2";
const labelCellClasses = "place-self-center px-2";
const switchCellClasses = "place-self-center px-2";
const rowClasses = "grid grid-cols-5 gap-0 lg:pr-8 xl:pr-12";

const Broadcasts: FC = () => {
  const { t } = useTranslation();
  const { data } = useBroadcasts();
  const { mutate } = useUpdateBroadcasts();

  if (!data?.broadcast) return null;

  const broadcasts = data.broadcast;

  const toggleBroadcast = (key: keyof BroadcastsSchemaType) =>
    mutate({
      payload: {
        broadcast: {
          [key]: !broadcasts[key],
        },
      },
    });

  return (
    <>
      <div className="mb-3 flex flex-row justify-between">
        <h3 className="flex items-center gap-x-2 font-bold text-gray-10 dark:text-gray-dark-10">
          <Radio className="h-5" />
          {t("pages.settings.broadcasts.list.title")}
        </h3>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow className={rowClasses}>
              <TableHeaderCell className={leftColClasses}></TableHeaderCell>
              <TableHeaderCell className={labelCellClasses}>
                Success
              </TableHeaderCell>
              <TableHeaderCell className={labelCellClasses}>
                Started
              </TableHeaderCell>
              <TableHeaderCell className={labelCellClasses}>
                Failed
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow className={rowClasses}>
              <TableCell className={leftColClasses}>Instance</TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["instance.success"]}
                  onClick={() => toggleBroadcast("instance.success")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["instance.started"]}
                  onClick={() => toggleBroadcast("instance.started")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["instance.failed"]}
                  onClick={() => toggleBroadcast("instance.failed")}
                />
              </TableCell>
            </TableRow>
          </TableBody>

          <TableHead>
            <TableRow className={rowClasses}>
              <TableHeaderCell className={leftColClasses}></TableHeaderCell>
              <TableHeaderCell className={labelCellClasses}>
                Create
              </TableHeaderCell>
              <TableHeaderCell className={labelCellClasses}>
                Update
              </TableHeaderCell>
              <TableHeaderCell className={labelCellClasses}>
                Delete
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow className={rowClasses}>
              <TableCell className={leftColClasses}>Directory</TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["directory.create"]}
                  onClick={() => toggleBroadcast("directory.create")}
                />
              </TableCell>
              <TableCell>{/* not implemented: directory.update */}</TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["directory.delete"]}
                  onClick={() => toggleBroadcast("directory.delete")}
                />
              </TableCell>
            </TableRow>
            <TableRow className={rowClasses}>
              <TableCell className={leftColClasses}>Workflow</TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["workflow.create"]}
                  onClick={() => toggleBroadcast("workflow.create")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["workflow.update"]}
                  onClick={() => toggleBroadcast("workflow.update")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["workflow.delete"]}
                  onClick={() => toggleBroadcast("workflow.delete")}
                />
              </TableCell>
            </TableRow>
            <TableRow className={rowClasses}>
              <TableCell className={leftColClasses}>
                Instance variable
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["instance.variable.create"]}
                  onClick={() => toggleBroadcast("instance.variable.create")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["instance.variable.update"]}
                  onClick={() => toggleBroadcast("instance.variable.update")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["instance.variable.delete"]}
                  onClick={() => toggleBroadcast("instance.variable.delete")}
                />
              </TableCell>
            </TableRow>
            <TableRow className={rowClasses}>
              <TableCell className={leftColClasses}>
                Namespace variable
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["namespace.variable.create"]}
                  onClick={() => toggleBroadcast("namespace.variable.create")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["namespace.variable.update"]}
                  onClick={() => toggleBroadcast("namespace.variable.update")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["namespace.variable.delete"]}
                  onClick={() => toggleBroadcast("namespace.variable.delete")}
                />
              </TableCell>
            </TableRow>
            <TableRow className={rowClasses}>
              <TableCell className={leftColClasses}>
                Workflow variable
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["workflow.variable.create"]}
                  onClick={() => toggleBroadcast("workflow.variable.create")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["workflow.variable.update"]}
                  onClick={() => toggleBroadcast("workflow.variable.update")}
                />
              </TableCell>
              <TableCell className={switchCellClasses}>
                <Checkbox
                  checked={broadcasts["workflow.variable.delete"]}
                  onClick={() => toggleBroadcast("workflow.variable.delete")}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </>
  );
};

export default Broadcasts;
