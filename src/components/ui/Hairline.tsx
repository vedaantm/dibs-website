import clsx from "clsx";

export function Hairline({ className, tone = "line" }: { className?: string; tone?: "line" | "paper" }) {
  return (
    <hr className={clsx("h-px w-full border-0", tone === "paper" ? "bg-paper/20" : "bg-line", className)} />
  );
}
