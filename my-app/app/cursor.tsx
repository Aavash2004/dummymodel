"use client";

import { useEffect } from "react";

export default function CursorEffect() {
  useEffect(() => {
    const updateCursor = (event: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    };

    window.addEventListener("mousemove", updateCursor);
    return () => window.removeEventListener("mousemove", updateCursor);
  }, []);

  return null;
}
