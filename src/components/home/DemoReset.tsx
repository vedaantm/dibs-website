"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useBag } from "@/store/bag";
import { useCheckout } from "@/store/checkout";
import { useOrders } from "@/store/orders";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

/** Pitch helper, not linked anywhere: /?demo=reset clears bag, wishlist, orders and checkout progress. */
export function DemoReset() {
  const params = useSearchParams();
  const router = useRouter();
  const reset = params.get("demo") === "reset";
  useEffect(() => {
    if (!reset) return;
    useBag.getState().clear();
    useWishlist.getState().clear();
    useOrders.getState().clear();
    useCheckout.getState().reset();
    useUI.getState().closeAll();
    try {
      sessionStorage.removeItem("dibs-checkout-v1");
    } catch {}
    router.replace("/");
  }, [reset, router]);
  return null;
}
