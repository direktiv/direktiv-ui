import { CopyIcon, EyeOff } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../Tooltip";

import Button from "../Button";
import { Card } from "../Card";
import CopyButton from "../CopyButton";
import InfoTooltip from "~/componentsNext/NamespaceCreate/InfoTooltip";
import Input from "../Input";
import { InputWithButton } from "./index";
import { useState } from "react";

const meta = {
  title: "Components/InputWithButton",
  component: InputWithButton,
} satisfies Meta<typeof InputWithButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ ...args }) => (
    <InputWithButton {...args}>
      <Input />
      <Button icon variant="ghost">
        <CopyIcon />
      </Button>
    </InputWithButton>
  ),
};

export const IconWithToolTip = () => {
  const [value, setValue] = useState("some value");
  return (
    <TooltipProvider>
      <InputWithButton>
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <Tooltip>
          <TooltipTrigger>
            <CopyButton
              value={value}
              buttonProps={{
                icon: true,
                variant: "ghost",
              }}
            />
          </TooltipTrigger>
          <TooltipContent>Copy Value</TooltipContent>
        </Tooltip>
      </InputWithButton>
    </TooltipProvider>
  );
};

export const FormExample1 = () => (
  <Card className="w-1/2 p-10">
    <form id="create-registry" className="flex flex-col space-y-5">
      <fieldset className="flex items-center gap-5">
        <label className="w-[150px] text-right" htmlFor="url">
          Create URL
        </label>
        <Input
          id="url"
          data-testid="new-registry-url"
          placeholder="https://example.com/registry"
        />
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label className="w-[150px] text-right" htmlFor="user">
          User
        </label>
        <Input
          id="user"
          data-testid="new-registry-user"
          placeholder="user-name"
        />
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label className="w-[150px] text-right" htmlFor="password">
          Password
        </label>
        <InputWithButton>
          <Input
            id="password"
            data-testid="new-registry-pwd"
            type="password"
            placeholder="password"
          />
          <Button type="button" icon variant="ghost">
            <EyeOff />
          </Button>
        </InputWithButton>
      </fieldset>

      <Button type="button" variant="ghost">
        Cancel
      </Button>

      <Button
        data-testid="registry-create-submit"
        type="submit"
        variant="primary"
      >
        Submit
      </Button>
    </form>
  </Card>
);

export const MirrorFormExample = () => (
  <Card className="w-1/2 p-10">
    <form className="flex flex-col gap-y-5">
      <fieldset className="flex items-center gap-5">
        <label
          className="w-[90px] overflow-hidden text-right text-[14px]"
          htmlFor="name"
        >
          Name
        </label>
        <Input
          id="name"
          data-testid="new-namespace-name"
          placeholder="name here"
        />
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label
          className="w-[90px] flex-row overflow-hidden text-right text-[14px]"
          htmlFor="url"
        >
          Url
        </label>
        <InputWithButton>
          <Input
            id="url"
            data-testid="new-namespace-url"
            placeholder="url placeholder"
          />
          <InfoTooltip>tool tip url</InfoTooltip>
        </InputWithButton>
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label
          className="w-[90px] overflow-hidden text-right text-[14px]"
          htmlFor="ref"
        >
          Ref
        </label>
        <InputWithButton>
          <Input
            id="ref"
            data-testid="new-namespace-ref"
            placeholder="ref here"
          />
          <InfoTooltip>tool tip ref</InfoTooltip>
        </InputWithButton>
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label
          className="w-[90px] overflow-hidden text-right text-[14px]"
          htmlFor="ref"
        >
          AuthType
        </label>
        <Select value="Option1">
          <SelectTrigger variant="outline" className="w-full">
            <SelectValue placeholder="AuthType" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="option1" value="Option1">
              Option1
            </SelectItem>
            <SelectItem key="option2" value="Option2">
              Option2
            </SelectItem>
          </SelectContent>
        </Select>
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label
          className="w-[90px] overflow-hidden text-right text-[14px]"
          htmlFor="token"
        >
          Token
        </label>
        <InputWithButton>
          <Input
            id="token"
            data-testid="new-namespace-token"
            placeholder="token placeholder"
          />
          <InfoTooltip>tool tip token</InfoTooltip>
        </InputWithButton>
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label
          className="w-[144px] overflow-hidden text-right text-[14px]"
          htmlFor="passphrase"
        >
          Passphrase
        </label>
        <InputWithButton>
          <Input
            id="passphrase"
            data-testid="new-namespace-passphrase"
            placeholder="passphrase"
          />
          <InfoTooltip>tool tip passphrase</InfoTooltip>
        </InputWithButton>
      </fieldset>
      <fieldset className="flex items-center gap-5">
        <label
          className="w-[144px] overflow-hidden text-right text-[14px]"
          htmlFor="public-key"
        >
          Public Key
        </label>
        <InputWithButton>
          <Input
            id="public-key"
            data-testid="new-namespace-pubkey"
            placeholder="public key here"
          />
          <InfoTooltip>tool tip public key</InfoTooltip>
        </InputWithButton>
      </fieldset>

      <fieldset className="flex items-center gap-5">
        <label
          className="w-[144px] overflow-hidden text-right text-[14px]"
          htmlFor="private-key"
        >
          PrivateKey
        </label>
        <InputWithButton>
          <Input
            id="private-key"
            data-testid="new-namespace-privatekey"
            placeholder="private key here"
          />
          <InfoTooltip>tooltip private key</InfoTooltip>
        </InputWithButton>
      </fieldset>
    </form>
  </Card>
);
