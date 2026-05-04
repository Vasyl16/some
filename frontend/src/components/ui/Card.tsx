import type { PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/50 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
