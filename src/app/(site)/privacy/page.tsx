import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = { title: "Privacy" };

const POINTS = [
  ["What this demo stores", "Your bag, wishlist and demo orders live in this browser's local storage. Checkout progress lives in session storage and clears when you close the tab. Nothing is sent to a server."],
  ["Card details", "Card fields stay in the page's memory while you type and are cleared after the demo hold. They are never stored, logged or sent anywhere."],
  ["Student ID photos", "The ID photo is shown as a preview in your browser only. It is never uploaded."],
  ["At launch", "Dibs will store your verified school email, name and mobile number to run handoffs, and nothing it doesn't need. Lenders see your first name, last initial, school and reviews, never your ID or full email."],
  ["Clearing it", "Clear this site's data in your browser settings to remove everything the demo saved."],
];

export default function PrivacyPage() {
  return (
    <Container className="pb-24 pt-12 md:pt-20">
      <Eyebrow>Privacy · Pilot preview</Eyebrow>
      <h1 className="section-title mt-3">Privacy</h1>
      <dl className="mt-10 max-w-2xl border-t border-line">
        {POINTS.map(([t, d]) => (
          <div key={t} className="grid gap-2 border-b border-line py-5 md:grid-cols-[200px_1fr] md:gap-8">
            <dt className="label">{t}</dt>
            <dd>{d}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
