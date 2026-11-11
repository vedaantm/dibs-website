import { addDays } from "date-fns";
import { fromISODate } from "./dates";

export type IcsEvent = {
  uid: string;
  title: string;
  /** yyyy-MM-dd */
  date: string;
  /** 24h start hour, local New York time */
  hour: number;
  durationMin: number;
  location: string;
  description: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

function local(date: string, hour: number, minutes = 0): string {
  const d = fromISODate(date);
  const total = hour * 60 + minutes;
  const day = addDays(d, Math.floor(total / 1440));
  const m = total % 1440;
  return `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}T${pad(Math.floor(m / 60))}${pad(m % 60)}00`;
}

/** RFC 5545 text escaping. */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** Builds an .ics calendar with the pickup and return events (America/New_York). */
export function buildIcs(events: IcsEvent[], stamp: Date): string {
  const dtstamp = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}${pad(stamp.getUTCSeconds())}Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dibs Student Rentals//Pilot//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=America/New_York:${local(e.date, e.hour)}`,
      `DTEND;TZID=America/New_York:${local(e.date, e.hour, e.durationMin)}`,
      `SUMMARY:${esc(e.title)}`,
      `LOCATION:${esc(e.location)}`,
      `DESCRIPTION:${esc(e.description)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
