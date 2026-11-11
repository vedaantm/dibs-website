"use client";

import "./globals.css";

export default function GlobalError() {
  return (
    <html lang="en">
      <body className="bg-paper text-ink">
        <main className="mx-auto max-w-xl px-4 py-24">
          <p className="eyebrow text-stone-deep">Dibs</p>
          <h1 className="section-title mt-3">Something broke.</h1>
          <p className="mt-4 text-stone-deep">Reload the page. Your bag is saved in this browser.</p>
          {/* full reload on purpose: the app shell itself failed */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="label mt-8 inline-block underline underline-offset-4">
            Back to the shop
          </a>
        </main>
      </body>
    </html>
  );
}
