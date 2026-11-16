import clsx from "clsx";
import { BadgeCheck } from "lucide-react";
import { LEVEL_LABEL, type VerificationLevel } from "@/lib/verification";

/** Small navy badge: EMAIL VERIFIED / ID VERIFIED / TRUSTED LENDER. Trusted is filled. */
export function VerificationBadge({ level, className }: { level: VerificationLevel; className?: string }) {
  if (level === "none") {
    return (
      <span className={clsx("inline-flex h-5 items-center whitespace-nowrap border border-stone px-1.5 text-[10px] font-medium uppercase leading-none tracking-[0.06em] text-stone-deep", className)}>
        {LEVEL_LABEL.none}
      </span>
    );
  }
  return (
    <span
      className={clsx(
        "inline-flex h-5 items-center gap-1 whitespace-nowrap border border-navy px-1.5 text-[10px] font-medium uppercase leading-none tracking-[0.06em]",
        level === "trusted" ? "bg-navy text-paper" : "text-navy",
        className,
      )}
    >
      <BadgeCheck size={12} strokeWidth={1.5} aria-hidden />
      {LEVEL_LABEL[level]}
    </span>
  );
}
