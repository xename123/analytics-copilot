import "./Input.css";

const inputVariantClasses = {
  default: "input-default",
  "with-iconbtn": "input-rounded",
} as const;

interface Props<T> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "className"
> {
  variant?: keyof typeof inputVariantClasses;
  onChange: (e: T) => void;
  value?: string;
}

export function Input<T extends string>({
  value = "",
  variant = "default",
  onChange,
  ...rest
}: Props<T>) {
  return (
    <input
      {...rest}
      value={value}
      className={`input ${inputVariantClasses[variant]}`}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.currentTarget.value as T)
      }
    />
  );
}
