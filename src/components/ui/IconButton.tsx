import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, Ref } from "react";
import { CountBadge } from "./CountBadge";

type Props = {
  icon: LucideIcon;
  label: string;
  /** Pass undefined until the client has hydrated so the badge never flashes a wrong number. */
  count?: number;
  /** Bump to replay the vermilion pulse on the badge. */
  pulseKey?: number;
  ref?: Ref<HTMLButtonElement>;
} & Omit<ComponentProps<"button">, "children">;

/** 40x40 hit area, lucide icon at strokeWidth 1.25 / 20px, optional navy count badge. */
export function IconButton({
  icon: Icon,
  label,
  count,
  pulseKey,
  className,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-label={count ? `${label}, ${count} item${count === 1 ? "" : "s"}` : label}
      className={clsx(
        "relative inline-flex size-10 shrink-0 items-center justify-center transition-opacity duration-200 hover:opacity-70",
        className,
      )}
      {...rest}
    >
      <Icon size={20} strokeWidth={1.25} aria-hidden />
      {count !== undefined && count > 0 && <CountBadge count={count} pulseKey={pulseKey} />}
    </button>
  );
}
