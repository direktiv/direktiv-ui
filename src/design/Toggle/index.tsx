"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";

import clsx from "clsx";

export interface VariantProps {
  outline?: boolean;
  size?: "sm" | "lg";
}
const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps
>(({ className, outline, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={clsx(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors   focus:outline-none  focus:ring-2  focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "text-gray-11 hover:bg-gray-2 hover:text-gray-12 focus:ring-gray-7 focus:ring-offset-gray-1 data-[state=on]:bg-gray-4 data-[state=on]:text-gray-11",
      "dark:hover:bg-gray-dark-2 dark:focus:ring-gray-dark-7  dark:data-[state=on]:bg-gray-dark-4",
      "dark:text-gray-dark-11 dark:hover:text-gray-dark-12 dark:focus:ring-offset-gray-dark-1 dark:data-[state=on]:text-gray-dark-11",
      outline &&
        "border border-gray-4 hover:bg-gray-2 dark:border-gray-dark-4 dark:bg-gray-dark-2",
      size === "sm" && "h-9 px-2.5",
      size === "lg" && "h-11 px-5",
      !size && "h-10 px-3",
      className
    )}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
