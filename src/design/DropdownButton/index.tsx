import Button, { ButtonProps } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../Dropdown";
import React, { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface RootProps extends HTMLAttributes<HTMLDivElement> {
  block?: boolean;
  size?: "md" | "lg";
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

const ButtonColorClass = (variant: string | undefined) => {
  if (!variant) {
    return "dark:bg-gray-dark-1 dark:hover:bg-gray-dark-3 dark:active:bg-gray-dark-4  dark:text-gray-dark-11 dark:border-gray-dark-10 bg-gray-1 hover:bg-gray-3 active:bg-gray-4 text-gray-11 border-gray-10";
  } else {
    return "";
  }
};

export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement> & ButtonProps
>(({ variant, children, ...props }, ref) => (
  <Button
    variant={variant}
    ref={ref}
    {...props}
    className={clsx(
      "flex flex-1 flex-row rounded-none rounded-l-md",
      ButtonColorClass(variant),
      ButtonFragmentClass
    )}
  >
    {children}
  </Button>
));

PrimaryButton.displayName = "PrimaryButton";

export const DropdownButton = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(({ children, variant, ...props }, ref) => (
  <div className="flex ">
    <DropdownMenuTrigger asChild ref={ref} {...props}>
      <Button
        variant={variant}
        icon
        className={twMerge(
          ButtonFragmentClass,
          ButtonColorClass(variant),
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
