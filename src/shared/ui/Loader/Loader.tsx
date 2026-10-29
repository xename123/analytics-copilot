import "./Loader.css";

interface Props {
  text?: string;
}

export function Loader({ text }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={text ?? "Загрузка"}
      className="loader"
    >
      {text ?? ""}
      <div className="loader__circle"></div>
    </div>
  );
}
