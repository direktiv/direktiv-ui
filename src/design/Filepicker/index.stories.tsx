import { File, Folder, FolderUp } from "lucide-react";

import {
  Filepicker,
  FilepickerBreadcrumb,
  FilepickerBreadcrumb2,
  FilepickerList,
  FilepickerListItem,
  FilepickerListItemText,
  FilepickerSeparator,
} from "./";
import { Link } from "react-router-dom";
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
  index: number;
};

const items: Listitem[] = [
  { filename: "image.jpg", filelink: "/okay", index: 0 },
  { filename: "image1.jpg", filelink: "/okay", index: 1 },
  { filename: "image2.jpg", filelink: "/okay", index: 2 },
  { filename: "image3.jpg", filelink: "/okay", index: 3 },
  { filename: "hello.yaml", filelink: "/okay", index: 4 },
  { filename: "hello1.yaml", filelink: "/okay", index: 5 },
  { filename: "hello2.yaml", filelink: "/okay", index: 6 },
  { filename: "hello3.yaml", filelink: "/okay", index: 7 },
  { filename: "hello4.yaml", filelink: "/okay", index: 8 },
  { filename: "Readme.txt", filelink: "/okay", index: 9 },
  { filename: "Readme0.txt", filelink: "/okay", index: 10 },
  { filename: "Readme1.txt", filelink: "/okay", index: 11 },
  { filename: "Readme2.txt", filelink: "/okay", index: 12 },
  { filename: "Readme3.txt", filelink: "/okay", index: 13 },
  { filename: "Readme4.txt", filelink: "/okay", index: 14 },
  { filename: "Readme5.txt", filelink: "/okay", index: 15 },
  { filename: "Readme6.txt", filelink: "/okay", index: 16 },
  { filename: "Readme7.txt", filelink: "/okay", index: 17 },
  { filename: "Readme8.txt", filelink: "/okay", index: 18 },
  { filename: "Readme9.txt", filelink: "/okay", index: 19 },
  { filename: "Readme10.txt", filelink: "/okay", index: 20 },
  { filename: "Readme11.txt", filelink: "/okay", index: 21 },
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
      {items.map((element) => (
        <div key={element.index}>
          <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
            <FilepickerListItem icon={File} text={element.filename} />
          </div>
          <FilepickerSeparator />
        </div>
      ))}
    </FilepickerList>
  </Filepicker>
);
