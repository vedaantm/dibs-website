"use client";

import clsx from "clsx";
import { addDays, addWeeks, format, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import type { Item } from "@/data/types";
import { fromISODate, today as todayFn } from "@/lib/dates";
import { useHydrated } from "@/lib/hooks";
import {
  SEMESTER_WEEKS,
  nextAvailableSemester,
  nextAvailableStart,
  nextAvailableWeekend,
  quoteRental,
  type Quote,
  type Selection,
} from "@/lib/pricing";
import { QuoteBox } from "./QuoteBox";

export type RateMode = "day" | "weekend" | "week" | "semester";

type Props = {
  item: Item;
  value: Selection | null;
  onChange: (sel: Selection | null, quote: Quote | null) => void;
  /** Force a single month (Quick Dibs, bag edits). */
  compact?: boolean;
  /** Hide the quote box (when the parent renders its own). */
  hideQuote?: boolean;
  className?: string;
  idPrefix?: string;
};

const MODE_LABEL: Record<RateMode, string> = { day: "Day", weekend: "Weekend", week: "Week", semester: "Semester" };

export function availableModes(item: Item): RateMode[] {
  return (["day", "weekend", "week", "semester"] as RateMode[]).filter((m) => item.rates[m] !== undefined);
}

function modeFromQuote(q: Quote | null, modes: RateMode[]): RateMode | null {
  if (!q?.ok) return null;
  const m: RateMode = q.bestPlan === "mixed" ? "day" : q.bestPlan;
  return modes.includes(m) ? m : null;
}

/** Selection → quote, using today's date. */
export function quoteFor(item: Item, sel: Selection | null): Quote | null {
  if (!sel) return null;
  return quoteRental(item, sel);
}

/** Computes a preset selection for a rate mode starting from the next available date. */
export function presetFor(item: Item, mode: RateMode, from: Date): Selection | null {
  if (mode === "weekend") {
    const wk = nextAvailableWeekend(item, from);
    return wk ? { start: wk.start, end: wk.end } : null;
  }
  if (mode === "week") {
    const s = nextAvailableStart(item, from, 7);
    return s ? { start: s, end: addDays(s, 6) } : null;
  }
  if (mode === "semester") {
    const s = nextAvailableSemester(item, from);
    return s ? { plan: "semester", start: s } : null;
  }
  const s = nextAvailableStart(item, from, 1);
  return s ? { start: s, end: s } : null;
}

function PickerSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="h-10 border border-line" />
      <div className={clsx("bg-bone/60", compact ? "h-[300px]" : "h-[320px]")} />
    </div>
  );
}

/**
 * House-styled range calendar with DAY · WEEKEND · WEEK · SEMESTER presets and a live quote.
 * Clicking picks a free range; WEEKEND snaps to that Fri–Sun; SEMESTER picks a start date.
 */
