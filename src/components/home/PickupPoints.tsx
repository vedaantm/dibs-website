import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CAMPUS, PICKUP_SPOTS } from "@/data/campus";

/** Like Atticus's store block: pickup spots with address and where exactly to stand. */
export function PickupPoints({ id = "pickup" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bg-chalk py-16 md:py-24">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 id={`${id}-title`} className="section-title">
            Pickup points
          </h2>
          <div className="flex flex-col gap-1 md:items-end">
            <Eyebrow tone="ink">Handoffs {CAMPUS.handoffHours}</Eyebrow>
            <Eyebrow>Photo check-in at pickup and return</Eyebrow>
          </div>
        </div>
        <ul className="mt-10 grid gap-x-6 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {PICKUP_SPOTS.map((s) => (
            <li key={s.id} className="border-b border-line py-6">
              <p className="label">{s.name}</p>
              <p className="mt-1">{s.address}</p>
              <p className="mt-1 text-stone-deep">{s.note}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
