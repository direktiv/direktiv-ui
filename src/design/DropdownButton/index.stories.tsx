import type { Meta, StoryObj } from "@storybook/react";
import { DropdownButton, DropdownButtonRoot, PrimaryButton } from ".";
import { GitBranchIcon, Users } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem } from "../Dropdown";

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
        Review
        <GitBranchIcon />
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
  <DropdownButtonRoot>
    <PrimaryButton variant="destructive">
      Review
      <GitBranchIcon />
    </PrimaryButton>
    <DropdownButton variant="primary">
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
export const Disabled = () => (
  <DropdownButtonRoot disabled>
    <PrimaryButton variant="destructive">
      Review
      <GitBranchIcon />
    </PrimaryButton>
    <DropdownButton variant="primary">
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
  <div>
    <DropdownButtonRoot>
      <PrimaryButton variant="destructive" size="lg">
        LG Button
        <GitBranchIcon />
      </PrimaryButton>
      <DropdownButton variant="primary" size="lg">
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
      <PrimaryButton variant="destructive" size="sm">
        SM Button
        <GitBranchIcon />
      </PrimaryButton>
      <DropdownButton variant="primary" size="sm">
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
  </div>
);

export const ButtonBlock = () => (
  <DropdownButtonRoot block>
    <PrimaryButton variant="destructive">
      Review
      <GitBranchIcon />
    </PrimaryButton>
    <DropdownButton variant="primary">
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
  <DropdownButtonRoot block disabled>
    <PrimaryButton variant="destructive" loading>
      Review
      <GitBranchIcon />
    </PrimaryButton>
    <DropdownButton variant="primary">
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
