import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../Dropdown";
import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react';

import Button from "../Button";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export const DropdownButtonRoot = React.forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => (
        <button
            ref={ref}
            {...props}
            className={clsx(
                "flex-row flex w-fit",
                "disabled:pointer-events-none disabled:opacity-50",
            )}
        >
            <DropdownMenu>
                {children}
            </DropdownMenu>
        </button>
    )
);
DropdownButtonRoot.displayName = "DropdownButtonRoot";

const ButtonFragmentClass = clsx(
    "dark:bg-gray-dark-1 dark:hover:bg-gray-dark-3 dark:active:bg-gray-dark-4  dark:text-gray-dark-11 dark:border-gray-dark-10",
    "bg-gray-1 hover:bg-gray-3 active:bg-gray-4 text-gray-11 border-gray-10",
    "active:scale-100 active:outline-none active:ring-0 active:ring-offset-0",
    "border-2 focus:ring-0 focus:ring-offset-0",
)

export const PrimaryButton = React.forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => {
        return (
            <Button
                variant="destructive"
                ref={ref} {...props}
                className={clsx(
                    "flex flex-row rounded-none rounded-l-md",
                    ButtonFragmentClass,
                )
                }
            >
                {children}
            </Button>
        )
    }
);
PrimaryButton.displayName = "PrimaryButton"

export const DropdownButton = React.forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
    ({ children, ...props }, ref) => (
        <div className="flex">
            <DropdownMenuTrigger asChild ref={ref} {...props}>
                <Button icon className={clsx(
                    ButtonFragmentClass,
                    "rounded-none rounded-r-md border-l-0"
                )}>
                    <ChevronDown />
                </Button>
            </DropdownMenuTrigger>
            {children && <DropdownMenuContent className="w-56">
                {children}
            </DropdownMenuContent>}
        </div>
    )
)
DropdownButton.displayName = "DropdownButton";