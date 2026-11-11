import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode, Ref } from "react";

export const inputBase =
  "h-12 w-full rounded-[2px] border border-transparent bg-bone px-3 text-[14px] md:text-[13px] text-ink placeholder:text-stone-deep transition-colors duration-200 ease-house hover:border-line focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-vermilion-deep";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  hideLabel?: boolean;
};

/** Label + control + hint/error. Errors use vermilion and are linked via aria-describedby by the caller. */
export function Field({ label, htmlFor, hint, error, children, className, hideLabel }: FieldProps) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className={clsx("eyebrow text-ink", hideLabel && "sr-only")}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] text-vermilion-deep" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[12px] text-stone-deep">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ref,
  ...rest
}: ComponentProps<"input"> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={clsx(inputBase, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={clsx(inputBase, "h-auto min-h-24 py-3", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <div className={clsx("relative", className)}>
      <select className={clsx(inputBase, "appearance-none pr-9")} {...rest}>
        {children}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.25}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}

type CheckProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode };

/** Square 16px checkbox with an ink fill when checked. */
export function Checkbox({ label, description, className, id, ...rest }: CheckProps) {
  return (
    <label htmlFor={id} className={clsx("group flex cursor-pointer items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="peer mt-0.5 size-4 shrink-0 cursor-pointer appearance-none border border-ink bg-paper bg-center bg-no-repeat transition-colors duration-200 checked:bg-ink checked:bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22><path%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22%23F6F2EC%22%20stroke-width=%221.5%22/></svg>')] disabled:cursor-not-allowed disabled:border-line aria-invalid:border-vermilion-deep"
        {...rest}
      />
      <span className="flex flex-col gap-0.5">
        <span>{label}</span>
        {description && <span className="text-[12px] text-stone-deep">{description}</span>}
      </span>
    </label>
  );
}

/** Square-ish radio: hairline ring with a filled ink dot. */
export function Radio({ label, description, className, id, ...rest }: CheckProps) {
  return (
    <label htmlFor={id} className={clsx("flex cursor-pointer items-start gap-3", className)}>
      <input
        id={id}
        type="radio"
        className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-ink bg-paper transition-[border-width] duration-200 checked:border-[5px] disabled:cursor-not-allowed disabled:border-line"
        {...rest}
      />
      <span className="flex flex-col gap-0.5">
        <span>{label}</span>
        {description && <span className="text-[12px] text-stone-deep">{description}</span>}
      </span>
    </label>
  );
}
