import { describe, expect, it } from "vitest";
import { buildIcs } from "./ics";

describe("buildIcs", () => {
  const ics = buildIcs(
    [
      { uid: "DB-1-pickup@dibs", title: "Dibs pickup: Burton", date: "2026-11-13", hour: 14, durationMin: 60, location: "Bobst Library, 70 Washington Square South", description: "Code 4821" },
      { uid: "DB-1-return@dibs", title: "Dibs return", date: "2026-11-15", hour: 23, durationMin: 90, location: "Bobst", description: "Line one\nLine two" },
    ],
    new Date(Date.UTC(2026, 10, 11, 15, 30, 0)),
  );

  it("wraps events in a calendar with CRLF line endings", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  });

  it("uses New York local times and rolls past midnight", () => {
    expect(ics).toContain("DTSTART;TZID=America/New_York:20261113T140000");
    expect(ics).toContain("DTEND;TZID=America/New_York:20261113T150000");
    expect(ics).toContain("DTEND;TZID=America/New_York:20261116T003000");
    expect(ics).toContain("DTSTAMP:20261111T153000Z");
  });

  it("escapes commas and newlines", () => {
    expect(ics).toContain("LOCATION:Bobst Library\\, 70 Washington Square South");
    expect(ics).toContain("DESCRIPTION:Line one\\nLine two");
  });
});
