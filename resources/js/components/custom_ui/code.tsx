import { JSX, ReactNode } from "react";

interface CodeProps {
  className?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
  [key: string]: any;
}

export function Code({  
    className,
  children,
  showCloseButton = true,
  ...props
}: CodeProps): JSX.Element {
  return (
    <div className="p-1">
        {children}
    </div>
  );
}