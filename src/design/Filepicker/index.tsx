import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { FC, PropsWithChildren } from "react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "~/design/Popover";

import Button from "~/design/Button";
import { LucideIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { twMergeClsx } from "~/util/helpers";

const FilepickerClose = PopoverClose;

const FilepickerSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={twMergeClsx(
      "my-1 h-px bg-gray-3 dark:bg-gray-dark-3",
      className
    )}
    {...props}
  />
));

FilepickerSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const FilepickerHeading: FC<PropsWithChildren> = ({ children }) => (
  <div className="px-2 text-sm font-semibold text-gray-9 dark:text-gray-dark-9">
    {children}
  </div>
);

const FilepickerList: FC<PropsWithChildren> = ({ children }) => (
  <div className="max-h-96 overflow-auto">{children}</div>
);

// asChild only works with exactly one child, so when asChild is true, we can not have a loading property
type AsChildOrLoading =
  | {
      loading?: boolean;
      asChild?: never;
    }
  | {
      loading?: never;
      asChild: true;
    };
export type FilepickerProps = PropsWithChildren & {
  icon: LucideIcon;
} & AsChildOrLoading;

const FilepickerListItem: FC<FilepickerProps> = ({
  icon: Icon,
  asChild,
  children,
}) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
      <div
        className="flex flex-col text-gray-11 focus:bg-gray-3 dark:text-gray-dark-11 dark:focus:bg-gray-dark-3"
        data-testid="filepicker-list-item"
      >
        <div className="flex items-center px-2">
          <div className="w-max">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="h-10 whitespace-nowrap px-3 py-2 text-sm">
            {children}
          </div>
        </div>
      </div>
    </Comp>
  );
};

type FilepickerPropsType = PropsWithChildren & {
  className?: string;
  buttonText: string;
};

const Filepicker: FC<FilepickerPropsType> = ({
  className,
  children,
  buttonText,
}) => (
  <div className={twMergeClsx("", className)}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" data-testid="filepicker-button">
          <div className="relative">{buttonText}</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-screen min-w-full bg-gray-1  dark:bg-gray-dark-1 lg:w-3/4"
        align="start"
      >
        {children}
      </PopoverContent>
    </Popover>
  </div>
);

export {
  Filepicker,
  FilepickerClose,
  FilepickerHeading,
  FilepickerList,
  FilepickerListItem,
  FilepickerSeparator,
};
