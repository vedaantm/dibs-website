"use client";

import { useSearchParams } from "next/navigation";
import { CollectionBody } from "./CollectionBody";
import type { Scope } from "./scope";

/** Reads filter/sort/search state from the URL (must sit inside Suspense). */
export function CollectionLive({ scope }: { scope: Scope }) {
  const sp = useSearchParams();
  return <CollectionBody scope={scope} query={sp.toString()} />;
}
