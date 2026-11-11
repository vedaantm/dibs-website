import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Archivo wght 300 / wdth 125, subset to the wordmark letters (OFL). */
export const wordmarkFont = readFile(join(process.cwd(), "src/assets/archivo-wordmark.ttf"));

const LASTLIGHT =
  "radial-gradient(120% 90% at 85% 10%, #F3B48B 0%, transparent 55%), radial-gradient(90% 80% at 10% 90%, #5A1F1B 0%, transparent 60%), radial-gradient(70% 60% at 40% 40%, #C8553D 0%, transparent 70%)";

const GRAIN = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}`;

/** Last-light wash + grain + DIBS wordmark, with an optional item line. */
export async function ogImage({ line, eyebrow }: { line: string; eyebrow?: string }) {
  const font = await wordmarkFont;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#F6F2EC",
          backgroundColor: "#16130F",
          backgroundImage: LASTLIGHT,
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={GRAIN} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", opacity: 0.85 }}>
          {eyebrow ?? "Pilot preview · NYU Washington Square"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: "Archivo", fontSize: 150, letterSpacing: 27, paddingLeft: 27, lineHeight: 1 }}>DIBS</div>
          <div style={{ fontFamily: "Archivo", fontSize: 26, letterSpacing: 8, paddingLeft: 8, marginTop: 18 }}>STUDENT RENTALS</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 34, textAlign: "center" }}>{line}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Archivo", data: font, weight: 300, style: "normal" }],
    },
  );
}
