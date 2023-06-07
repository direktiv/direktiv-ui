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
  <div className="flex flex-col gap-2">
    <DropdownButtonRoot variant="primary">
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
    <DropdownButtonRoot variant="destructive">
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
    <DropdownButtonRoot variant="outline">
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
  </div>
);
export const Disabled = () => (
  <DropdownButtonRoot disabled>
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
        LG Button
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
    <DropdownButtonRoot size="md">
      <PrimaryButton>
        SM Button
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
  <DropdownButtonRoot loading>
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
);
