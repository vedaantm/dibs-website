import clsx from "clsx";

/** 18px navy circle with a white 10px bold number, offset top-right (like Atticus). */
export function CountBadge({
  count,
  pulseKey,
  className,
}: {
  count: number;
  pulseKey?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      // re-keying replays the one-shot vermilion pulse
      key={pulseKey}
      className={clsx(
        "absolute right-0 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center overflow-hidden rounded-full bg-navy px-1 text-[10px] font-bold leading-none text-white tabular-nums",
        pulseKey ? "animate-pulse-once" : undefined,
        className,
      )}
    >
      <span key={count} className="animate-tick">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  );
}
