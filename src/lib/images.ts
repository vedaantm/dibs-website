import manifest from "@/data/image-manifest.json";
import type { GradientName } from "@/data/types";

const FILES = new Set<string>(manifest.files);

export type Credit = { name: string; profile: string; photo?: string };

export function hasImage(path: string | undefined): path is string {
  return Boolean(path && FILES.has(path));
}

export function imageCredits(): Record<string, Credit> {
  return manifest.credits as Record<string, Credit>;
}

export const gradientClass: Record<GradientName, string> = {
  lastlight: "bg-lastlight",
  dusk: "bg-dusk",
  turf: "bg-turf",
  chalk: "bg-chalk",
};

export const gradientIsDark: Record<GradientName, boolean> = {
  lastlight: true,
  dusk: true,
  turf: true,
  chalk: false,
};
