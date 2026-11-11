"use client";

import { useId } from "react";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (n: number) => string;
  label: string;
};

/** Two overlaid native range inputs (keyboard accessible), hairline track, ink fill between. */
export function DualRange({ min, max, step = 1, value, onChange, format = String, label }: Props) {
  const id = useId();
  const [lo, hi] = value;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex justify-between tabular-nums" aria-hidden>
        <span>{format(lo)}</span>
        <span>
          {format(hi)}
          {hi >= max ? "+" : ""}
        </span>
      </div>
      <div className="dual-range relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <label htmlFor={`${id}-lo`} className="sr-only">
          {label} minimum
        </label>
        <input
          id={`${id}-lo`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-valuetext={format(lo)}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        />
        <label htmlFor={`${id}-hi`} className="sr-only">
          {label} maximum
        </label>
        <input
          id={`${id}-hi`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-valuetext={format(hi)}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        />
      </div>
    </div>
  );
}
