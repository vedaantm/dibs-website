import { Container } from "@/components/ui/Container";

/** Blush blocks in the exact ProductCard shape. No shimmer. */
export function CardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[2/3] bg-blush" />
      <div className="mt-3 flex justify-between gap-3">
        <div className="h-3 w-2/3 bg-blush" />
        <div className="h-3 w-12 bg-blush" />
      </div>
      <div className="mt-2 h-3 w-1/2 bg-bone" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <CardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export function PageSkeleton() {
  return (
    <Container className="pb-20 pt-10" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-32 bg-bone" />
      <div className="mt-6 h-9 w-64 bg-blush" />
      <div className="mt-3 h-3 w-80 max-w-full bg-bone" />
      <div className="mb-10 mt-8 h-12 border-y border-line" />
      <GridSkeleton />
    </Container>
  );
}

export function ItemSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[3fr_2fr] lg:px-6 lg:pt-6" aria-busy="true" aria-label="Loading">
      <div className="aspect-[2/3] bg-blush" />
      <div className="flex flex-col gap-4 px-4 pt-6 md:px-6 lg:px-12">
        <div className="h-3 w-40 bg-bone" />
        <div className="mt-3 h-3 w-20 bg-bone" />
        <div className="h-6 w-3/4 bg-blush" />
        <div className="h-4 w-2/3 bg-bone" />
        <div className="mt-6 h-10 border border-line" />
        <div className="h-72 bg-bone/60" />
      </div>
    </div>
  );
}
