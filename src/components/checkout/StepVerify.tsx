"use client";

import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { CAMPUS } from "@/data/campus";
import { digits, formatPhone, validEduEmail } from "@/lib/card";
import { useReducedMotion } from "@/lib/hooks";
import { useCheckout } from "@/store/checkout";
import { useProfile } from "@/store/trust";
import { IdDropzone } from "./IdDropzone";
import { OtpInput } from "./OtpInput";

export const DEMO_CODE = "482913";
export const DEMO_EMAIL = `maya.k@${CAMPUS.emailDomain}`;

export function StepVerify({ onToast }: { onToast: (m: string) => void }) {
  const c = useCheckout();
  const reduced = useReducedMotion();
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState(c.demoFill ? DEMO_CODE : "");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; id?: string }>({});

  const sendCode = () => {
    if (!validEduEmail(c.email, CAMPUS.emailDomain)) {
      setEmailErr(`Use your ${CAMPUS.name} email — Dibs is students only.`);
      return;
    }
    setEmailErr(null);
    setSending(true);
    setTimeout(() => {
      setSending(false);
      c.set({ codeSent: true });
      onToast(`Demo code: ${DEMO_CODE}`);
    }, 1200);
  };

  const checkCode = () => {
    if (code === DEMO_CODE) {
      setCodeErr(null);
      c.set({ verified: true });
      useProfile.getState().verifyEmail(c.email);
    } else {
      setCodeErr("That code didn't match.");
      if (!reduced) setShake((s) => s + 1);
    }
  };

  const next = () => {
    const e: typeof errors = {};
    if (!c.name.trim()) e.name = "Enter your full name.";
    if (digits(c.phone).length !== 10) e.phone = "Enter a 10-digit US mobile number.";
    if (c.idStatus === "none") e.id = "Add a photo of your ID, or skip it for the demo.";
    setErrors(e);
    if (Object.keys(e).length === 0) c.complete(1);
  };

  return (
    <div className="flex max-w-xl flex-col gap-6">
      {c.verified ? (
        <p className="flex items-center gap-2" role="status">
          <BadgeCheck size={20} strokeWidth={1.5} className="text-navy" aria-hidden />
          <span>
            <span className="label">Verified</span> — {c.email.trim().toLowerCase()}
          </span>
        </p>
      ) : (
        <>
          <Field label="School email" htmlFor="co-email" error={emailErr} hint={`Must end in @${CAMPUS.emailDomain}`}>
            <div className="flex gap-2">
              <Input
                id="co-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={DEMO_EMAIL}
                value={c.email}
                aria-invalid={Boolean(emailErr) || undefined}
                aria-describedby={emailErr ? "co-email-error" : "co-email-hint"}
                onChange={(e) => c.set({ email: e.target.value, codeSent: false })}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), sendCode())}
              />
              <Button variant={c.codeSent ? "outline" : "solid"} onClick={sendCode} loading={sending} className="shrink-0">
                {c.codeSent ? "Resend" : "Send code"}
              </Button>
            </div>
          </Field>
          {c.codeSent && (
            <div className="flex flex-col gap-2">
              <span className="eyebrow text-ink" id="co-otp-label">
                Six-digit code
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <OtpInput value={code} onChange={setCode} invalid={Boolean(codeErr)} shakeKey={shake} describedBy="co-otp-label" />
                <Button variant="outline" onClick={checkCode} disabled={code.length !== 6}>
                  Verify
                </Button>
              </div>
              {codeErr && (
                <p role="alert" className="text-[12px] text-vermilion-deep">
                  {codeErr}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {c.verified && (
        <>
          <Field label="Full name" htmlFor="co-name" error={errors.name}>
            <Input
              id="co-name"
              autoComplete="name"
              value={c.name}
              onChange={(e) => c.set({ name: e.target.value })}
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "co-name-error" : undefined}
            />
          </Field>
          <Field label="Mobile number" htmlFor="co-phone" hint="For handoff texts only" error={errors.phone}>
            <Input
              id="co-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(212) 555-0134"
              value={c.phone}
              onChange={(e) => c.set({ phone: formatPhone(e.target.value) })}
              aria-invalid={Boolean(errors.phone) || undefined}
              aria-describedby={errors.phone ? "co-phone-error" : "co-phone-hint"}
            />
          </Field>
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-ink">Student ID</span>
            <IdDropzone done={c.idStatus === "skipped"} onFile={() => {
              c.set({ idStatus: "uploaded" });
              useProfile.getState().verifyId();
            }} />
            <div className="flex items-center justify-between">
              {errors.id ? (
                <p role="alert" className="text-[12px] text-vermilion-deep">
                  {errors.id}
                </p>
              ) : (
                <span />
              )}
              {c.idStatus !== "uploaded" && (
                <Button variant="text" onClick={() => c.set({ idStatus: "skipped" })}>
                  Skip for demo
                </Button>
              )}
            </div>
          </div>
          <Button onClick={next} className="self-start">
            Continue to handoff
          </Button>
        </>
      )}
    </div>
  );
}
