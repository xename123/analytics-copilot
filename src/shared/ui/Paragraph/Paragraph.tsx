import { ReactNode } from "react";
import "./Paragraph.css";

const paragraphVarianClasses = {
  default: "text-default",
  large: "text-large",
} as const;

type ParagraphVariant = keyof typeof paragraphVarianClasses;

interface Props {
  variant?: ParagraphVariant;
  className?: string;
  children: ReactNode;
}

export function Paragraph({ variant = "default", className, children }: Props) {
  return (
    <p className={`text ${paragraphVarianClasses[variant]} ${className ?? ""}`}>
      {children}
    </p>
  );
}
