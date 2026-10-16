import "./Input.css";

const inputVariantClasses = {
  default: "input-default",
  "with-iconbtn": "input-rounded",
} as const;

interface Props<T> {
  variant?: keyof typeof inputVariantClasses;
  placeholder?: string;
  onChange: (e: T) => void;
  value?: string;
}

export function Input<T extends string>({
  value = "",
  variant = "default",
  placeholder = "",
  onChange,
}: Props<T>) {
  return (
    <input
      value={value}
      className={`input ${inputVariantClasses[variant]}`}
      placeholder={placeholder}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.currentTarget.value as T)
      }
    />
  );
}
