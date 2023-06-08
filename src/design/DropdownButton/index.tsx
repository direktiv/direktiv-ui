import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../Dropdown";
import React, { ButtonHTMLAttributes, HTMLAttributes } from "react";

import Button from "../Button";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface RootProps extends HTMLAttributes<HTMLDivElement> {
  block?: boolean;
  size?: "sm" | "lg";
  loading?: boolean;
  variant?: "destructive" | "outline" | "primary";
  disabled?: boolean;
}

export const DropdownButtonRoot = React.forwardRef<HTMLDivElement, RootProps>(
  ({ onClick, block, children, loading, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      onClick={onClick}
      className={clsx(
        block ? "w-full" : "w-fit",
        "flex flex-row",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      <DropdownMenu>
        {(Array.isArray(children) ? children : [children]).map(
          (child, index) => {
            if (index === 0) {
              return React.createElement(child.type, {
                ...{
                  ...props,
                  ...child.props,
                  key: `primaryButton`,
                  loading,
                },
              });
            }
            return React.createElement(child.type, {
              ...{
                ...props,
                ...child.props,
                disabled: props.disabled || loading,
                key: `dropdownButton`,
              },
            });
          }
        )}
      </DropdownMenu>
    </div>
  )
);

DropdownButtonRoot.displayName = "DropdownButtonRoot";

const ButtonFragmentClass = clsx(
  "active:scale-100 active:outline-none active:ring-0 active:ring-offset-0",
  "border focus:ring-0 focus:ring-offset-0"
);

export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <Button
    ref={ref}
    {...props}
    className={clsx(
      "flex flex-1 flex-row rounded-none rounded-l-md",
      ButtonFragmentClass
    )}
  >
    {children}
  </Button>
));

PrimaryButton.displayName = "PrimaryButton";

export const DropdownButton = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <div className="flex">
    <DropdownMenuTrigger asChild ref={ref} {...props}>
      <Button
        className={twMerge(
          ButtonFragmentClass,
          "rounded-none rounded-r-md border-l-0"
        )}
      >
        <ChevronDown />
      </Button>
    </DropdownMenuTrigger>
    {children && (
      <DropdownMenuContent className="w-56">{children}</DropdownMenuContent>
    )}
  </div>
));
DropdownButton.displayName = "DropdownButton";