export function RentalDatePicker({ item, value, onChange, compact, hideQuote, className, idPrefix = "rdp" }: Props) {
  const hydrated = useHydrated();
  const modes = availableModes(item);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const quote = useMemo(() => quoteFor(item, value), [item, value]);
  const [mode, setMode] = useState<RateMode>(() => modeFromQuote(quote, modes) ?? (modes.includes("day") ? "day" : modes[0]));
  const [month, setMonth] = useState<Date | undefined>(value ? startOfDay(value.start) : undefined);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hydrated]);

  if (!hydrated) return <PickerSkeleton compact={compact} />;

  const now = todayFn();
  const twoMonths = !compact && width >= 520;
  const cell = Math.max(32, Math.min(48, Math.floor((twoMonths ? (width - 24) / 2 : width) / 7)));
  const blocked = item.blockedDates.map(fromISODate);

  const emit = (sel: Selection | null) => {
    const q = quoteFor(item, sel);
    const m = modeFromQuote(q, modes);
    if (m && !(sel && "plan" in sel)) setMode(m);
    onChange(sel, q);
  };

  const choose = (m: RateMode) => {
    setMode(m);
    setPendingStart(null);
    const sel = presetFor(item, m, now);
    if (sel) setMonth(startOfDay(sel.start));
    emit(sel);
  };

  const onDayClick = (day: Date) => {
    const d = startOfDay(day);
    if (mode === "semester") {
      setPendingStart(null);
      emit({ plan: "semester", start: d });
      return;
    }
    if (mode === "weekend" && item.rates.weekend !== undefined) {
      const dow = d.getDay();
      const fri = dow === 5 ? d : dow === 6 ? addDays(d, -1) : dow === 0 ? addDays(d, -2) : addDays(d, (5 - dow + 7) % 7);
      const start = isBefore(fri, now) ? d : fri;
      setPendingStart(null);
      emit({ start, end: addDays(fri, 2) });
      return;
    }
    // free range: first click = pickup, second = return
    if (!pendingStart) {
      setPendingStart(d);
      onChange(null, null);
      return;
    }
    if (isBefore(d, pendingStart)) {
      setPendingStart(d);
      return;
    }
    const start = pendingStart;
    setPendingStart(null);
    emit({ start, end: d });
  };

  const selected: DateRange | undefined = pendingStart
    ? { from: pendingStart, to: undefined }
    : value
      ? { from: startOfDay(value.start), to: "plan" in value ? addWeeks(startOfDay(value.start), SEMESTER_WEEKS) : startOfDay(value.end) }
      : undefined;

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {modes.length > 1 && (
        <div role="radiogroup" aria-label="Rental length" className="grid border border-line" style={{ gridTemplateColumns: `repeat(${modes.length}, 1fr)` }}>
          {modes.map((m, i) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => choose(m)}
              className={clsx(
                "label h-10 transition-colors duration-200 ease-house",
                i > 0 && "border-l border-line",
                mode === m ? "bg-ink text-paper" : "hover:bg-bone",
              )}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      )}

      <p className="text-[12px] text-stone-deep" id={`${idPrefix}-help`}>
        {mode === "semester"
          ? `Pick a start date. Returns ${SEMESTER_WEEKS} weeks later.`
          : mode === "weekend"
            ? "Pick any day; we'll book that Fri–Sun."
            : pendingStart
              ? `Pickup ${format(pendingStart, "EEE, MMM d")}. Now pick a return date.`
              : item.rates.day === undefined
                ? "Pick pickup and return dates. Billed in whole weeks."
                : "Pick a pickup date, then a return date."}
      </p>

      <div ref={wrapRef} className="w-full">
        {width > 0 && (
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={() => {}}
            onDayClick={onDayClick}
            month={month}
            onMonthChange={setMonth}
            startMonth={now}
            endMonth={addDays(now, 240)}
            numberOfMonths={twoMonths ? 2 : 1}
            disabled={[{ before: now }, ...blocked]}
            modifiers={{ blocked }}
            modifiersClassNames={{ blocked: "dibs-blocked" }}
            showOutsideDays={false}
            fixedWeeks
            aria-labelledby={`${idPrefix}-help`}
            labels={{
              // "Sunday, November 1, 2026": contains the visible number, plus state
              labelDayButton: (date, m) =>
                `${format(date, "EEEE, MMMM d, yyyy")}${m.today ? ", today" : ""}${m.blocked ? ", booked" : ""}${m.selected ? ", selected" : ""}`,
            }}
            className="dibs-cal"
            style={{ ["--cell" as string]: `${cell}px` }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft size={18} strokeWidth={1.25} aria-hidden />
                ) : (
                  <ChevronRight size={18} strokeWidth={1.25} aria-hidden />
                ),
            }}
          />
        )}
      </div>

      {!hideQuote && <QuoteBox item={item} quote={quote} pending={Boolean(pendingStart)} />}
    </div>
  );
}
