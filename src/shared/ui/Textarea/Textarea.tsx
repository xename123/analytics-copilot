import "./Textarea.css";

const textareaVariantClasses = {
  default: "textarea-default",
  "with-iconbtn": "textarea-rounded",
  lined: "textarea-lined",
} as const;

type VariantKey = keyof typeof textareaVariantClasses;

interface Props extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> {
  variant?: VariantKey | VariantKey[];
  onChange: (e: string) => void;
  value?: string;
}

export function Textarea({
  value = "",
  variant = "default",
  className = "",
  onChange,
  ...rest
}: Props) {
  const variants = Array.isArray(variant) ? variant : [variant];
  const variantClassName = variants
    .map((v) => textareaVariantClasses[v])
    .join(" ");
  return (
    <textarea
      {...rest}
      value={value}
      className={`textarea ${variantClassName} ${className}`}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(e.currentTarget.value)
      }
    />
  );
}
