import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { Breadcrumb, BreadcrumbRoot } from "../Breadcrumbs";
import { FC, PropsWithChildren } from "react";
import { File, Folder, LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "~/design/Popover";

import Button from "~/design/Button";
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

const FilepickerBreadcrumb: FC<PropsWithChildren> = ({ children }) => (
  <div className="px-2 py-1.5 text-sm font-semibold text-gray-9 dark:text-gray-dark-9">
    {children}
  </div>
);
const FilepickerBreadcrumb2: FC<PropsWithChildren> = ({ children }) => (
  <div className="sticky px-2 py-1.5 text-sm font-semibold text-gray-9 dark:text-gray-dark-9">
    <BreadcrumbRoot>
      <Breadcrumb noArrow>
        <a href="#">{children}</a>
      </Breadcrumb>
      <Breadcrumb>
        <a href="#">My-Namespace</a>
      </Breadcrumb>
      <Breadcrumb>
        <a href="#">Mainfolder</a>
      </Breadcrumb>
      <Breadcrumb>
        <a href="#">Subfolder</a>
      </Breadcrumb>
    </BreadcrumbRoot>
  </div>
);

const FilepickerList: FC<PropsWithChildren> = ({ children }) => (
  <div className="max-h-96 overflow-auto">{children}</div>
);

const FilepickerListItemText: FC<PropsWithChildren> = ({ children }) => (
  <div className="h-10 whitespace-nowrap px-3 py-2 text-sm">{children}</div>
);

function FilepickerListItem({
  text,
  icon: Icon,
}: {
  text: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className=" flex flex-col text-gray-11 focus:bg-gray-3 dark:text-gray-dark-11 dark:focus:bg-gray-dark-3"
      data-testid="filepicker-list-item"
    >
      <div className="flex items-center px-2">
        <div className="w-max">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <FilepickerListItemText>{text}</FilepickerListItemText>
      </div>
    </div>
  );
}

type FilepickerPropsType = PropsWithChildren & {
  className?: string;
};

const Filepicker: FC<FilepickerPropsType> = ({ className, children }) => (
  <div className={twMergeClsx("", className)}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" data-testid="filepicker-button">
          <div className="relative">Browse Files</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" bg-gray-1 dark:bg-gray-dark-1" align="start">
        {children}
      </PopoverContent>
    </Popover>
  </div>
);

export {
  Filepicker,
  FilepickerClose,
  FilepickerBreadcrumb,
  FilepickerBreadcrumb2,
  FilepickerList,
  FilepickerListItem,
  FilepickerListItemText,
  FilepickerSeparator,
};
