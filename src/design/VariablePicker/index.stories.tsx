import type { Meta, StoryObj } from "@storybook/react";
import { Variablepicker, VariablepickerItem } from "./";
import { ButtonBar } from "../ButtonBar";
import Input from "../Input";
import { useState } from "react";

const meta = {
  title: "Components/Variablepicker",
  component: Variablepicker,
} satisfies Meta<typeof Variablepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => (
    <Variablepicker {...args}>
      <VariablepickerItem value="File1">File1</VariablepickerItem>
      <VariablepickerItem value="File2">File2</VariablepickerItem>
      <VariablepickerItem value="File3">File3</VariablepickerItem>
    </Variablepicker>
  ),
  args: {
    buttonText: "Browse Files",
  },
  argTypes: {},
};

const variableList: string[] = [
  "image.jpg",
  "hello.yaml",
  "hello1.yaml",
  "Readme.txt",
  "Readme0.txt",
];

export const ThreeWithMappingItems = () => {
  const defaultValue = "defaultValue";
  const [inputValue, setInputValue] = useState(
    defaultValue ? defaultValue : ""
  );
  const buttonText = "Browse Variables";
  return (
    <ButtonBar>
      <Variablepicker
        buttonText={buttonText}
        onChange={(value) => setInputValue(value)}
      >
        {variableList.map((variable, index) => (
          <VariablepickerItem key={index} value={variable}>
            {variable}
          </VariablepickerItem>
        ))}
      </Variablepicker>
      <Input
        placeholder="Select a Variable"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
      />
    </ButtonBar>
  );
};
