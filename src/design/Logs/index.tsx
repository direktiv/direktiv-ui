import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface LogEntryProps extends React.HTMLAttributes<HTMLDivElement> {
  time?: string;
  variant?: "success" | "error" | "warning" | "info";
  linewrap?: boolean;
}
export const Logs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} {...props} className={clsx(className)}>
    {children}
  </div>
));
Logs.displayName = "Logs";

export const LogEntry = React.forwardRef<HTMLDivElement, LogEntryProps>(
  ({ linewrap, time, variant, children, className, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className={twMerge(
        clsx(
          "p-2 text-[13px] text-black dark:text-white",
          "flex flex-row",
          variant === "error" &&
            "bg-danger-4 text-danger-10 dark:bg-danger-dark-4 dark:text-danger-dark-10",
          variant === "success" &&
            "bg-success-4 text-success-10 dark:bg-success-dark-4 dark:text-success-dark-10",
          variant === "warning" &&
            "bg-warning-4 text-warning-10 dark:bg-warning-dark-4 dark:text-warning-dark-10",
          variant === "info" &&
            "bg-info-4 text-info-10 dark:bg-info-dark-4 dark:text-info-dark-10",
          !linewrap && "overflow-scroll",
          className
        )
      )}
    >
      <div className="w-32 pr-4">{time}</div>
      <div
        className={clsx(
          !linewrap && "whitespace-nowrap",
          linewrap && "whitespace-pre-wrap"
        )}
      >
        {children}
      </div>
    </div>
  )
);
LogEntry.displayName = "LogEntry";
