import type { Metadata, Viewport } from "next";
import { archivo } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Dibs — Student rentals at NYU",
    template: "%s — Dibs",
  },
  description:
    "Rent textbooks, sports gear, cameras and formalwear from verified NYU students. Free to join. Payment held until the handoff.",
  applicationName: "Dibs",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Dibs Student Rentals",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#16130F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
