import { LogEntry, Logs } from "./index";
import type { Meta, StoryObj } from "@storybook/react";
import Button from "../Button";
import { Card } from "../Card";
import Editor from "../Editor";
import { YamlSample } from "../Editor/languageSamples";
import { useState } from "react";

const meta = {
  title: "Components/Logs",
  component: Logs,
} satisfies Meta<typeof Logs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => (
    <Logs {...args}>
      <LogEntry time="12:342:23" variant="error">
        Hey this is the log
      </LogEntry>

      <LogEntry time="12:342:23" variant="error">
        Hey this is the log
      </LogEntry>
    </Logs>
  ),
};

export const LogVariants = () => (
  <Logs>
    <LogEntry time="12:34:23" variant="error">
      Hey this is the error log
    </LogEntry>

    <LogEntry time="12:34:23" variant="success">
      Hey this is the success log
    </LogEntry>

    <LogEntry time="12:34:23" variant="warning">
      Hey this is the warning log
    </LogEntry>
    <LogEntry time="12:34:23" variant="info">
      Hey this is the info log
    </LogEntry>
    <LogEntry time="12:34:23">Hey this is the info log</LogEntry>
  </Logs>
);

export const WrapLog = () => (
  <Card>
    <Logs linewrap>
      <LogEntry time="12:34:23" variant="success">
        This is going to be a very long line This is going to be a very long
        line This is going to be a very long line This is going to be a very
        long line This is going to be a very long line Next line Third line
      </LogEntry>
    </Logs>
  </Card>
);

export const NoWrapLog = () => (
  <Card>
    <Logs>
      <LogEntry time="12:34:23" variant="success">
        This is going to be a very long line This is going to be a very long
        line This is going to be a very long line This is going to be a very
        long line This is going to be a very long line Next line Third line
      </LogEntry>
      <LogEntry time="12:34:23" variant="error">
        New Entry
      </LogEntry>
    </Logs>
  </Card>
);

export const EditorVSLogsFontCompare = () => {
  const [lineWrap, setLineWrap] = useState(true);
  return (
    <div className="flex flex-col gap-y-5">
      <Button className="self-start" onClick={() => setLineWrap((old) => !old)}>
        {!lineWrap && "don't"} wrap long lines
      </Button>
      <div className="flex flex-row gap-5">
        <Card className="flex h-[500px] flex-1 overflow-x-auto">
          <Logs linewrap={lineWrap} className="grow">
            <LogEntry time="12:34:23">
              Preparing workflow triggered by api.
            </LogEntry>
            <LogEntry time="12:34:23">Starting workflow demo.yml.</LogEntry>
            <LogEntry time="12:34:23">
              Running state logic (step:1) -- helloworld
            </LogEntry>
            <LogEntry time="12:34:23">Transforming state data.</LogEntry>
            <LogEntry time="12:34:23" variant="warning">
              Warning: this is a very long line with a warning. this is a very
              long line with a warning. this is a very long line with a warning.
              this is a very long line with a warning. this is a very long line
              with a warning. this is a very long line with a warning. this is a
              very long line with a warning. this is a very long line with a
              warning. this is a very long line with a warning. this is a very
              long line with a warning. this is a very long line with a warning.
              this is a very long line with a warning.
            </LogEntry>
            <LogEntry time="12:34:23" variant="success">
              Workflow demo.yml completed.
            </LogEntry>
          </Logs>
        </Card>
        <Card className="h-[500px] flex-1 p-4">
          <Editor className="grow" value={YamlSample} />
        </Card>
      </div>
    </div>
  );
};
