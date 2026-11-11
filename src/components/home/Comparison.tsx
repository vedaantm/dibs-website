import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const ROWS: [string, string, string, string][] = [
  ["Cost", "Free to join, lenders pay 5–10% per completed rental", "Free", "Full price"],
  ["Verified student network", "Yes, .edu", "No", "—"],
  ["Daily & weekly pricing", "Yes", "Sale only", "Full price"],
  ["Payment held until handoff", "Yes", "No, cash or Venmo", "—"],
  ["Damage protection", "Built in", "None", "—"],
  ["Renter reviews", "Yes", "No", "Store reviews"],
  ["Pickup", "Same-day on campus", "Unreliable", "2–5 day shipping"],
];

export function Comparison() {
  return (
    <section aria-labelledby="compare-title" className="py-16 md:py-24">
      <Container>
        <h2 id="compare-title" className="section-title mb-8 max-w-3xl md:mb-12">
          Why not just use Marketplace?
        </h2>
        <Reveal className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <caption className="sr-only">Dibs compared with Facebook Marketplace and group chats, and buying retail</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="w-[24%] py-3 pr-4">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className="label w-[28%] py-3 pr-4">
                  Dibs
                </th>
                <th scope="col" className="label w-[26%] py-3 pr-4 text-stone-deep">
                  FB Marketplace &amp; group chats
                </th>
                <th scope="col" className="label w-[22%] py-3 text-stone-deep">
                  Buying retail
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, dibs, mkt, retail]) => (
                <tr key={label} className="border-b border-line align-top">
                  <th scope="row" className="eyebrow py-4 pr-4 font-normal text-stone-deep">
                    {label}
                  </th>
                  <td className="py-4 pr-4 font-medium">{dibs}</td>
                  <td className="py-4 pr-4 text-stone-deep">{mkt}</td>
                  <td className="py-4 text-stone-deep">{retail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p className="mt-6 max-w-2xl text-stone-deep">
          Marketplace is free because you carry the risk. The fee pays for the hold, the reviews and the damage protection.
        </p>
      </Container>
    </section>
  );
}
