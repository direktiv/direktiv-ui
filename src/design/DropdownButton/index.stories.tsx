import { DropdownButton, DropdownButtonRoot, PrimaryButton } from ".";
import { DropdownMenuGroup, DropdownMenuItem } from "../Dropdown";
import { GitBranchIcon, Users } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import Button from "../Button";

const meta = {
  title: "Components/DropdownButton",
  component: DropdownButton,
} satisfies Meta<typeof DropdownButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownButtonRoot>
      <PrimaryButton>
        <GitBranchIcon />
        Review
      </PrimaryButton>
      <DropdownButton>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>New Team</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownButton>
    </DropdownButtonRoot>
  ),
  tags: ["autodocs"],
};

export const Variants = () => (
  <div className="flex flex-col gap-2">
    <DropdownButtonRoot variant="primary">
      <PrimaryButton>
        <GitBranchIcon /> Review
      </PrimaryButton>
      <DropdownButton>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>New Team</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownButton>
    </DropdownButtonRoot>
    <DropdownButtonRoot variant="destructive">
      <PrimaryButton>
        <GitBranchIcon /> Review
      </PrimaryButton>
      <DropdownButton></DropdownButton>
    </DropdownButtonRoot>
    <DropdownButtonRoot variant="outline">
      <PrimaryButton>
        <GitBranchIcon /> Review
      </PrimaryButton>
      <DropdownButton></DropdownButton>
    </DropdownButtonRoot>
    <DropdownButtonRoot>
      <PrimaryButton>
        <GitBranchIcon /> Review
      </PrimaryButton>
      <DropdownButton></DropdownButton>
    </DropdownButtonRoot>
  </div>
);
export const Disabled = () => (
  <DropdownButtonRoot disabled>
    <PrimaryButton>
      <GitBranchIcon /> Review
    </PrimaryButton>
    <DropdownButton>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Users className="mr-2 h-4 w-4" />
          <span>Team</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>New Team</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownButton>
  </DropdownButtonRoot>
);
export const ButtonSize = () => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap gap-5">
      <Button size="sm">
        <GitBranchIcon /> Small Button
      </Button>
      <Button>
        <GitBranchIcon /> Default Button
      </Button>
      <Button size="lg">
        <GitBranchIcon /> Large Button
      </Button>
    </div>

    <DropdownButtonRoot size="lg">
      <PrimaryButton>
        <GitBranchIcon /> Large Button
      </PrimaryButton>
      <DropdownButton>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>New Team</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownButton>
    </DropdownButtonRoot>
    <DropdownButtonRoot>
      <PrimaryButton>
        <GitBranchIcon /> Default Button
      </PrimaryButton>
      <DropdownButton />
    </DropdownButtonRoot>
    <DropdownButtonRoot size="sm">
      <PrimaryButton>
        <GitBranchIcon /> Small Button
      </PrimaryButton>
      <DropdownButton />
    </DropdownButtonRoot>
  </div>
);

export const ButtonBlock = () => (
  <DropdownButtonRoot block>
    <PrimaryButton>
      <GitBranchIcon />
      Review
    </PrimaryButton>
    <DropdownButton>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Users className="mr-2 h-4 w-4" />
          <span>Team</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>New Team</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownButton>
  </DropdownButtonRoot>
);

export const ButtonLoading = () => (
  <DropdownButtonRoot loading>
    <PrimaryButton>
      <GitBranchIcon /> Review
    </PrimaryButton>
    <DropdownButton>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Users className="mr-2 h-4 w-4" />
          <span>Team</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>New Team</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownButton>
  </DropdownButtonRoot>
);
