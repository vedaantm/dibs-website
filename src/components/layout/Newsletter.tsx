"use client";

import { useState } from "react";

/** "Drops, not spam." No network call: submitting just shows the confirmation. */
export function Newsletter() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  return (
    <div className="max-w-md">
      <h2 className="label">Newsletter</h2>
      <p className="mt-2 text-paper/80">Drops, not spam. New listings every Thursday.</p>
      {done ? (
        <p className="mt-4 h-12 leading-[48px]" role="status">
          You&apos;re on the list.
        </p>
      ) : (
        <form
          className="mt-4 flex"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setDone(true);
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@nyu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 min-w-0 flex-1 rounded-[2px] border border-paper/40 bg-transparent px-3 text-paper placeholder:text-paper/60 focus:border-paper focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 shrink-0 bg-paper px-5 text-[13px] font-medium uppercase tracking-[0.04em] text-ink transition-colors duration-200 hover:bg-bone"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
