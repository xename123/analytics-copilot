import "./Loader.css";

interface Props {
  text?: string;
}

export function Loader({ text }: Props) {
  return (
    <div className="loader">
      {text ?? ""}
      <div className="loader__circle"></div>
    </div>
  );
}
