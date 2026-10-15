const optionVariantClasses = {
  default: "option-default",
  ultra: "option-ultra",
} as const;

type optionVariant = keyof typeof optionVariantClasses;

interface Props<T> {
  value: string;
  options: T[];
  selectClassName?: string;
  variant?: optionVariant;
  onChange: (value: T) => void;
}

export function Select<T extends string>({
  value,
  options,
  selectClassName = "",
  variant = "default",
  onChange,
}: Props<T>) {
  return (
    <select
      value={value}
      className={`select ${selectClassName}`}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        onChange(e.target.value as T)
      }
    >
      {options.map((item) => {
        return (
          <option
            key={item}
            className={`option ${optionVariantClasses[variant]}`}
          >
            {item}
          </option>
        );
      })}
    </select>
  );
}
