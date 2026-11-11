"use client";

import clsx from "clsx";
import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/lib/hooks";

/** Fades content up 12px once when it enters the viewport (250ms). Static under reduced motion. */
export function Reveal({
  as: Tag = "div",
  className,
  children,
  id,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} id={id} className={clsx("reveal", className)}>
      {children}
    </Tag>
  );
}
