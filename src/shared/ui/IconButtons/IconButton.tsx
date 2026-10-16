import { ReactElement } from "react";
import "./IconButton.css";

const iconButtonClasses = {
  default: "icon-btn-default",
} as const;

interface Props {
  type?: "button" | "submit";
  children: ReactElement;
  variant?: keyof typeof iconButtonClasses;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function IconButton({
  type = "button",
  children,
  variant = "default",
  onClick,
}: Props) {
  return (
    <button
      type={type}
      className={`icon-btn ${iconButtonClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
