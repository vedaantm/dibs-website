import { Accordion, AccordionItem } from "@/components/ui/Accordion";

export type FaqEntry = { q: string; a: string };

export function Faq({ items, id = "faq", title = "Questions" }: { items: FaqEntry[]; id?: string; title?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
      <h2 id={`${id}-title`} className="section-title">
        {title}
      </h2>
      <Accordion>
        {items.map((f, i) => (
          <AccordionItem key={f.q} title={f.q} defaultOpen={i === 0}>
            <p className="max-w-prose">{f.a}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/** Numbered editorial rows, the long version of the homepage How it works. */
export function StepList({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="border-t border-line">
      {steps.map((s, i) => (
        <li key={s.title} className="grid grid-cols-[56px_1fr] gap-x-4 border-b border-line py-5 md:grid-cols-[96px_240px_1fr] md:items-baseline md:gap-x-8">
          <span aria-hidden className="text-[32px] font-light leading-none tabular-nums text-stone md:text-[48px]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="label pt-1 md:pt-0">{s.title}</h3>
          <p className="col-start-2 mt-1 max-w-prose text-stone-deep md:col-start-auto md:mt-0 md:text-ink">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
