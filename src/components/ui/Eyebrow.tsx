import clsx from "clsx";
import type { ComponentProps, ElementType } from "react";

type Props<T extends ElementType> = { as?: T; tone?: "stone" | "paper" | "ink" } & ComponentProps<T>;

/** Uppercase 11px, tracking .08em, stone. */
export function Eyebrow<T extends ElementType = "p">({ as, tone = "stone", className, ...rest }: Props<T>) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag
      className={clsx(
        "eyebrow",
        tone === "stone" && "text-stone-deep",
        tone === "paper" && "text-paper/85",
        tone === "ink" && "text-ink",
        className,
      )}
      {...rest}
    />
  );
}
