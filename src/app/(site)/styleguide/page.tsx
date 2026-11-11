import type { Metadata } from "next";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Checkbox, Field, Input, Radio, Select } from "@/components/ui/Field";
import { Hairline } from "@/components/ui/Hairline";
import { IconButton } from "@/components/ui/IconButton";
import { Price } from "@/components/ui/Price";
import { Tag } from "@/components/ui/Tag";
import { Wordmark } from "@/components/ui/Wordmark";
import { StyleguideExtras } from "./StyleguideExtras";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

const swatches = [
  { name: "ink", hex: "#16130F", cls: "bg-ink", text: "text-paper" },
  { name: "paper", hex: "#F6F2EC", cls: "bg-paper", text: "text-ink" },
  { name: "bone", hex: "#ECE4DA", cls: "bg-bone", text: "text-ink" },
  { name: "blush", hex: "#E7DAD1", cls: "bg-blush", text: "text-ink" },
  { name: "stone", hex: "#8A8178", cls: "bg-stone", text: "text-ink" },
  { name: "stone-deep (text)", hex: "#6B635B", cls: "bg-stone-deep", text: "text-paper" },
  { name: "line", hex: "#D9D0C5", cls: "bg-line", text: "text-ink" },
  { name: "navy", hex: "#13294B", cls: "bg-navy", text: "text-paper" },
  { name: "vermilion", hex: "#D9472B", cls: "bg-vermilion", text: "text-ink" },
];

