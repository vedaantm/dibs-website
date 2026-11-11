import { ImageResponse } from "next/og";
import { wordmarkFont } from "@/lib/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Square ink tile with a thin, wide "D" (Archivo wght 300 wdth 125). */
export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#16130F", color: "#F6F2EC", fontFamily: "Archivo", fontSize: 46, paddingBottom: 4 }}>
        D
      </div>
    ),
    { ...size, fonts: [{ name: "Archivo", data: await wordmarkFont, weight: 300, style: "normal" }] },
  );
}
