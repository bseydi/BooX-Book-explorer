import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: Props) {
  return (
    <select
      className={`w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm ${className}`}
      {...props}
    />
  );
}
