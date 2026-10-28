import "./Textarea.css";

const textareaVariantClasses = {
  default: "textarea-default",
  "with-iconbtn": "textarea-rounded",
  lined: "textarea-lined",
} as const;

type VariantKey = keyof typeof textareaVariantClasses;

interface Props<T, K> extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "onKeyDown"
> {
  variant?: VariantKey | VariantKey[];
  onChange: (e: T) => void;
  onKeyDown?: (e: K) => void;
  value?: string;
}

export function Textarea<
  T extends string,
  K extends React.KeyboardEvent<HTMLTextAreaElement>,
>({
  value = "",
  variant = "default",
  onChange,
  onKeyDown,
  ...rest
}: Props<T, K>) {
  const variants = Array.isArray(variant) ? variant : [variant];
  const variantClassName = variants
    .map((v) => textareaVariantClasses[v])
    .join(" ");
  return (
    <textarea
      {...rest}
      value={value}
      className={`textarea ${variantClassName}`}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(e.currentTarget.value as T)
      }
      onKeyDown={onKeyDown}
    />
  );
}
