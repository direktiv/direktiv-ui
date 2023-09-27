import { Check, Copy, XCircle } from "lucide-react";
import { ComponentProps, FC, useEffect, useState } from "react";

import Button from "../Button";

type ButtonPropsType = ComponentProps<typeof Button>;

const CopyButton: FC<{
  testid?: string;
  value: string;
  buttonProps?: ButtonPropsType;
  children?: (copied: boolean) => React.ReactNode;
}> = ({
  value,
  buttonProps: { onClick, ...buttonProps } = {},
  children,
  testid,
}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (copied === true) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (error === true) {
      timeout = setTimeout(() => {
        setError(false);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [error]);

  const getIcon = () => {
    if (error) {
      return <XCircle />;
    }
    if (copied) {
      return <Check />;
    }
    return <Copy />;
  };

  return (
    <Button
      data-testid={testid}
      variant="ghost"
      onClick={(e) => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(value);
          setCopied(true);
        } else {
          setError(true);
          console.warn(
            "Clipboard API is not available, you migh not be on HTTPS"
          );
        }
        onClick?.(e);
      }}
      {...buttonProps}
    >
      {getIcon()}
      {children && children(copied)}
    </Button>
  );
};

export default CopyButton;
