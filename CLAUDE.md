# Dibs — student item rentals (demo site)

Peer-to-peer rental marketplace for university students. Pilot campus: NYU (Washington Square).
Rent sports gear, textbooks, formal outfits, costumes, cameras/tech, tailgate gear and dorm essentials
from verified (.edu) classmates. Daily / weekend / weekly / semester rates, refundable security
deposit on items worth $100+ (pre-authorized, not charged), on-campus handoff. Free to join: renters pay
only when they rent; lenders pay a tiered fee (5% / 8% / 10% by item value, first rental free) on
completed rentals. There is no membership anywhere on the site.
This is a pitch demo: no backend. Data lives in /src/data. Bag + wishlist persist in localStorage.

## Stack
Next.js (App Router, latest stable) · TypeScript strict · Tailwind CSS v4 · Zustand (persist) ·
date-fns · react-day-picker · lucide-react (strokeWidth 1.25) · vitest for unit tests.
No UI kits (no shadcn, no MUI, no Chakra). Build components by hand.

## Design reference
Modeled on atticusfinchclothing.com.au: quiet editorial menswear store. Full-bleed hero, thin
wide-tracked centered wordmark, MENU + search on the left, wishlist/account/bag on the right with tiny
navy count badges, 2:3 product shots on a warm blush backdrop, UPPERCASE product names with price
right-aligned on the same line, slide-in basket drawer, search overlay, accordions on product pages.

## Tokens (defined in src/app/globals.css under @theme)
ink #16130F · paper #F6F2EC · bone #ECE4DA · blush #E7DAD1 · stone #8A8178 · line #D9D0C5 ·
navy #13294B · vermilion #D9472B (accent, use rarely)
Gradients: --g-lastlight, --g-dusk, --g-turf, --g-chalk (layered radial + .grain overlay). Max one
gradient block per screen height. Never use Tailwind bg-gradient-to-* utilities.

## Type
Body/UI: "Helvetica Neue", Helvetica, Arial, sans-serif — 13px desktop / 14px mobile.
Labels, nav, product names: uppercase, 13px, weight 500, tracking 0.02em.
Section titles: uppercase 28–40px weight 500. Wordmark: Archivo (wght 300, wdth 125, tracking .18em).
Prices: tabular-nums, format "$24 / day".

## Rules
- Square corners (radius 0; inputs max 2px). 1px hairlines in `line`. No drop shadows except the drawer.
- Product imagery always 2:3 on blush; second image fades in on hover (250ms).
- Grid: 4 cols desktop / 3 tablet / 2 mobile; gap-x 24px, gap-y 48px; gutters 24px / 16px.
- Motion 200–300ms cubic-bezier(.2,.7,.2,1). Respect prefers-reduced-motion. No parallax.
- BANNED: purple/blue or pink/orange gradients, gradient text, glassmorphism, glow blobs, rounded-2xl
  shadow cards, pill buttons, emoji, centered 3-icon feature grids, fake 5-star testimonials,
  words like seamless/unlock/elevate/revolutionize.
- Copy: short, specific, slightly dry, like a real campus shop. Real numbers, real places.
- Customer research (12-person survey + 4 interviews) sets priorities: textbooks first, sports gear
  second; formal and costumes are seasonal. Trust shows everywhere: payment held by Dibs until the
  handoff code is scanned, renter reviews, condition photos, .edu verification.
- Sample data is labeled once in the announcement bar and footer as "Pilot preview — sample listings".
- Accessibility: semantic HTML, visible focus ring (2px navy, 2px offset), alt text on every image,
  keyboard-operable drawer/menus with focus trap and Esc to close, color contrast AA.
- Mobile-first. Check 375px, 768px, 1280px and 1600px before calling any task done.

## Workflow
- After each task: `npm run lint && npm run build` must pass; fix all errors; then git commit with a
  clear message. Do not push unless asked.
- Keep components small and in src/components/<area>/. Pure logic (pricing, dates) in src/lib with tests.
