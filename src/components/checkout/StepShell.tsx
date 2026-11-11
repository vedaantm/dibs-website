import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  n: number;
  title: string;
  state: "open" | "done" | "locked";
  summary?: ReactNode;
  onEdit?: () => void;
  children?: ReactNode;
};

/** Accordion-style step: big house number, title, collapsed one-line summary with EDIT when done. */
export function StepShell({ n, title, state, summary, onEdit, children }: Props) {
  const num = String(n).padStart(2, "0");
  return (
    <section
      aria-labelledby={`step-${n}-title`}
      aria-current={state === "open" ? "step" : undefined}
      className="border-b border-line py-6 md:py-8"
    >
      <div className="flex items-start gap-4 md:gap-6">
        <span aria-hidden className={clsx("text-[40px] font-light leading-none tabular-nums md:text-[56px]", "text-stone")}>
          {num}
        </span>
        <div className="min-w-0 flex-1 pt-1 md:pt-2">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id={`step-${n}-title`} className={clsx("text-[18px] font-medium uppercase md:text-[22px]", state === "locked" && "text-stone-deep")}>
              <span className="sr-only">Step {n}: </span>
              {title}
            </h2>
            {state === "done" && onEdit && (
              <button type="button" onClick={onEdit} className="eyebrow text-ink underline underline-offset-4 hover:no-underline">
                Edit<span className="sr-only"> {title}</span>
              </button>
            )}
          </div>
          {state === "done" && summary && <div className="mt-1 text-stone-deep">{summary}</div>}
        </div>
      </div>
      {state === "open" && <div className="mt-6 md:pl-[80px]">{children}</div>}
    </section>
  );
}
