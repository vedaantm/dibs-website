"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

export const ANNOUNCEMENTS = [
  "Textbooks by the week — free to join",
  "Payment held by Dibs until handoff",
  "Pilot at NYU — .edu verified only",
  "Free handoff at Bobst, Kimmel & Palladium",
  "Pilot preview — sample listings",
];

const KEY = "dibs-announce-dismissed-v1";
const listeners = new Set<() => void>();

function readDismissed() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function useDismissed() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readDismissed,
    () => false,
  );
}

/** Ink bar above the header. Rotates every 5s with a fade, pauses on hover/focus, dismissible. */
export function AnnouncementBar() {
  const dismissed = useDismissed();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || dismissed) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 5000);
    return () => clearInterval(t);
  }, [paused, dismissed]);

  if (dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    listeners.forEach((l) => l());
  };

  return (
    <section
      aria-label="Announcements"
      className="on-dark relative z-40 flex h-9 items-center justify-center bg-ink px-12 text-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="sr-only">{ANNOUNCEMENTS.join(". ")}</p>
      <div aria-hidden className="relative h-4 w-full max-w-xl">
        {ANNOUNCEMENTS.map((text, i) => (
          <span
            key={text}
            className={clsx(
              "eyebrow absolute inset-0 truncate text-center leading-4 transition-opacity duration-300 ease-house",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {text}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcements"
        className="absolute right-2 inline-flex size-8 items-center justify-center opacity-80 hover:opacity-100"
      >
        <X size={14} strokeWidth={1.25} aria-hidden />
      </button>
    </section>
  );
}
