import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./index";

const meta = {
  title: "Components (next)/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4" {...args}>
      {`Some text goes here and there Some text goes here and there Some text goes
      here and there Some text goes here and there Some text goes here and there
      Some text goes here and there Some text goes here and there Some text goes
      here and there Some text goes here and there Some text goes here and there
      Some text goes here and there Some text goes here and there Some text goes
      here and there Some text goes here and there`}
    </ScrollArea>
  ),
  argTypes: {},
};
