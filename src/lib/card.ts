/**
 * Mock-payment helpers. Card data never leaves component state; these are pure checks.
 * Only Stripe's published test numbers are accepted in demo mode.
 */

export const TEST_CARDS = ["4242424242424242", "5555555555554444"];
export const DEMO_CARD_ERROR = "Demo mode — use 4242 4242 4242 4242";

export function digits(s: string): string {
  return s.replace(/\D/g, "");
}

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "Discover" | null;

export function detectBrand(number: string): CardBrand {
  const n = digits(number);
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(6011|65|64[4-9])/.test(n)) return "Discover";
  return null;
}

/** Groups digits in fours: "4242 4242 4242 4242". Max 19 digits. */
export function formatCardNumber(input: string): string {
  return digits(input)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "1228" -> "12/28"; keeps partial input sensible while typing. */
export function formatExpiry(input: string): string {
  const d = digits(input).slice(0, 4);
  if (d.length === 0) return "";
  if (d.length === 1) return d === "0" || d === "1" ? d : `0${d}/`;
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function luhn(number: string): boolean {
  const n = digits(number);
  if (n.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let v = Number(n[i]);
    if (double) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    sum += v;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isTestCard(number: string): boolean {
  return TEST_CARDS.includes(digits(number));
}

/** MM/YY in the current month or later. */
export function validExpiry(mmYY: string, now: Date = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmYY.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const y = now.getFullYear();
  const mo = now.getMonth() + 1;
  return year > y || (year === y && month >= mo);
}

export type CardFields = { number: string; expiry: string; cvc: string; zip: string };
export type CardErrors = Partial<Record<keyof CardFields, string>>;

export function validateCard(f: CardFields, now: Date = new Date()): CardErrors {
  const e: CardErrors = {};
  const n = digits(f.number);
  if (!n) e.number = "Enter a card number.";
  else if (!luhn(n)) e.number = "That card number isn't valid.";
  else if (!isTestCard(n)) e.number = DEMO_CARD_ERROR;
  if (!validExpiry(f.expiry, now)) e.expiry = "Use a future date, MM/YY.";
  const cvcLen = detectBrand(n) === "Amex" ? 4 : 3;
  if (digits(f.cvc).length !== cvcLen) e.cvc = `${cvcLen} digits on the back.`;
  if (!/^\d{5}$/.test(digits(f.zip))) e.zip = "5-digit ZIP.";
  return e;
}

/** "(212) 555-0134" while typing. */
export function formatPhone(input: string): string {
  const d = digits(input).replace(/^1/, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function validEduEmail(email: string, domain: string): boolean {
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+$/.test(e) && e.endsWith(`@${domain}`);
}
