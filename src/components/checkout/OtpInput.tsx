"use client";

import clsx from "clsx";
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  invalid?: boolean;
  /** Changing this replays the one-shot shake. */
  shakeKey?: number;
  describedBy?: string;
};

/** Six square boxes: auto-advance, paste support, backspace goes back. */
export function OtpInput({ value, onChange, length = 6, invalid, shakeKey = 0, describedBy }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const setAt = (i: number, ch: string) => {
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join("").slice(0, length));
  };

  return (
    <div
      key={shakeKey}
      role="group"
      aria-label="Verification code"
      aria-describedby={describedBy}
      className={clsx("flex gap-2", shakeKey > 0 && "animate-shake")}
    >
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={length}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "");
            if (d.length > 1) {
              // paste or autofill into one box
              const merged = (chars.slice(0, i).join("") + d).slice(0, length);
              onChange(merged);
              refs.current[Math.min(merged.length, length - 1)]?.focus();
              return;
            }
            setAt(i, d);
            if (d && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) {
              e.preventDefault();
              setAt(i - 1, "");
              refs.current[i - 1]?.focus();
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!d) return;
            e.preventDefault();
            onChange(d);
            refs.current[Math.min(d.length, length - 1)]?.focus();
          }}
          className={clsx(
            "size-11 rounded-[2px] border bg-bone text-center text-[18px] tabular-nums focus:border-ink focus:outline-none md:size-12",
            invalid ? "border-vermilion-deep" : "border-transparent",
          )}
        />
      ))}
    </div>
  );
}
