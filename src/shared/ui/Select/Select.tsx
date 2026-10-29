const selectVariantClasses = {
  default: "select-default",
} as const;

type selectVariant = keyof typeof selectVariantClasses;

interface Props<T> extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  value: string;
  options: T[];
  variant?: selectVariant;
  onChange: (value: T) => void;
}

export function Select<T extends string>({
  value,
  options,
  className = "",
  variant = "default",
  onChange,
  ...rest
}: Props<T>) {
  return (
    <select
      {...rest}
      value={value}
      className={`select ${selectVariantClasses[variant]} ${className}`}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        onChange(e.currentTarget.value as T)
      }
    >
      {options.map((item) => {
        return (
          <option className={`option `} key={item}>
            {item}
          </option>
        );
      })}
    </select>
  );
}
