import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: Props) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <textarea
        className={cn(
          "w-full rounded-xl border bg-white/90 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400",
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
            : "border-slate-300/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
