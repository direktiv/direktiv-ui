import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "~/design/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Select";

import Button from "../../Button";
import { Card } from "../../Card";
import { EyeOff } from "lucide-react";
import InfoTooltip from "../../InfoToolTip";
import Input from "../../Input";
import { InputWithButton } from "../../InputWithButton";

const meta = {
  title: "Composition/Forms",
};

export default meta;

export const FormExample1 = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open Form</Button>
    </DialogTrigger>
    <DialogContent>
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

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            data-testid="registry-create-submit"
            type="submit"
            variant="primary"
          >
            Create
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
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
