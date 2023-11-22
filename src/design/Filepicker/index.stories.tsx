import { File, Folder, FolderUp, LucideIcon } from "lucide-react";

import {
  Filepicker,
  FilepickerBreadcrumb,
  FilepickerBreadcrumb2,
  FilepickerClose,
  FilepickerList,
  FilepickerListItem,
  FilepickerListItemText,
  FilepickerSeparator,
} from "./";

import {
  NoPermissions,
  NoResult,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "~/design/Table";

import { CommandGroup } from "../Command";

// eslint-disable-next-line sort-imports
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Filepicker",
  component: Filepicker,
} satisfies Meta<typeof Filepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => (
    <Filepicker {...args}>content goes here...</Filepicker>
  ),
  argTypes: {},
};

export const FilepickerTest = () => (
  <Filepicker>
    <FilepickerBreadcrumb2>Home</FilepickerBreadcrumb2>
    <FilepickerSeparator />
    <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <FilepickerListItem icon={FolderUp} text=".." />
    </div>
    <FilepickerSeparator />
    <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <FilepickerListItem icon={Folder} text="Images" />
    </div>
    <FilepickerSeparator />
    <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <FilepickerListItem icon={Folder} text="Text" />
    </div>
    <FilepickerSeparator />
    <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <FilepickerListItem icon={File} text="Readme.txt" />
    </div>
    <FilepickerSeparator />
    <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <FilepickerListItem icon={File} text="Icon.jpg" />
    </div>
  </Filepicker>
);

type Listitem = {
  filename: string;
  filelink: string;
  value: number;
};

const items: Listitem[] = [
  { filename: "Readme.txt", filelink: "/okay", value: 0 },
  { filename: "Readme.txt", filelink: "/okay", value: 1 },
  { filename: "Readme.txt", filelink: "/okay", value: 2 },
  { filename: "Readme.txt", filelink: "/okay", value: 3 },
  { filename: "Readme.txt", filelink: "/okay", value: 4 },
  { filename: "Readme.txt", filelink: "/okay", value: 5 },
  { filename: "Readme.txt", filelink: "/okay", value: 6 },
  { filename: "Readme.txt", filelink: "/okay", value: 7 },
  { filename: "Readme.txt", filelink: "/okay", value: 8 },
  { filename: "Readme.txt", filelink: "/okay", value: 9 },
  { filename: "Readme0.txt", filelink: "/okay", value: 10 },
  { filename: "Readme1.txt", filelink: "/okay", value: 11 },
  { filename: "Readme2.txt", filelink: "/okay", value: 12 },
  { filename: "Readme3.txt", filelink: "/okay", value: 13 },
  { filename: "Readme0.txt", filelink: "/okay", value: 14 },
  { filename: "Readme1.txt", filelink: "/okay", value: 15 },
  { filename: "Readme2.txt", filelink: "/okay", value: 16 },
  { filename: "Readme3.txt", filelink: "/okay", value: 17 },
  { filename: "Readme0.txt", filelink: "/okay", value: 18 },
  { filename: "Readme1.txt", filelink: "/okay", value: 19 },
  { filename: "Readme2.txt", filelink: "/okay", value: 20 },
  { filename: "Readme3.txt", filelink: "/okay", value: 21 },
];

export const FilepickerWithManyItems = () => (
  <Filepicker>
    <FilepickerBreadcrumb2>Home</FilepickerBreadcrumb2>
    <FilepickerSeparator />
    <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <FilepickerListItem icon={FolderUp} text=".." />
    </div>
    <FilepickerSeparator />
    <FilepickerList>
      {items.map((index) => (
        <div key={index.value}>
          <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
            <FilepickerListItem icon={File} text={index.filename} />
          </div>
          <FilepickerSeparator />
        </div>
      ))}
    </FilepickerList>
  </Filepicker>
);

/*

{showIndicator ? (
    possibleNotifications.map(
      ([notificationType, notificationConfig], index, srcArr) => {

        */

/*

<CommandGroup>
  {folders.map((folder) => (
    <CommandItem
      name={folder.name}
      key={status.value}
      onSelect={(value) => {
        setSelectedStatus(
          statuses.find((priority) => priority.value === value) || null
        );
        setOpen(false);
      }}
    >
      <status.icon className={twMergeClsx("mr-2 h-auto w-4")} />
      <span>{status.label}</span>
    </CommandItem>
  ))}
</CommandGroup>;
{statuses.map((status) => (

    */

/*

<CommandGroup>
{statuses.map((status) => (
  <CommandItem
    value={status.value}
    key={status.value}
    onSelect={(value) => {
      setSelectedStatus(
        statuses.find((priority) => priority.value === value) ||
          null
      );
      setOpen(false);
    }}
  >
    <status.icon className={twMergeClsx("mr-2 h-auto w-4")} />
    <span>{status.label}</span>
  </CommandItem>
))}
</CommandGroup>

*/
