import { TableCell, TableRow } from "~/design/Table";

import { GroupSchemaType } from "~/api/enterprise/groups/schema";
import PermissionsInfo from "../components/PermissionsInfo";

const Row = ({ group }: { group: GroupSchemaType }) => (
  <TableRow className="hover:bg-inherit dark:hover:bg-inherit">
    <TableCell>{group.group}</TableCell>
    <TableCell>{group.description}</TableCell>
    <TableCell>
      <PermissionsInfo permissions={group.permissions} />
    </TableCell>
  </TableRow>
);

export default Row;
