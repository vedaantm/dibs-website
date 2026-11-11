import clsx from "clsx";
import { formatDollars, type RateUnit } from "@/lib/format";

type Props = {
  amount: number;
  unit?: RateUnit;
  /** Retail value shown struck-through in stone: "Retail $499". */
  retail?: number;
  uppercase?: boolean;
  className?: string;
};

/** Tabular-nums price in the house format: "$24 / day". */
export function Price({ amount, unit, retail, uppercase, className }: Props) {
  const text = `${formatDollars(amount)}${unit ? ` / ${unit}` : ""}`;
  return (
    <span className={clsx("tabular-nums whitespace-nowrap", className)}>
      <span className={uppercase ? "uppercase" : undefined}>{text}</span>
      {retail !== undefined && (
        <span className="ml-2 text-stone-deep">
          <span className="sr-only">Retail value </span>
          <s aria-hidden>Retail {formatDollars(retail)}</s>
        </span>
      )}
    </span>
  );
}
