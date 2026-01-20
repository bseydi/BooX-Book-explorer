import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft";
};

export default function Card({ variant = "default", className = "", ...props }: Props) {
  const v =
    variant === "soft"
      ? "bg-white/80 backdrop-blur border border-zinc-200"
      : "bg-white border border-zinc-200";

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm ${v} ${className}`}
      {...props}
    />
  );
}
