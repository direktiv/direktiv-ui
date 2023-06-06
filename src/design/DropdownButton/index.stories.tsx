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
    render: () => <DropdownButtonRoot>
        <PrimaryButton >
            Review
            <GitBranchIcon />
        </PrimaryButton>
        <DropdownButton >
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
    </DropdownButtonRoot>,
    tags: ["autodocs"],
};

export const Variants = () => (
    <DropdownButtonRoot>
        <PrimaryButton>
            Review
            <GitBranchIcon />
        </PrimaryButton>
        <DropdownButton >
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
)