import { HTMLAttributes, ReactNode } from "react";
import "./Paragraph.css";

const paragraphVarianClasses = {
  default: "text-default",
  large: "text-large",
} as const;

type ParagraphVariant = keyof typeof paragraphVarianClasses;

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  variant?: ParagraphVariant;
  children: ReactNode;
}

export function Paragraph({
  variant = "default",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <p
      {...rest}
      className={`text ${paragraphVarianClasses[variant]} ${className}`}
    >
      {children}
    </p>
  );
}
