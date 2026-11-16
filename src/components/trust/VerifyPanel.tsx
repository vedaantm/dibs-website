"use client";

import { useId, useState } from "react";
import { DEMO_CODE, DEMO_EMAIL } from "@/components/checkout/StepVerify";
import { IdDropzone } from "@/components/checkout/IdDropzone";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { CAMPUS } from "@/data/campus";
import { validEduEmail } from "@/lib/card";
import { useProfile } from "@/store/trust";
import { useMyVerification } from "./useMyLevel";

/**
 * Inline verification for people who haven't been through checkout: .edu email + code,
 * then (when `needId`) a student ID photo. Demo: the code is shown, the ID is approved on upload.
 */
export function VerifyPanel({ needId }: { needId: boolean }) {
  const uid = useId();
  const { facts } = useMyVerification();
  const verifyEmail = useProfile((s) => s.verifyEmail);
  const verifyId = useProfile((s) => s.verifyId);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!facts.emailVerified) {
    return (
      <div className="flex flex-col gap-4">
        <Field
          label="School email"
          htmlFor={`${uid}-email`}
          error={!sent ? err : null}
          hint={sent ? `Demo code: ${DEMO_CODE}` : `Must end in @${CAMPUS.emailDomain}`}
        >
          <div className="flex gap-2">
            <Input
              id={`${uid}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={DEMO_EMAIL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={(!sent && Boolean(err)) || undefined}
            />
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {
                if (!validEduEmail(email, CAMPUS.emailDomain)) return setErr(`Use your ${CAMPUS.name} email.`);
                setErr(null);
                setSent(true);
              }}
            >
              {sent ? "Resend" : "Send code"}
            </Button>
          </div>
        </Field>
        {sent && (
          <Field label="Six-digit code" htmlFor={`${uid}-code`} error={err}>
            <div className="flex gap-2">
              <Input
                id={`${uid}-code`}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="tabular-nums tracking-[0.3em]"
                aria-invalid={Boolean(err) || undefined}
              />
              <Button
                className="shrink-0"
                onClick={() => {
                  if (code !== DEMO_CODE) return setErr("That code didn't match.");
                  setErr(null);
                  verifyEmail(email);
                }}
              >
                Verify
              </Button>
            </div>
          </Field>
        )}
      </div>
    );
  }

  if (needId && !facts.idVerified) {
    return (
      <div className="flex flex-col gap-2">
        <IdDropzone done={false} onFile={() => verifyId()} />
        <p className="text-[12px] text-stone-deep">In the pilot a person at Dibs checks the photo once. The demo approves it straight away.</p>
      </div>
    );
  }
  return null;
}
