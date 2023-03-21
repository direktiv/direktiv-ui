import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./index";

const meta = {
  title: "Components (next)/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms1" {...args} />
    </div>
  ),
  argTypes: {
    size: {
      description: "select size",
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      type: { name: "string", required: false },
    },
    variant: {
      description: "select variant",
      control: "select",
      options: [
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "accent",
      ],
      type: { name: "string", required: false },
    },
    disabled: {
      description: "enable/disable the checkbox",
      type: { name: "boolean", required: false },
    },
  },
};
export function CheckboxWithText() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms2" />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms2"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export function DisabledCheckbox() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms-disabled-1" disabled />
    </div>
  );
}

export function CheckboxSizes() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox size="md" />
      <Checkbox size="lg" />
      <Checkbox size="sm" />
      <Checkbox size="xs" />
      <Checkbox />
    </div>
  );
}

export function CheckboxVariants() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox variant="primary" />
      <Checkbox variant="secondary" />
      <Checkbox variant="success" />
      <Checkbox variant="warning" />
      <Checkbox variant="error" />
      <Checkbox variant="info" />
      <Checkbox variant="accent" />
      <Checkbox />
    </div>
  );
}
