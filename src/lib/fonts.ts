import { Archivo } from "next/font/google";

/** Archivo variable (wght + wdth) for the DIBS wordmark only. */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
