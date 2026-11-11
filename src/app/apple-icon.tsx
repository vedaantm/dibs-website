import { ImageResponse } from "next/og";
import { wordmarkFont } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#16130F", color: "#F6F2EC", fontFamily: "Archivo", fontSize: 120, paddingBottom: 10 }}>
        D
      </div>
    ),
    { ...size, fonts: [{ name: "Archivo", data: await wordmarkFont, weight: 300, style: "normal" }] },
  );
}
