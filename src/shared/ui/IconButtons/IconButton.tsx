import { ReactElement } from "react";
import "./IconButton.css";

const iconButtonClasses = {
  default: "icon-btn-default",
} as const;

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "button" | "submit";
  children: ReactElement;
  variant?: keyof typeof iconButtonClasses;
}

export function IconButton({
  type = "button",
  children,
  variant = "default",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      className={`icon-btn ${iconButtonClasses[variant]}`}
    >
      {children}
    </button>
  );
}
