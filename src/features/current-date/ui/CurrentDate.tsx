import { useCurrentDate } from "@/shared/lib";
import { Paragraph } from "@/shared/ui";

export function CurrentDate() {
  const date = useCurrentDate().toLocaleString();
  return (
    <Paragraph variant="large">
      <span className="text-accent">Текущее время:&nbsp;</span>
      {date}
    </Paragraph>
  );
}
