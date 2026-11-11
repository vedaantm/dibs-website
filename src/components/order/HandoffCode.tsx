"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Big 4-digit code + a square ink-on-paper QR the lender scans at pickup. */
export function HandoffCode({ orderId, code, size = "lg" }: { orderId: string; code: string; size?: "lg" | "sm" }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    QRCode.toString(`DIBS:${orderId}:${code}`, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#16130F", light: "#F6F2EC" },
    }).then((s) => live && setSvg(s));
    return () => {
      live = false;
    };
  }, [orderId, code]);

  const box = size === "lg" ? "size-40 md:size-48" : "size-28";
  return (
    <div className="flex flex-wrap items-center gap-6 md:gap-10">
      <div
        role="img"
        aria-label={`QR code for handoff code ${code}`}
        className={`${box} shrink-0 border border-line bg-paper [&_svg]:size-full`}
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      <div>
        <p className="eyebrow">Handoff code</p>
        <p className={`${size === "lg" ? "text-[64px] md:text-[88px]" : "text-[40px]"} font-light leading-none tracking-[0.12em] tabular-nums`}>
          {code}
        </p>
        <p className="mt-3 max-w-xs text-stone-deep">Show this at pickup. The lender scans it to start the photo check-in.</p>
      </div>
    </div>
  );
}
