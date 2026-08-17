import { cn } from "@/app/lib/utils";
import { Children, cloneElement, isValidElement } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  asChild?: boolean;
}

export function Button({ className, variant = "default", asChild = false, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    default: "bg-zinc-950 text-white hover:bg-zinc-800",
    outline: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
    ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100",
  };

  if (asChild && Children.count(children) === 1) {
    const child = Children.only(children);

    if (isValidElement<{ className?: string }>(child)) {
      return cloneElement(child, {
        className: cn(base, variants[variant], className, child.props.className),
      });
    }
  }

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
