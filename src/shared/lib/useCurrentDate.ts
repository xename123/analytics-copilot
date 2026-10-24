import { useEffect, useState } from "react";

export function useCurrentDate() {
  const [date, setDate] = useState<Date>(new Date());
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      setDate(new Date());
      const delay = 1000 - (Date.now() % 1000);
      timeoutId = setTimeout(tick, delay);
    }

    tick();
    return () => clearTimeout(timeoutId);
  }, []);
  return date;
}
