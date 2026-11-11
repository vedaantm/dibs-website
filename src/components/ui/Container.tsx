import clsx from "clsx";
import type { ComponentProps, ElementType } from "react";

type Props<T extends ElementType> = { as?: T } & ComponentProps<T>;

/** max-w 1600, 16px gutters on mobile, 24px from md up. */
export function Container<T extends ElementType = "div">({ as, className, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={clsx("mx-auto w-full max-w-[1600px] px-4 md:px-6", className)} {...rest} />;
}
