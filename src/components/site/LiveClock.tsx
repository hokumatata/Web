"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <span className="tabular">--:--:-- UTC</span>;
  const utc = now.toISOString().slice(11, 19);
  const day = now.toUTCString().slice(0, 11);
  return (
    <span className="tabular text-ink-300">
      {day} · <span className="text-white">{utc} UTC</span>
    </span>
  );
}
