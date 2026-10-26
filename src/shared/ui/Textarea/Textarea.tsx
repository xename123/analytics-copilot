import "./Textarea.css";

const textareaVariantClasses = {
  default: "textarea-default",
  "with-iconbtn": "textarea-rounded",
  lined: "textarea-lined",
} as const;

interface Props<T> extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "className"
> {
  variant?: keyof typeof textareaVariantClasses;
  onChange: (e: T) => void;
  value?: string;
}

export function Textarea<T extends string>({
  value = "",
  variant = "default",
  onChange,
  ...rest
}: Props<T>) {
  return (
    <textarea
      {...rest}
      value={value}
      className={`textarea ${textareaVariantClasses[variant]}`}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(e.currentTarget.value as T)
      }
    />
  );
}
