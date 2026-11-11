import { CAMPUS } from "@/data/campus";
import { LATE_FEE_POLICY } from "@/lib/fees";

/** The rental terms and the deposit & damage policy, in plain language. Shared by checkout and /terms. */
export function PolicyText({ which = "both" }: { which?: "terms" | "deposit" | "both" }) {
  return (
    <div className="flex flex-col gap-8 leading-relaxed">
      {which !== "deposit" && (
        <section aria-labelledby="pol-terms">
          <h3 id="pol-terms" className="label mb-3">
            Rental terms
          </h3>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>Dibs is open to verified {CAMPUS.name} students only. You confirm the item is for your own use.</li>
            <li>
              You pay the rental price plus {(CAMPUS.salesTaxRate * 100).toFixed(3)}% sales tax at checkout. There is no
              renter fee and no membership.
            </li>
            <li>Dibs holds your payment. The lender is paid only after you scan the handoff code at pickup.</li>
            <li>If the item isn&apos;t as pictured at pickup, don&apos;t scan the code. You get your money back.</li>
            <li>Return the item by 10pm on the return date, at the spot and window you chose.</li>
            <li>Cancel free up to 24 hours before pickup. Inside 24 hours, the first day is non-refundable.</li>
            <li>Handoffs run {CAMPUS.handoffHours}. Be on time; the lender can cancel after 15 minutes.</li>
          </ol>
        </section>
      )}
      {which !== "terms" && (
        <section aria-labelledby="pol-deposit">
          <h3 id="pol-deposit" className="label mb-3">
            Deposit &amp; damage policy
          </h3>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Items worth $100 or more carry a deposit. It is an authorization on your card, not a charge, and is released
              within 48 hours of a clean return.
            </li>
            <li>Items under $100 have no deposit.</li>
            <li>At pickup and return, both of you photograph the item in the app. Those photos are the record.</li>
            <li>Late returns: {LATE_FEE_POLICY}</li>
            <li>
              Damage beyond normal wear: Dibs compares the pickup and return photos. If the lender and renter both confirm,
              the repair or replacement cost comes from the deposit, up to the deposit amount.
            </li>
            <li>If you disagree, open a dispute within 48 hours. A person at Dibs reviews the photos and decides within 2 days.</li>
            <li>Normal wear (light scuffs, a creased spine) is never charged.</li>
          </ol>
        </section>
      )}
    </div>
  );
}
