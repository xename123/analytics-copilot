import { ReactNode } from "react";
import "./Title.css";
const titleVariantsClasses = {
  small: "title-small",
  regular: "title-regular",
  medium: "title-medium",
  large: "title-large",
  big: "title-big",
} as const;

type TitleVariant = keyof typeof titleVariantsClasses;

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5";
  variant?: TitleVariant;
  children: ReactNode;
}
export function Title({
  as = "h2",
  variant = "medium",
  children,
  className = "",
  ...rest
}: TitleProps) {
  const Tag = as;

  return (
    <Tag
      {...rest}
      className={`title ${titleVariantsClasses[variant]} ${className}`}
    >
      {children}
    </Tag>
  );
}
