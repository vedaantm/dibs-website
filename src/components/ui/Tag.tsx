import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "ink" | "paper" | "solid" | "navy" | "vermilion";
  className?: string;
};

/** Uppercase 10px label with a 1px border, e.g. JUST LISTED, WEEKEND RATE. */
export function Tag({ children, tone = "ink", className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex h-5 items-center whitespace-nowrap border px-1.5 text-[10px] font-medium uppercase leading-none tracking-[0.06em]",
        tone === "ink" && "border-ink text-ink",
        tone === "paper" && "border-paper text-paper",
        tone === "solid" && "border-paper bg-paper text-ink",
        tone === "navy" && "border-navy text-navy",
        tone === "vermilion" && "border-vermilion-deep text-vermilion-deep",
        className,
      )}
    >
      {children}
    </span>
  );
}
