import clsx from "clsx";

type Props = {
  tone?: "ink" | "paper";
  size?: "sm" | "md" | "lg" | "xl";
  /** Hide the STUDENT RENTALS line (e.g. compact header). */
  compact?: boolean;
  className?: string;
};

const sizes = {
  sm: { mark: "text-[18px]", sub: "text-[7px]" },
  md: { mark: "text-[22px] md:text-[30px]", sub: "text-[7px] md:text-[8px]" },
  lg: { mark: "text-[44px]", sub: "text-[10px]" },
  xl: { mark: "text-[64px] md:text-[96px]", sub: "text-[11px] md:text-[14px]" },
};

/** DIBS wordmark: Archivo wght 300, wdth 125, tracked .18em, with STUDENT RENTALS underneath. */
export function Wordmark({ tone = "ink", size = "md", compact = false, className }: Props) {
  const s = sizes[size];
  return (
    <span
      className={clsx(
        "inline-flex flex-col items-center leading-none transition-colors duration-200",
        tone === "paper" ? "text-paper" : "text-ink",
        className,
      )}
    >
      {/* left padding balances the trailing letter-spacing so the mark sits optically centered */}
      <span className={clsx("wordmark block pl-[0.18em]", s.mark)}>DIBS</span>{" "}
      {!compact && (
        <span className={clsx("wordmark mt-[0.6em] block pl-[0.3em] !tracking-[0.3em]", s.sub)}>
          STUDENT RENTALS
        </span>
      )}
    </span>
  );
}
