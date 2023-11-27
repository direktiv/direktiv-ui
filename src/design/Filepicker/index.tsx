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
  <div className="px-2 py-1.5 text-sm font-semibold text-gray-9 dark:text-gray-dark-9">
    {children}
  </div>
);

const FilepickerList: FC<PropsWithChildren> = ({ children }) => (
  <div className="max-h-96 overflow-auto">{children}</div>
);

const FilepickerListItemText: FC<PropsWithChildren> = ({ children }) => (
  <div className="h-10 whitespace-nowrap px-3 py-2 text-sm">{children}</div>
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

/*

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren & {
    variant?: "secondary" | "destructive" | "outline" | "success";
    icon?: "pending" | "complete" | "failed" | "crashed";
  };

const Badge: FC<BadgeProps> = ({
  className,
  variant,
  icon,
  children,
  ...props
}) => (
  <div

*/

/*
test

  // & ButtonProps({
  text,
  asChild,
  icon: Icon,
}: {
  asChild: boolean;
  text: string;
  icon: LucideIcon;
}) {
}) => {


*/

const FilepickerListItem: FC<FilepickerProps> = ({
  icon: Icon,
  asChild,
  children,
}) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp>
      <div className="w-full hover:bg-gray-3 dark:hover:bg-gray-dark-3">
        <div
          className="flex flex-col text-gray-11 focus:bg-gray-3 dark:text-gray-dark-11 dark:focus:bg-gray-dark-3"
          data-testid="filepicker-list-item"
        >
          <div className="flex items-center px-2">
            <div className="w-max">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <FilepickerListItemText>{children}</FilepickerListItemText>
          </div>
        </div>
      </div>
    </Comp>
  );
};

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
  FilepickerHeading,
  FilepickerList,
  FilepickerListItem,
  FilepickerListItemText,
  FilepickerSeparator,
};

/*

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(
  (
    {
      children,
      className,
      variant,
      size,
      circle,
      disabled,
      block,
      loading,
      icon,
      asChild,
      isAnchor = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // In case of asChild, if a child is not an anchor(e.g, label, span, etc) we are going to remove th click & hover effect
    const childIsNotAnAnchor = asChild && !isAnchor;

    return (
      <Comp
        className={twMergeClsx(
          "inline-flex items-center justify-center text-sm font-medium transition-colors active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-gray-4 focus:ring-offset-2 focus:ring-offset-gray-1",
          "dark:focus:ring-gray-dark-4 dark:focus:ring-offset-gray-dark-1",
          "disabled:pointer-events-none disabled:opacity-50",
          !variant && [
            "bg-gray-12 text-gray-1",
            "dark:bg-gray-dark-12 dark:text-gray-dark-1",
          ],
          variant === "destructive" && [
            "bg-danger-10 text-gray-1 hover:bg-danger-11",
            "dark:bg-danger-dark-10 dark:text-gray-dark-1 dark:hover:bg-danger-dark-11",
          ],
          variant === "outline" && [
            "border border-gray-4 bg-transparent hover:bg-gray-2",
            "dark:border-gray-dark-4 dark:hover:bg-gray-dark-2",
          ],
          variant === "primary" && [
            "bg-primary-500  text-gray-1 hover:bg-primary-600",
            "dark:text-gray-dark-1",
          ],
          variant === "ghost" && [
            "bg-transparent hover:bg-gray-3 data-[state=open]:bg-transparent",
            "hover:bg-gray-3",
            "dark:hover:bg-gray-dark-3 dark:data-[state=open]:bg-transparent",
          ],
          variant === "link" && [
            "bg-transparent text-gray-12 underline-offset-4 hover:bg-transparent hover:underline",
            "dark:text-gray-dark-12",
          ],
          size === "sm" && "h-6 gap-1 [&>svg]:h-4",
          !size && "h-9 gap-2 py-2 [&>svg]:h-5",
          size === "lg" && "h-11 gap-3 [&>svg]:h-6",
          icon && "px-2",
          !icon && size === "sm" && "px-3",
          !icon && !size && "px-4",
          !icon && size === "lg" && "px-6",
          circle && "rounded-full",
          !circle && "rounded-md",
          block && "w-full",
          childIsNotAnAnchor && "pointer-events-none active:scale-100",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

*/
