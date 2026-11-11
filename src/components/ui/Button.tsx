import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline" | "text" | "solid-paper" | "outline-paper";

type Common = {
  variant?: ButtonVariant;
  full?: boolean;
  loading?: boolean;
  size?: "md" | "sm";
  children: ReactNode;
  className?: string;
};

export function buttonClasses({
  variant = "solid",
  full,
  size = "md",
  className,
}: Pick<Common, "variant" | "full" | "size" | "className">) {
  const isText = variant === "text";
  return clsx(
    "relative inline-flex select-none items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.04em] transition-[background-color,color,border-color,opacity] duration-200 ease-house",
    "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
    !isText && (size === "sm" ? "h-10 px-4" : "h-12 px-6"),
    full && "w-full",
    variant === "solid" &&
      "bg-ink text-paper hover:bg-[#2c2722] disabled:bg-stone-deep disabled:hover:bg-stone-deep",
    variant === "outline" &&
      "border border-ink text-ink hover:bg-ink hover:text-paper disabled:border-line disabled:text-stone-deep disabled:hover:bg-transparent",
    variant === "solid-paper" && "bg-paper text-ink hover:bg-bone",
    variant === "outline-paper" && "border border-paper text-paper hover:bg-paper hover:text-ink",
    isText &&
      "h-auto px-0 decoration-1 underline-offset-4 hover:underline disabled:text-stone-deep disabled:no-underline",
    className,
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent"
    />
  );
}

type ButtonProps = Common & Omit<ComponentProps<"button">, "children" | "className">;

export function Button({
  variant,
  full,
  loading,
  size,
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, full, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type LinkButtonProps = Common & Omit<ComponentProps<typeof Link>, "children" | "className">;

export function ButtonLink({ variant, full, size, children, className, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, full, size, className })} {...rest}>
      {children}
    </Link>
  );
}
