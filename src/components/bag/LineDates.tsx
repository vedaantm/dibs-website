import { addWeeks } from "date-fns";
import type { BagLine } from "@/lib/bag";
import { SEMESTER_WEEKS } from "@/lib/pricing";
import { fromISODate } from "@/lib/dates";
import { formatRange } from "@/lib/format";

/** "Fri, Nov 21 → Sun, Nov 23", or the semester span. */
export function lineDatesText(line: Pick<BagLine, "start" | "end" | "plan">): string {
  const start = fromISODate(line.start);
  if (line.plan === "semester") return `${formatRange(start, addWeeks(start, SEMESTER_WEEKS))} · Semester`;
  return formatRange(start, fromISODate(line.end ?? line.start));
}

export function LineDates({ line, className }: { line: BagLine; className?: string }) {
  return <span className={className}>{lineDatesText(line)}</span>;
}
