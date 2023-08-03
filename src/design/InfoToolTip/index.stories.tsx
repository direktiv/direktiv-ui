import type { Meta, StoryObj } from "@storybook/react";
import InfoTooltip from "../InfoToolTip";

const meta = {
  title: "Components/InfoTooltip",
  component: InfoTooltip,
} satisfies Meta<typeof InfoTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <InfoTooltip>tool tip url</InfoTooltip>,
};
