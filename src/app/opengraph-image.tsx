import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Dibs — Student rentals at NYU";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ line: "Student rentals at NYU" });
}
