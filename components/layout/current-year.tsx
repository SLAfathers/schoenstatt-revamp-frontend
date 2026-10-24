"use client";

import { useEffect, useState } from "react";

// Starts with the server/build year, then switches to the visitor's browser year.
export function CurrentYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span suppressHydrationWarning>{year}</span>;
}