const gradients = [
  { name: "LAST LIGHT", cls: "bg-lastlight", use: "Hero wash, confirmation", dark: true },
  { name: "LIBRARY DUSK", cls: "bg-dusk", use: "Pricing band, checkout summary", dark: true },
  { name: "TURF", cls: "bg-turf", use: "Sports & tailgate, ski trip edit", dark: true },
  { name: "CHALK", cls: "bg-chalk", use: "How it works, pickup points", dark: false },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-12">
      <Eyebrow className="mb-6">{title}</Eyebrow>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <Container className="pb-24 pt-10">
      <h1 className="section-title">Styleguide</h1>
      <p className="mt-2 max-w-xl text-stone-deep">
        Every token and primitive in one place. Check here before building pages. Not linked in the nav.
      </p>

      <Section title="Colour tokens">
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map((s) => (
            <div key={s.name} className={`${s.cls} ${s.text} flex aspect-[4/3] flex-col justify-end p-3`}>
              <span className="label">{s.name}</span>
              <span className="tabular-nums text-[12px]">{s.hex}</span>
            </div>
          ))}
        </div>
      </Section>
      <Hairline />

      <Section title="Signature gradients (layered radial + grain)">
        <div className="grid gap-6 md:grid-cols-2">
          {gradients.map((g) => (
            <div
              key={g.name}
              className={`${g.cls} grain flex aspect-[16/10] flex-col justify-end p-6 ${g.dark ? "text-paper" : "text-ink"}`}
            >
              <span className="relative z-[2] label">{g.name}</span>
              <span className="relative z-[2] text-[12px] opacity-80">{g.use}</span>
            </div>
          ))}
        </div>
      </Section>
      <Hairline />

      <Section title="Wordmark">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex aspect-[16/9] items-center justify-center border border-line bg-paper">
            <Wordmark size="lg" />
          </div>
          <div className="bg-lastlight grain flex aspect-[16/9] items-center justify-center">
            <Wordmark size="lg" tone="paper" className="relative z-[2]" />
          </div>
        </div>
      </Section>
      <Hairline />

      <Section title="Type">
        <div className="flex flex-col gap-6">
          <div>
            <Eyebrow>Section title · 28–40px · 500 · uppercase</Eyebrow>
            <p className="section-title mt-2">Just listed</p>
          </div>
          <div>
            <Eyebrow>Label / nav / product name · 13px · 500 · .02em</Eyebrow>
            <p className="label mt-2">Burton Ripcord Snowboard, 154cm</p>
          </div>
          <div>
            <Eyebrow>Body · 13px desktop / 14px mobile</Eyebrow>
            <p className="mt-2 max-w-prose">
              Used for one ski trip to Hunter. Waxed in January. Bindings set for boot size 10–11. Pick up at Bobst,
              9am–10pm.
            </p>
          </div>
          <div>
            <Eyebrow>Eyebrow · 11px · .08em · stone</Eyebrow>
            <Eyebrow className="mt-2">Finals season / Fall 2026</Eyebrow>
          </div>
          <div>
            <Eyebrow>Prices · tabular-nums</Eyebrow>
            <div className="mt-2 flex flex-wrap items-baseline gap-6">
              <Price amount={24} unit="day" />
              <Price amount={11} unit="week" uppercase />
              <Price amount={35} unit="day" retail={799} />
            </div>
          </div>
        </div>
      </Section>
      <Hairline />

      <Section title="Buttons">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Call dibs — $75</Button>
            <Button variant="outline">View bag</Button>
            <Button variant="text">Add to wishlist</Button>
            <Button loading>Authorizing</Button>
            <Button disabled>Select dates</Button>
            <Button variant="outline" disabled>
              Unavailable
            </Button>
            <Button size="sm">Small</Button>
          </div>
          <div className="max-w-sm">
            <Button full>Checkout</Button>
          </div>
          <div className="bg-ink flex flex-wrap gap-4 p-6 on-dark">
            <Button variant="solid-paper">Subscribe</Button>
            <Button variant="outline-paper">See pricing</Button>
          </div>
        </div>
      </Section>
      <Hairline />

      <Section title="Icon buttons + badges">
        <div className="flex items-center gap-2">
          <IconButton icon={Search} label="Search" />
          <IconButton icon={Heart} label="Wishlist" count={3} />
          <IconButton icon={User} label="Account" />
          <IconButton icon={ShoppingBag} label="Bag" count={12} />
        </div>
      </Section>
      <Hairline />

      <Section title="Tags">
        <div className="flex flex-wrap gap-3">
          <Tag>Just listed</Tag>
          <Tag>Weekend rate</Tag>
          <Tag tone="navy">Verified</Tag>
          <Tag>Cleaned between rentals</Tag>
          <Tag tone="vermilion">Dibs&apos;d</Tag>
          <span className="bg-ink inline-flex gap-3 p-2">
            <Tag tone="paper">On dark</Tag>
            <Tag tone="solid">Solid</Tag>
          </span>
        </div>
      </Section>
      <Hairline />

      <Section title="Accordion">
        <Accordion className="max-w-xl">
          <AccordionItem title="Description" defaultOpen>
            <p>Same edition your professor assigned. Margins clean, no highlighting past chapter 4.</p>
          </AccordionItem>
          <AccordionItem title="Deposit & damage">
            <p>The deposit is a hold on your card, not a charge. Released within 48 hours of a clean return.</p>
          </AccordionItem>
          <AccordionItem title="Pickup & return">
            <p>Hand off at Bobst, Kimmel or Palladium, 9am–10pm daily.</p>
          </AccordionItem>
        </Accordion>
      </Section>
      <Hairline />

      <Section title="Form controls">
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
          <Field label="School email" htmlFor="sg-email" hint="Must end in @nyu.edu">
            <Input id="sg-email" type="email" placeholder="maya.k@nyu.edu" />
          </Field>
          <Field label="School email" htmlFor="sg-email-err" error="Use your NYU email — Dibs is students only.">
            <Input id="sg-email-err" type="email" defaultValue="maya@gmail.com" aria-invalid />
          </Field>
          <Field label="Pickup spot" htmlFor="sg-select">
            <Select id="sg-select" defaultValue="bobst">
              <option value="bobst">Bobst Library</option>
              <option value="kimmel">Kimmel Center</option>
            </Select>
          </Field>
          <Field label="Disabled" htmlFor="sg-dis">
            <Input id="sg-dis" disabled placeholder="Not editable" />
          </Field>
          <div className="flex flex-col gap-3">
            <Checkbox id="sg-c1" label="I'll do the photo check-in" defaultChecked />
            <Checkbox id="sg-c2" label="Unchecked" description="With a description line" />
            <Checkbox id="sg-c3" label="Disabled" disabled />
          </div>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Example radios">
            <Radio id="sg-r1" name="sg-r" label="Bobst Library" description="70 Washington Square South" defaultChecked />
            <Radio id="sg-r2" name="sg-r" label="Kimmel Center" description="60 Washington Square South" />
            <Radio id="sg-r3" name="sg-r" label="Disabled" disabled />
          </div>
        </div>
      </Section>

      <StyleguideExtras />
    </Container>
  );
}
