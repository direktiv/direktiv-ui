import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import React, { FC, HTMLAttributes } from "react";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "info" | "success" | "warning" | "error";
  forwaredRef?: React.ForwardedRef<HTMLDivElement>;
  children?: React.ReactNode;
};

const Alert: FC<AlertProps> = ({ variant, className, children }) => (
  <div
    className={twMerge(
      clsx(
        "rounded-md p-2 shadow-sm",
        variant === "info" &&
          "bg-info-4 text-info-11 dark:bg-info-dark-4 dark:text-info-dark-11",
        variant === "error" &&
          "bg-danger-4 text-danger-11 dark:bg-danger-dark-4 dark:text-danger-dark-11",
        variant === "success" &&
          "bg-success-4 text-success-11 dark:bg-success-dark-4 dark:text-success-dark-11",
        variant === "warning" &&
          "bg-warning-4 text-warning-11 dark:bg-warning-dark-4 dark:text-warning-dark-11",
        variant === undefined &&
          "bg-gray-4 text-gray-11 dark:bg-gray-dark-4 dark:text-gray-dark-11",
        className
      )
    )}
  >
    <div className="flex items-center [&>svg]:inline">
      {variant === "success" && <CheckCircle />}
      {variant === "warning" && <AlertTriangle />}
      {variant === "info" && <Info />}
      {variant === "error" && <XCircle />}
      {variant === undefined && <Info />}
      <span className="px-2">{children}</span>
    </div>
  </div>
);

const AlertWithForwaredRef = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ ...props }, ref) => <Alert forwaredRef={ref} {...props} />
);

AlertWithForwaredRef.displayName = "Alert";

export default AlertWithForwaredRef;
