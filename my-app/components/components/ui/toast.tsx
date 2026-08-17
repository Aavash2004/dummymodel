"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}

export function ToastViewport({ children }: { children: React.ReactNode }) {
  return <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2">{children}</div>;
}
